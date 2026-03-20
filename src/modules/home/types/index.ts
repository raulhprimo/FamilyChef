import type { MemberId } from '../../../core/constants/members';

export type TaskFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'once';
export type TaskPriority = 'normal' | 'urgent';
export type TaskCategory = 'limpeza' | 'compras' | 'manutencao' | 'outros';

export type RecurringTask = {
  id: string;
  name: string;
  category: TaskCategory;
  assignedTo: MemberId[];
  frequency: TaskFrequency;
  weekDays?: number[];    // 0=dom, 1=seg... para weekly/biweekly
  dayOfMonth?: number;    // para monthly
  active: boolean;
  createdAt: string;
};

export type TaskInstance = {
  id: string;
  recurringTaskId?: string; // se gerada de recorrente
  name: string;
  category: TaskCategory;
  assignedTo: MemberId;
  dueDate: string;        // ISO date "YYYY-MM-DD"
  priority: TaskPriority;
  done: boolean;
  doneAt?: string;
  doneBy?: MemberId;
  lateByDays?: number;    // calculado na conclusão
  comment?: string;
};
