import { useEffect, useState, useRef } from 'react';
import { useFamilyStore } from '../store/familyStore';
import { useMealsStore } from '../../modules/chef/store/mealsStore';
import { useStatsStore } from '../../modules/chef/store/statsStore';
import { useRecurringStore } from '../../modules/home/store/recurringStore';
import { useTasksStore } from '../../modules/home/store/tasksStore';
import { useHomeStatsStore } from '../../modules/home/store/homeStatsStore';
import { useExpensesStore } from '../../modules/fin/store/expensesStore';
import { useGoalsStore } from '../../modules/fin/store/goalsStore';
import { useBudgetStore } from '../../modules/fin/store/budgetStore';
import { useFinStatsStore } from '../../modules/fin/store/finStatsStore';
import { useNudgeStore } from '../../modules/home/store/nudgeStore';
import { useToastStore } from '../store/toastStore';
import { runMigrationIfNeeded, diagnoseMigration } from '../utils/migration';
import { setupRealtimeSubscriptions } from '../services/realtimeSync';

type AppInitializerProps = {
  children: React.ReactNode;
};

function AppInitializer({ children }: AppInitializerProps) {
  // Family
  const familyId = useFamilyStore((s) => s.familyId);
  const fetchFamily = useFamilyStore((s) => s.fetchFamily);
  const fetchMembers = useFamilyStore((s) => s.fetchMembers);
  const familyLoading = useFamilyStore((s) => s.loading);

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
  // Nudges
  const fetchNudges = useNudgeStore((s) => s.fetchNudges);

  const showToast = useToastStore((s) => s.showToast);
  const [ready, setReady] = useState(false);
  const migrationRan = useRef(false);

  // Check if user has a session (new or old format)
  const hasSession = !!familyId || !!localStorage.getItem('4family_active_member');

  // Step 1: Load family data when we have a familyId
  useEffect(() => {
    if (!familyId) return;
    Promise.all([
      fetchFamily(familyId),
      fetchMembers(familyId),
    ]).catch(() => {});
  }, [familyId, fetchFamily, fetchMembers]);

  // Step 2: Load module data after family is loaded (or skip for visitors)
  useEffect(() => {
    if (!hasSession) {
      setReady(true);
      return;
    }

    // Wait for family members to load if we have a familyId
    if (familyId && familyLoading) return;

    if (!migrationRan.current) {
      migrationRan.current = true;
      const migrated = runMigrationIfNeeded();
      if (migrated) {
        showToast('Seus dados do FamilyChef foram migrados para o 4Family');
      }
      diagnoseMigration();
    }

    Promise.all([
      fetchMeals(),
      fetchChefStats(),
      fetchRecurring(),
      fetchInstances(),
      fetchHomeStats(),
      fetchExpenses(),
      fetchGoals(),
      fetchBudgets(),
      fetchFinStats(),
      fetchNudges(),
    ]).then(() => setReady(true));
  }, [hasSession, familyId, familyLoading, fetchMeals, fetchChefStats, fetchRecurring, fetchInstances, fetchHomeStats, fetchExpenses, fetchGoals, fetchBudgets, fetchFinStats, fetchNudges, showToast]);

  // Realtime subscriptions (only when logged in and ready)
  useEffect(() => {
    if (!ready || !hasSession) return;
    const cleanup = setupRealtimeSubscriptions({
      fetchMeals,
      fetchInstances,
      fetchRecurring,
      fetchExpenses,
      fetchGoals,
      fetchBudgets,
      fetchNudges,
    });
    return cleanup;
  }, [ready, hasSession, fetchMeals, fetchInstances, fetchRecurring, fetchExpenses, fetchGoals, fetchBudgets, fetchNudges]);

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
