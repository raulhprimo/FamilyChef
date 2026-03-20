import { create } from 'zustand';
import type { MemberId } from '../../../core/constants/members';
import type { Expense, Debt, ExpenseCategory, MonthSummary } from '../types';
import { FIN_MEMBER_IDS } from '../types';

const STORAGE_KEY = '4family_fin_expenses';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function load(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function calculateDebtsForMonth(expenses: Expense[], month: string): Debt[] {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(month));

  // Net balance per member: positive = has to receive, negative = owes
  const balance: Record<string, number> = {};
  for (const id of FIN_MEMBER_IDS) balance[id] = 0;

  for (const exp of monthExpenses) {
    const splitMembers = exp.splitBetween.length > 0 ? exp.splitBetween : FIN_MEMBER_IDS;
    const splitCount = splitMembers.length;

    if (exp.customSplit) {
      // Custom split
      for (const memberId of splitMembers) {
        const owes = exp.customSplit[memberId as MemberId] ?? Math.round(exp.amount / splitCount);
        balance[memberId] = (balance[memberId] ?? 0) - owes;
      }
    } else {
      // Equal split
      const perPerson = Math.round(exp.amount / splitCount);
      for (const memberId of splitMembers) {
        balance[memberId] = (balance[memberId] ?? 0) - perPerson;
      }
    }

    // Credit payers
    const payerCount = exp.paidBy.length;
    const perPayer = Math.round(exp.amount / payerCount);
    for (const payer of exp.paidBy) {
      balance[payer] = (balance[payer] ?? 0) + perPayer;
    }
  }

  // Simplify debts: pair debtors with creditors
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, bal] of Object.entries(balance)) {
    if (bal > 0) creditors.push({ id, amount: bal });
    else if (bal < 0) debtors.push({ id, amount: -bal });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const debts: Debt[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
    if (transfer > 0) {
      debts.push({
        from: debtors[di].id as MemberId,
        to: creditors[ci].id as MemberId,
        amount: transfer,
      });
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
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByMonth: (month: string) => Expense[];
  calculateDebts: (month: string) => Debt[];
  getMonthSummary: (month: string) => MonthSummary;
};

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: load(),

  addExpense: (data) => {
    const expense: Expense = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    const updated = [...get().expenses, expense];
    set({ expenses: updated });
    save(updated);
  },

  updateExpense: (id, data) => {
    const updated = get().expenses.map((e) => (e.id === id ? { ...e, ...data } : e));
    set({ expenses: updated });
    save(updated);
  },

  deleteExpense: (id) => {
    const updated = get().expenses.filter((e) => e.id !== id);
    set({ expenses: updated });
    save(updated);
  },

  getExpensesByMonth: (month) => {
    return get().expenses.filter((e) => e.date.startsWith(month) && !e.isSettlement);
  },

  calculateDebts: (month) => {
    return calculateDebtsForMonth(get().expenses, month);
  },

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

    return {
      month,
      totalExpenses,
      byCategory,
      byMember,
      debts: calculateDebtsForMonth(get().expenses, month),
    };
  },
}));
