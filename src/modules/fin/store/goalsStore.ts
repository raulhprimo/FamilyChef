import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import { getFamilyId } from '../../../core/hooks/useFamilyId';
import type { MemberId } from '../../../core/constants/members';
import type { Goal } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rowToGoal(row: Record<string, unknown>, contributions: Goal['contributions']): Goal {
  return {
    id: row.id as string,
    name: row.name as string,
    targetAmount: row.target_amount as number,
    currentAmount: row.current_amount as number,
    deadline: row.deadline as string,
    color: row.color as string,
    completed: row.completed as boolean,
    contributions,
  };
}

type GoalsState = {
  goals: Goal[];
  loading: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (data: Omit<Goal, 'id' | 'contributions' | 'currentAmount' | 'completed'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, memberId: MemberId, amount: number) => Promise<boolean>;
  getGoalProgress: (goalId: string) => { percent: number; remaining: number; daysLeft: number };
};

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: true,

  fetchGoals: async () => {
    const familyId = getFamilyId();
    let goalsQuery = supabase.from('fin_goals').select('*');
    if (familyId) goalsQuery = goalsQuery.eq('family_id', familyId);
    const { data: goalsData, error: goalsErr } = await goalsQuery.order('created_at', { ascending: true });

    let contribQuery = supabase.from('fin_goal_contributions').select('*');
    if (familyId) contribQuery = contribQuery.eq('family_id', familyId);
    const { data: contribData } = await contribQuery.order('date', { ascending: true });

    if (!goalsErr && goalsData) {
      const contribsByGoal: Record<string, Goal['contributions']> = {};
      for (const c of contribData ?? []) {
        const goalId = c.goal_id as string;
        if (!contribsByGoal[goalId]) contribsByGoal[goalId] = [];
        contribsByGoal[goalId].push({
          memberId: c.member_id as MemberId,
          amount: c.amount as number,
          date: c.date as string,
        });
      }

      const goals = goalsData.map((row) =>
        rowToGoal(row, contribsByGoal[row.id as string] ?? []),
      );
      set({ goals, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addGoal: async (data) => {
    const id = generateId();
    const goal: Goal = { ...data, id, contributions: [], currentAmount: 0, completed: false };
    set((s) => ({ goals: [...s.goals, goal] }));

    await supabase.from('fin_goals').insert({
      family_id: getFamilyId(),
      id,
      name: data.name,
      target_amount: data.targetAmount,
      current_amount: 0,
      deadline: data.deadline,
      color: data.color,
      completed: false,
    });
  },

  updateGoal: async (id, data) => {
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)) }));
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.deadline !== undefined) update.deadline = data.deadline;
    if (data.color !== undefined) update.color = data.color;
    await supabase.from('fin_goals').update(update).eq('id', id);
  },

  deleteGoal: async (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    await supabase.from('fin_goals').delete().eq('id', id);
  },

  addContribution: async (goalId, memberId, amount) => {
    const goals = get().goals.map((g) => {
      if (g.id !== goalId) return g;
      const contributions = [...g.contributions, { memberId, amount, date: new Date().toISOString().slice(0, 10) }];
      const currentAmount = g.currentAmount + amount;
      const completed = currentAmount >= g.targetAmount;
      return { ...g, contributions, currentAmount, completed };
    });
    set({ goals });

    const goal = goals.find((g) => g.id === goalId);

    await supabase.from('fin_goal_contributions').insert({
      family_id: getFamilyId(),
      goal_id: goalId,
      member_id: memberId,
      amount,
      date: new Date().toISOString().slice(0, 10),
    });

    await supabase.from('fin_goals').update({
      current_amount: goal?.currentAmount ?? 0,
      completed: goal?.completed ?? false,
    }).eq('id', goalId);

    return goal?.completed ?? false;
  },

  getGoalProgress: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return { percent: 0, remaining: 0, daysLeft: 0 };
    const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000));
    return { percent, remaining, daysLeft };
  },
}));
