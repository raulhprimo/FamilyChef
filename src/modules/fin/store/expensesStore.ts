import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import type { MemberId } from '../../../core/constants/members';
import type { Expense, Debt, ExpenseCategory, MonthSummary } from '../types';
import { FIN_MEMBER_IDS } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    description: row.description as string,
    amount: row.amount as number,
    category: row.category as ExpenseCategory,
    paidBy: row.paid_by as MemberId[],
    splitBetween: row.split_between as MemberId[],
    customSplit: (row.custom_split as Partial<Record<MemberId, number>>) ?? undefined,
    date: row.date as string,
    createdAt: row.created_at as string,
    isSettlement: row.is_settlement as boolean | undefined,
  };
}

function calculateDebtsForMonth(expenses: Expense[], month: string): Debt[] {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
  const balance: Record<string, number> = {};
  for (const id of FIN_MEMBER_IDS) balance[id] = 0;

  for (const exp of monthExpenses) {
    const splitMembers = exp.splitBetween.length > 0 ? exp.splitBetween : FIN_MEMBER_IDS;
    const splitCount = splitMembers.length;

    if (exp.customSplit) {
      for (const memberId of splitMembers) {
        const owes = exp.customSplit[memberId as MemberId] ?? Math.round(exp.amount / splitCount);
        balance[memberId] = (balance[memberId] ?? 0) - owes;
      }
    } else {
      const perPerson = Math.round(exp.amount / splitCount);
      for (const memberId of splitMembers) {
        balance[memberId] = (balance[memberId] ?? 0) - perPerson;
      }
    }

    const payerCount = exp.paidBy.length;
    const perPayer = Math.round(exp.amount / payerCount);
    for (const payer of exp.paidBy) {
      balance[payer] = (balance[payer] ?? 0) + perPayer;
    }
  }

  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, bal] of Object.entries(balance)) {
    if (bal > 0) creditors.push({ id, amount: bal });
    else if (bal < 0) debtors.push({ id, amount: -bal });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const debts: Debt[] = [];
  let ci = 0, di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    if (transfer > 0) {
      debts.push({ from: debtors[di].id as MemberId, to: creditors[ci].id as MemberId, amount: transfer });
    }
    creditors[ci].amount -= transfer;
    debtors[di].amount -= transfer;
    if (creditors[ci].amount === 0) ci++;
    if (debtors[di].amount === 0) di++;
  }

  return debts;
}

type ExpensesState = {
  expenses: Expense[];
  loading: boolean;
  fetchExpenses: () => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByMonth: (month: string) => Expense[];
  calculateDebts: (month: string) => Debt[];
  getMonthSummary: (month: string) => MonthSummary;
};

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  loading: true,

  fetchExpenses: async () => {
    const { data, error } = await supabase
      .from('fin_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      set({ expenses: data.map(rowToExpense), loading: false });
    } else {
      set({ loading: false });
    }
  },

  addExpense: async (data) => {
    const id = generateId();
    const expense: Expense = { ...data, id, createdAt: new Date().toISOString() };
    set((s) => ({ expenses: [...s.expenses, expense] }));

    await supabase.from('fin_expenses').insert({
      id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      paid_by: data.paidBy,
      split_between: data.splitBetween,
      custom_split: data.customSplit ?? null,
      date: data.date,
      is_settlement: data.isSettlement ?? false,
    });
  },

  updateExpense: async (id, data) => {
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));

    const update: Record<string, unknown> = {};
    if (data.description !== undefined) update.description = data.description;
    if (data.amount !== undefined) update.amount = data.amount;
    if (data.category !== undefined) update.category = data.category;
    if (data.paidBy !== undefined) update.paid_by = data.paidBy;
    if (data.splitBetween !== undefined) update.split_between = data.splitBetween;
    if (data.date !== undefined) update.date = data.date;

    await supabase.from('fin_expenses').update(update).eq('id', id);
  },

  deleteExpense: async (id) => {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
    await supabase.from('fin_expenses').delete().eq('id', id);
  },

  getExpensesByMonth: (month) => {
    return get().expenses.filter((e) => e.date.startsWith(month) && !e.isSettlement);
  },

  calculateDebts: (month) => calculateDebtsForMonth(get().expenses, month),

  getMonthSummary: (month) => {
    const expenses = get().expenses.filter((e) => e.date.startsWith(month) && !e.isSettlement);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory: Record<ExpenseCategory, number> = {
      mercado: 0, conta: 0, transporte: 0, lazer: 0, outros: 0,
    };
    const byMember: Record<string, number> = {};

    for (const exp of expenses) {
      byCategory[exp.category] += exp.amount;
      for (const payer of exp.paidBy) {
        byMember[payer] = (byMember[payer] ?? 0) + Math.round(exp.amount / exp.paidBy.length);
      }
    }

    return { month, totalExpenses, byCategory, byMember, debts: calculateDebtsForMonth(get().expenses, month) };
  },
}));
