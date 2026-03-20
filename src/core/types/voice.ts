import type { MemberId } from '../constants/members';
import type { AgentId } from '../components/VoiceButton/constants';
import type { MealType } from '../types';
import type { TaskCategory, TaskPriority } from '../../modules/home/types';
import type { ExpenseCategory } from '../../modules/fin/types';

// === Ações que o LLM pode produzir ===

export type MealAction = {
  module: 'chef';
  action: 'add_meal';
  data: {
    date: string;
    type: MealType;
    dish: string;
    responsibleIds: MemberId[];
  };
};

export type TaskAction = {
  module: 'home';
  action: 'add_task';
  data: {
    name: string;
    category: TaskCategory;
    assignedTo: MemberId;
    dueDate: string;
    priority: TaskPriority;
  };
};

export type ExpenseAction = {
  module: 'fin';
  action: 'add_expense';
  data: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    paidBy: MemberId[];
    splitBetween: MemberId[];
    date: string;
  };
};

export type VoiceAction = MealAction | TaskAction | ExpenseAction;

export type ConfirmationItem = {
  id: string;
  action: VoiceAction;
  status: 'pending' | 'confirmed' | 'rejected';
  displayText: string;
};

export type VoiceProcessRequest = {
  audio: string;
  agentId: AgentId;
  activeMemberId: MemberId;
  todayISO: string;
};

export type VoiceProcessResponse = {
  transcript: string;
  actions: Array<{
    action: VoiceAction;
    displayText: string;
  }>;
  agentReply?: string;
};
