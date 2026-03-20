import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import type { RecurringTask } from '../types';
import type { MemberId } from '../../../core/constants/members';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rowToTask(row: Record<string, unknown>): RecurringTask {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as RecurringTask['category'],
    assignedTo: row.assigned_to as MemberId[],
    frequency: row.frequency as RecurringTask['frequency'],
    weekDays: row.week_days as number[] | undefined,
    dayOfMonth: row.day_of_month as number | undefined,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  };
}

type RecurringState = {
  recurringTasks: RecurringTask[];
  loading: boolean;
  fetchRecurring: () => Promise<void>;
  addRecurring: (task: Omit<RecurringTask, 'id' | 'createdAt'>) => Promise<void>;
  updateRecurring: (id: string, data: Partial<RecurringTask>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
};

export const useRecurringStore = create<RecurringState>((set, get) => ({
  recurringTasks: [],
  loading: true,

  fetchRecurring: async () => {
    const { data, error } = await supabase
      .from('home_recurring_tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ recurringTasks: data.map(rowToTask), loading: false });
    } else {
      set({ loading: false });
    }
  },

  addRecurring: async (task) => {
    const id = generateId();
    const newTask: RecurringTask = { ...task, id, createdAt: new Date().toISOString() };

    set((s) => ({ recurringTasks: [...s.recurringTasks, newTask] }));

    await supabase.from('home_recurring_tasks').insert({
      id,
      name: task.name,
      category: task.category,
      assigned_to: task.assignedTo,
      frequency: task.frequency,
      week_days: task.weekDays ?? null,
      day_of_month: task.dayOfMonth ?? null,
      active: task.active,
    });
  },

  updateRecurring: async (id, data) => {
    set((s) => ({
      recurringTasks: s.recurringTasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.category !== undefined) update.category = data.category;
    if (data.assignedTo !== undefined) update.assigned_to = data.assignedTo;
    if (data.frequency !== undefined) update.frequency = data.frequency;
    if (data.weekDays !== undefined) update.week_days = data.weekDays;
    if (data.dayOfMonth !== undefined) update.day_of_month = data.dayOfMonth;
    if (data.active !== undefined) update.active = data.active;

    await supabase.from('home_recurring_tasks').update(update).eq('id', id);
  },

  deleteRecurring: async (id) => {
    set((s) => ({ recurringTasks: s.recurringTasks.filter((t) => t.id !== id) }));
    await supabase.from('home_recurring_tasks').delete().eq('id', id);
  },

  toggleActive: async (id) => {
    const task = get().recurringTasks.find((t) => t.id === id);
    if (!task) return;
    const active = !task.active;
    set((s) => ({
      recurringTasks: s.recurringTasks.map((t) => (t.id === id ? { ...t, active } : t)),
    }));
    await supabase.from('home_recurring_tasks').update({ active }).eq('id', id);
  },
}));
