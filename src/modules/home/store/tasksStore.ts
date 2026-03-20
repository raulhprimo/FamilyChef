import { create } from 'zustand';
import { formatDateISO } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';
import type { RecurringTask, TaskInstance } from '../types';

const STORAGE_KEY = '4family_home_tasks';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): TaskInstance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(tasks: TaskInstance[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getWeekNumber(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function shouldGenerateForDay(task: RecurringTask, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=dom, 1=seg...

  switch (task.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return (task.weekDays ?? []).includes(dayOfWeek);
    case 'biweekly': {
      const weekNum = getWeekNumber(date);
      return weekNum % 2 === 0 && (task.weekDays ?? []).includes(dayOfWeek);
    }
    case 'monthly':
      return date.getDate() === (task.dayOfMonth ?? 1);
    case 'once':
      return false; // avulsas são criadas manualmente
    default:
      return false;
  }
}

export function generateInstances(
  recurringTasks: RecurringTask[],
  existingInstances: TaskInstance[],
): TaskInstance[] {
  const newInstances: TaskInstance[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeTasks = recurringTasks.filter((t) => t.active);

  for (const task of activeTasks) {
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const dateISO = formatDateISO(date);

      if (!shouldGenerateForDay(task, date)) continue;

      for (const memberId of task.assignedTo) {
        const exists = existingInstances.some(
          (inst) =>
            inst.recurringTaskId === task.id &&
            inst.dueDate === dateISO &&
            inst.assignedTo === memberId,
        );

        if (!exists) {
          // Also check newInstances to avoid duplicates within this generation
          const alreadyGenerated = newInstances.some(
            (inst) =>
              inst.recurringTaskId === task.id &&
              inst.dueDate === dateISO &&
              inst.assignedTo === memberId,
          );

          if (!alreadyGenerated) {
            newInstances.push({
              id: generateId(),
              recurringTaskId: task.id,
              name: task.name,
              category: task.category,
              assignedTo: memberId as MemberId,
              dueDate: dateISO,
              priority: 'normal',
              done: false,
            });
          }
        }
      }
    }
  }

  return newInstances;
}

type TasksState = {
  instances: TaskInstance[];
  generateFromRecurring: (recurringTasks: RecurringTask[]) => void;
  addInstance: (task: Omit<TaskInstance, 'id'>) => void;
  toggleDone: (id: string, doneBy: MemberId) => void;
  updateInstance: (id: string, data: Partial<TaskInstance>) => void;
  deleteInstance: (id: string) => void;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  instances: loadFromStorage(),

  generateFromRecurring: (recurringTasks) => {
    const existing = get().instances;
    const newInstances = generateInstances(recurringTasks, existing);
    if (newInstances.length > 0) {
      const updated = [...existing, ...newInstances];
      set({ instances: updated });
      saveToStorage(updated);
    }
  },

  addInstance: (task) => {
    const newTask: TaskInstance = {
      ...task,
      id: generateId(),
    };
    const updated = [...get().instances, newTask];
    set({ instances: updated });
    saveToStorage(updated);
  },

  toggleDone: (id, doneBy) => {
    const todayISO = formatDateISO(new Date());
    const updated = get().instances.map((t) => {
      if (t.id !== id) return t;
      if (t.done) {
        // Undo
        return { ...t, done: false, doneAt: undefined, doneBy: undefined, lateByDays: undefined };
      }
      // Mark done
      const dueDate = new Date(t.dueDate + 'T00:00:00');
      const today = new Date(todayISO + 'T00:00:00');
      const diffMs = today.getTime() - dueDate.getTime();
      const lateByDays = Math.max(0, Math.round(diffMs / 86_400_000));
      return {
        ...t,
        done: true,
        doneAt: new Date().toISOString(),
        doneBy,
        lateByDays,
      };
    });
    set({ instances: updated });
    saveToStorage(updated);
  },

  updateInstance: (id, data) => {
    const updated = get().instances.map((t) =>
      t.id === id ? { ...t, ...data } : t,
    );
    set({ instances: updated });
    saveToStorage(updated);
  },

  deleteInstance: (id) => {
    const updated = get().instances.filter((t) => t.id !== id);
    set({ instances: updated });
    saveToStorage(updated);
  },
}));
