import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import { getFamilyId } from '../../../core/hooks/useFamilyId';
import { formatDateISO } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';
import type { RecurringTask, TaskInstance } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rowToInstance(row: Record<string, unknown>): TaskInstance {
  return {
    id: row.id as string,
    recurringTaskId: (row.recurring_task_id as string) ?? undefined,
    name: row.name as string,
    category: row.category as TaskInstance['category'],
    assignedTo: row.assigned_to as MemberId,
    dueDate: row.due_date as string,
    priority: row.priority as TaskInstance['priority'],
    done: row.done as boolean,
    doneAt: (row.done_at as string) ?? undefined,
    doneBy: (row.done_by as MemberId) ?? undefined,
    lateByDays: (row.late_by_days as number) ?? undefined,
    comment: (row.comment as string) ?? undefined,
  };
}

function getWeekNumber(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function shouldGenerateForDay(task: RecurringTask, date: Date): boolean {
  const dayOfWeek = date.getDay();
  switch (task.frequency) {
    case 'daily': return true;
    case 'weekly': return (task.weekDays ?? []).includes(dayOfWeek);
    case 'biweekly': return getWeekNumber(date) % 2 === 0 && (task.weekDays ?? []).includes(dayOfWeek);
    case 'monthly': return date.getDate() === (task.dayOfMonth ?? 1);
    case 'once': return false;
    default: return false;
  }
}

type TasksState = {
  instances: TaskInstance[];
  loading: boolean;
  fetchInstances: () => Promise<void>;
  generateFromRecurring: (recurringTasks: RecurringTask[]) => Promise<void>;
  addInstance: (task: Omit<TaskInstance, 'id'>) => Promise<void>;
  toggleDone: (id: string, doneBy: MemberId) => Promise<void>;
  updateInstance: (id: string, data: Partial<TaskInstance>) => Promise<void>;
  deleteInstance: (id: string) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  instances: [],
  loading: true,

  fetchInstances: async () => {
    const familyId = getFamilyId();
    let query = supabase.from('home_task_instances').select('*');
    if (familyId) query = query.eq('family_id', familyId);
    const { data, error } = await query.order('due_date', { ascending: true });

    if (!error && data) {
      set({ instances: data.map(rowToInstance), loading: false });
    } else {
      set({ loading: false });
    }
  },

  generateFromRecurring: async (recurringTasks) => {
    const existing = get().instances;
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
          const exists = existing.some(
            (inst) => inst.recurringTaskId === task.id && inst.dueDate === dateISO && inst.assignedTo === memberId,
          ) || newInstances.some(
            (inst) => inst.recurringTaskId === task.id && inst.dueDate === dateISO && inst.assignedTo === memberId,
          );

          if (!exists) {
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

    if (newInstances.length > 0) {
      set((s) => ({ instances: [...s.instances, ...newInstances] }));

      const rows = newInstances.map((inst) => ({
        family_id: getFamilyId(),
        id: inst.id,
        recurring_task_id: inst.recurringTaskId ?? null,
        name: inst.name,
        category: inst.category,
        assigned_to: inst.assignedTo,
        due_date: inst.dueDate,
        priority: inst.priority,
        done: false,
      }));
      await supabase.from('home_task_instances').insert(rows);
    }
  },

  addInstance: async (task) => {
    const id = generateId();
    const newTask: TaskInstance = { ...task, id };
    set((s) => ({ instances: [...s.instances, newTask] }));

    await supabase.from('home_task_instances').insert({
      family_id: getFamilyId(),
      id,
      recurring_task_id: task.recurringTaskId ?? null,
      name: task.name,
      category: task.category,
      assigned_to: task.assignedTo,
      due_date: task.dueDate,
      priority: task.priority,
      done: task.done,
      done_at: task.doneAt ?? null,
      done_by: task.doneBy ?? null,
      comment: task.comment ?? null,
    });
  },

  toggleDone: async (id, doneBy) => {
    const todayISO = formatDateISO(new Date());
    let lateByDays: number | undefined;

    set((s) => ({
      instances: s.instances.map((t) => {
        if (t.id !== id) return t;
        if (t.done) {
          return { ...t, done: false, doneAt: undefined, doneBy: undefined, lateByDays: undefined };
        }
        const dueDate = new Date(t.dueDate + 'T00:00:00');
        const today = new Date(todayISO + 'T00:00:00');
        const diffMs = today.getTime() - dueDate.getTime();
        lateByDays = Math.max(0, Math.round(diffMs / 86_400_000));
        return { ...t, done: true, doneAt: new Date().toISOString(), doneBy, lateByDays };
      }),
    }));

    const task = get().instances.find((t) => t.id === id);
    if (task) {
      await supabase.from('home_task_instances').update({
        done: task.done,
        done_at: task.doneAt ?? null,
        done_by: task.doneBy ?? null,
        late_by_days: task.lateByDays ?? null,
      }).eq('id', id);
    }
  },

  updateInstance: async (id, data) => {
    set((s) => ({
      instances: s.instances.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.category !== undefined) update.category = data.category;
    if (data.assignedTo !== undefined) update.assigned_to = data.assignedTo;
    if (data.dueDate !== undefined) update.due_date = data.dueDate;
    if (data.priority !== undefined) update.priority = data.priority;
    if (data.done !== undefined) update.done = data.done;
    if (data.comment !== undefined) update.comment = data.comment;

    await supabase.from('home_task_instances').update(update).eq('id', id);
  },

  deleteInstance: async (id) => {
    set((s) => ({ instances: s.instances.filter((t) => t.id !== id) }));
    await supabase.from('home_task_instances').delete().eq('id', id);
  },
}));
