import { supabase } from '../../lib/supabase';

type StoreRefs = {
  fetchMeals: () => Promise<void>;
  fetchInstances: () => Promise<void>;
  fetchRecurring: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchBudgets: () => Promise<void>;
  fetchNudges: () => Promise<void>;
};

// Debounce map: prevents multiple rapid refetches for the same table
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function debouncedCall(key: string, fn: () => void, ms = 400) {
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(fn, ms);
}

export function setupRealtimeSubscriptions(stores: StoreRefs): () => void {
  const channel = supabase
    .channel('4family-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'meals' },
      () => debouncedCall('meals', () => void stores.fetchMeals()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'home_task_instances' },
      () => debouncedCall('tasks', () => void stores.fetchInstances()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'home_recurring_tasks' },
      () => debouncedCall('recurring', () => void stores.fetchRecurring()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fin_expenses' },
      () => debouncedCall('expenses', () => void stores.fetchExpenses()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fin_goals' },
      () => debouncedCall('goals', () => void stores.fetchGoals()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fin_goal_contributions' },
      () => debouncedCall('goals-contrib', () => void stores.fetchGoals()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'fin_budgets' },
      () => debouncedCall('budgets', () => void stores.fetchBudgets()),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'nudges' },
      () => debouncedCall('nudges', () => void stores.fetchNudges()),
    )
    .subscribe();

  return () => {
    // Clear all pending debounce timers
    for (const key of Object.keys(debounceTimers)) {
      clearTimeout(debounceTimers[key]);
      delete debounceTimers[key];
    }
    supabase.removeChannel(channel);
  };
}
