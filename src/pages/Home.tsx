import { useState, useEffect } from 'react';
import WeekGrid from '../components/WeekGrid';
import WeekGridSkeleton from '../components/WeekGridSkeleton';
import MealModal from '../components/MealModal';
import type { MealType } from '../types';

function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalType, setModalType] = useState<MealType>('lunch');
  const [ready, setReady] = useState(false);

  // Brief skeleton while stores hydrate from localStorage
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleAddMeal(date: string, type: MealType) {
    setModalDate(date);
    setModalType(type);
    setModalOpen(true);
  }

  if (!ready) {
    return <WeekGridSkeleton />;
  }

  return (
    <>
      <WeekGrid onAddMeal={handleAddMeal} />

      <MealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={modalDate}
        mealType={modalType}
      />
    </>
  );
}

export default Home;
