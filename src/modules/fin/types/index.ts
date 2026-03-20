import type { MemberId } from '../../../core/constants/members';

export type ExpenseCategory = 'mercado' | 'conta' | 'transporte' | 'lazer' | 'outros';

/** Membros participantes do FamilyFin (Leticia fica de fora) */
export const FIN_MEMBER_IDS: MemberId[] = ['elaine', 'felipe', 'raul'];

export type Expense = {
  id: string;
  description: string;
  amount: number;           // em centavos
  category: ExpenseCategory;
  paidBy: MemberId[];       // quem pagou
  splitBetween: MemberId[]; // quem divide (default: todos do fin)
  customSplit?: Partial<Record<MemberId, number>>; // centavos por membro (se divisão custom)
  date: string;             // ISO date
  createdAt: string;
  isSettlement?: boolean;   // true = liquidação de dívida
};

export type Debt = {
  from: MemberId;
  to: MemberId;
  amount: number; // em centavos
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;   // em centavos
  currentAmount: number;  // em centavos
  deadline: string;       // ISO date
  color: string;
  contributions: { memberId: MemberId; amount: number; date: string }[];
  completed: boolean;
};

export type Budget = {
  category: ExpenseCategory;
  monthlyLimit: number; // em centavos
  month: string;        // "2026-03"
};

export type MonthSummary = {
  month: string;
  totalExpenses: number;
  byCategory: Record<ExpenseCategory, number>;
  byMember: Record<string, number>;
  debts: Debt[];
};

/** Formata centavos como R$ */
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Retorna o mês atual "YYYY-MM" */
export function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
