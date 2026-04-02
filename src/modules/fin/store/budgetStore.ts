import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import { getFamilyId } from '../../../core/hooks/useFamilyId';
import type { Budget, ExpenseCategory } from '../types';

type BudgetStatus = {
  category: ExpenseCategory;
  limit: number;
  spent: number;
  percent: number;
  status: 'ok' | 'warning' | 'over';
};

type BudgetState = {
  budgets: Budget[];
  loading: boolean;
  fetchBudgets: () => Promise<void>;
  setBudget: (category: ExpenseCategory, monthlyLimit: number, month: string) => Promise<void>;
  removeBudget: (category: ExpenseCategory, month: string) => Promise<void>;
  getBudgetStatus: (month: string, spentByCategory: Record<ExpenseCategory, number>) => BudgetStatus[];
};

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  loading: true,

  fetchBudgets: async () => {
    const familyId = getFamilyId();
    let query = supabase.from('fin_budgets').select('*');
    if (familyId) query = query.eq('family_id', familyId);
    const { data, error } = await query;
    if (!error && data) {
      const budgets: Budget[] = data.map((row) => ({
        category: row.category as ExpenseCategory,
        monthlyLimit: row.monthly_limit as number,
        month: row.month as string,
      }));
      set({ budgets, loading: false });
    } else {
      set({ loading: false });
    }
  },

  setBudget: async (category, monthlyLimit, month) => {
    const budgets = get().budgets.filter((b) => !(b.category === category && b.month === month));
    budgets.push({ category, monthlyLimit, month });
    set({ budgets });

    await supabase.from('fin_budgets').upsert({
      family_id: getFamilyId(),
      category,
      monthly_limit: monthlyLimit,
      month,
    });
  },

  removeBudget: async (category, month) => {
    const budgets = get().budgets.filter((b) => !(b.category === category && b.month === month));
    set({ budgets });
    await supabase.from('fin_budgets').delete().eq('category', category).eq('month', month);
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
