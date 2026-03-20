import { useEffect, useState, useRef } from 'react';
import { useMealsStore } from '../../modules/chef/store/mealsStore';
import { useStatsStore } from '../../modules/chef/store/statsStore';
import { useToastStore } from '../store/toastStore';
import { runMigrationIfNeeded, diagnoseMigration } from '../utils/migration';

type AppInitializerProps = {
  children: React.ReactNode;
};

function AppInitializer({ children }: AppInitializerProps) {
  const fetchMeals = useMealsStore((s) => s.fetchMeals);
  const fetchStats = useStatsStore((s) => s.fetchStats);
  const showToast = useToastStore((s) => s.showToast);
  const [ready, setReady] = useState(false);
  const migrationRan = useRef(false);

  useEffect(() => {
    // Run migration before fetching data
    if (!migrationRan.current) {
      migrationRan.current = true;
      const migrated = runMigrationIfNeeded();
      if (migrated) {
        showToast('Seus dados do FamilyChef foram migrados para o 4Family');
      }

      // Diagnóstico em dev
      diagnoseMigration();
    }

    Promise.all([fetchMeals(), fetchStats()]).then(() => setReady(true));
  }, [fetchMeals, fetchStats, showToast]);

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
