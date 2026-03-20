import { create } from 'zustand';
import type { RecurringTask } from '../types';

const STORAGE_KEY = '4family_home_recurring';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): RecurringTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(tasks: RecurringTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

type RecurringState = {
  recurringTasks: RecurringTask[];
  addRecurring: (task: Omit<RecurringTask, 'id' | 'createdAt'>) => void;
  updateRecurring: (id: string, data: Partial<RecurringTask>) => void;
  deleteRecurring: (id: string) => void;
  toggleActive: (id: string) => void;
};

export const useRecurringStore = create<RecurringState>((set, get) => ({
  recurringTasks: loadFromStorage(),

  addRecurring: (task) => {
    const newTask: RecurringTask = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().recurringTasks, newTask];
    set({ recurringTasks: updated });
    saveToStorage(updated);
  },

  updateRecurring: (id, data) => {
    const updated = get().recurringTasks.map((t) =>
      t.id === id ? { ...t, ...data } : t,
    );
    set({ recurringTasks: updated });
    saveToStorage(updated);
  },

  deleteRecurring: (id) => {
    const updated = get().recurringTasks.filter((t) => t.id !== id);
    set({ recurringTasks: updated });
    saveToStorage(updated);
  },

  toggleActive: (id) => {
    const updated = get().recurringTasks.map((t) =>
      t.id === id ? { ...t, active: !t.active } : t,
    );
    set({ recurringTasks: updated });
    saveToStorage(updated);
  },
}));
