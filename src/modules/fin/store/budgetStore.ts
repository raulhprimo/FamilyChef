import { create } from 'zustand';
import type { Budget, ExpenseCategory } from '../types';

const STORAGE_KEY = '4family_fin_budget';

function load(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(budgets: Budget[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}

type BudgetStatus = {
  category: ExpenseCategory;
  limit: number;
  spent: number;
  percent: number;
  status: 'ok' | 'warning' | 'over';
};

type BudgetState = {
  budgets: Budget[];
  setBudget: (category: ExpenseCategory, monthlyLimit: number, month: string) => void;
  removeBudget: (category: ExpenseCategory, month: string) => void;
  getBudgetStatus: (month: string, spentByCategory: Record<ExpenseCategory, number>) => BudgetStatus[];
};

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: load(),

  setBudget: (category, monthlyLimit, month) => {
    const budgets = get().budgets.filter((b) => !(b.category === category && b.month === month));
    budgets.push({ category, monthlyLimit, month });
    set({ budgets });
    save(budgets);
  },

  removeBudget: (category, month) => {
    const budgets = get().budgets.filter((b) => !(b.category === category && b.month === month));
    set({ budgets });
    save(budgets);
  },

  getBudgetStatus: (month, spentByCategory) => {
    const monthBudgets = get().budgets.filter((b) => b.month === month);
    return monthBudgets.map((b) => {
      const spent = spentByCategory[b.category] ?? 0;
      const percent = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      const status = percent >= 100 ? 'over' : percent >= 80 ? 'warning' : 'ok';
      return { category: b.category, limit: b.monthlyLimit, spent, percent, status };
    });
  },
}));
