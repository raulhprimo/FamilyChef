import { create } from 'zustand';
import type { MemberId } from '../../../core/constants/members';
import type { Goal } from '../types';

const STORAGE_KEY = '4family_fin_goals';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function load(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

type GoalsState = {
  goals: Goal[];
  addGoal: (data: Omit<Goal, 'id' | 'contributions' | 'currentAmount' | 'completed'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, memberId: MemberId, amount: number) => boolean; // returns true if goal completed
  getGoalProgress: (goalId: string) => { percent: number; remaining: number; daysLeft: number };
};

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: load(),

  addGoal: (data) => {
    const goal: Goal = { ...data, id: generateId(), contributions: [], currentAmount: 0, completed: false };
    const updated = [...get().goals, goal];
    set({ goals: updated });
    save(updated);
  },

  updateGoal: (id, data) => {
    const updated = get().goals.map((g) => (g.id === id ? { ...g, ...data } : g));
    set({ goals: updated });
    save(updated);
  },

  deleteGoal: (id) => {
    const updated = get().goals.filter((g) => g.id !== id);
    set({ goals: updated });
    save(updated);
  },

  addContribution: (goalId, memberId, amount) => {
    const goals = get().goals.map((g) => {
      if (g.id !== goalId) return g;
      const contributions = [...g.contributions, { memberId, amount, date: new Date().toISOString().slice(0, 10) }];
      const currentAmount = g.currentAmount + amount;
      const completed = currentAmount >= g.targetAmount;
      return { ...g, contributions, currentAmount, completed };
    });
    set({ goals });
    save(goals);
    const goal = goals.find((g) => g.id === goalId);
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
