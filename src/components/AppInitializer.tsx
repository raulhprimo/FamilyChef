import { useEffect, useState } from 'react';
import { useMealsStore } from '../store/mealsStore';
import { useStatsStore } from '../store/statsStore';

type AppInitializerProps = {
  children: React.ReactNode;
};

function AppInitializer({ children }: AppInitializerProps) {
  const fetchMeals = useMealsStore((s) => s.fetchMeals);
  const fetchStats = useStatsStore((s) => s.fetchStats);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchMeals(), fetchStats()]).then(() => setReady(true));
  }, [fetchMeals, fetchStats]);

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
