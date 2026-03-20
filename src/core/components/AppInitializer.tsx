import { useEffect, useState, useRef } from 'react';
import { useMealsStore } from '../../modules/chef/store/mealsStore';
import { useStatsStore } from '../../modules/chef/store/statsStore';
import { useRecurringStore } from '../../modules/home/store/recurringStore';
import { useTasksStore } from '../../modules/home/store/tasksStore';
import { useHomeStatsStore } from '../../modules/home/store/homeStatsStore';
import { useExpensesStore } from '../../modules/fin/store/expensesStore';
import { useGoalsStore } from '../../modules/fin/store/goalsStore';
import { useBudgetStore } from '../../modules/fin/store/budgetStore';
import { useFinStatsStore } from '../../modules/fin/store/finStatsStore';
import { useToastStore } from '../store/toastStore';
import { runMigrationIfNeeded, diagnoseMigration } from '../utils/migration';

type AppInitializerProps = {
  children: React.ReactNode;
};

function AppInitializer({ children }: AppInitializerProps) {
  // Chef
  const fetchMeals = useMealsStore((s) => s.fetchMeals);
  const fetchChefStats = useStatsStore((s) => s.fetchStats);
  // Home
  const fetchRecurring = useRecurringStore((s) => s.fetchRecurring);
  const fetchInstances = useTasksStore((s) => s.fetchInstances);
  const fetchHomeStats = useHomeStatsStore((s) => s.fetchHomeStats);
  // Fin
  const fetchExpenses = useExpensesStore((s) => s.fetchExpenses);
  const fetchGoals = useGoalsStore((s) => s.fetchGoals);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);
  const fetchFinStats = useFinStatsStore((s) => s.fetchFinStats);

  const showToast = useToastStore((s) => s.showToast);
  const [ready, setReady] = useState(false);
  const migrationRan = useRef(false);

  useEffect(() => {
    if (!migrationRan.current) {
      migrationRan.current = true;
      const migrated = runMigrationIfNeeded();
      if (migrated) {
        showToast('Seus dados do FamilyChef foram migrados para o 4Family');
      }
      diagnoseMigration();
    }

    Promise.all([
      // Chef
      fetchMeals(),
      fetchChefStats(),
      // Home
      fetchRecurring(),
      fetchInstances(),
      fetchHomeStats(),
      // Fin
      fetchExpenses(),
      fetchGoals(),
      fetchBudgets(),
      fetchFinStats(),
    ]).then(() => setReady(true));
  }, [fetchMeals, fetchChefStats, fetchRecurring, fetchInstances, fetchHomeStats, fetchExpenses, fetchGoals, fetchBudgets, fetchFinStats, showToast]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
          <span className="text-sm font-semibold text-text-muted">Carregando...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AppInitializer;
