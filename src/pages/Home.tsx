import { useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import WeekGrid from '../components/WeekGrid';
import MealModal from '../components/MealModal';
import ImageUploadModal from '../components/ImageUploadModal';
import { useMealsStore } from '../store/mealsStore';
import { useStatsStore } from '../store/statsStore';
import { useActiveMember } from '../hooks/useActiveMember';
import type { Meal, MealType } from '../types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function Home() {
  const member = useActiveMember();
  const meals = useMealsStore((s) => s.meals);
  const toggleDone = useMealsStore((s) => s.toggleDone);
  const recordMealDone = useStatsStore((s) => s.recordMealDone);
  const recordMealUndone = useStatsStore((s) => s.recordMealUndone);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [modalType, setModalType] = useState<MealType>('lunch');
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalMeal, setImageModalMeal] = useState<Meal | null>(null);

  function handleAddMeal(date: string, type: MealType) {
    setEditingMeal(undefined);
    setModalDate(date);
    setModalType(type);
    setModalOpen(true);
  }

  function handleEditMeal(meal: Meal) {
    setEditingMeal(meal);
    setModalDate(meal.date);
    setModalType(meal.type);
    setModalOpen(true);
  }

  function handleToggleDone(id: string) {
    const meal = meals.find((m) => m.id === id);
    if (!meal) return;

    const wasDone = meal.done;
    toggleDone(id);

    if (!wasDone) {
      // Registrar pontos quando marcar como feito
      const updatedMeal = { ...meal, done: true, doneAt: new Date().toISOString() };
      recordMealDone(updatedMeal, meals);
    } else {
      // Reverter pontos quando desmarcar
      recordMealUndone(meal, meals);
    }
  }

  function handleAddPhoto(meal: Meal) {
    setImageModalMeal(meal);
    setImageModalOpen(true);
  }

  return (
    <>
      {/* Saudação */}
      {member && (
        <div className="mb-4 flex items-center gap-3">
          <div className="animate-wave inline-block origin-bottom-right">
            <Emoji name="waving-hand" width={28} />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-text-primary">
              {getGreeting()}, {member.name}!
            </h2>
            <p className="text-sm text-text-muted">O que vamos cozinhar hoje?</p>
          </div>
        </div>
      )}

      <WeekGrid
        onAddMeal={handleAddMeal}
        onEditMeal={handleEditMeal}
        onAddPhoto={handleAddPhoto}
        onToggleDone={handleToggleDone}
      />

      <MealModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMeal(undefined);
        }}
        date={modalDate}
        mealType={modalType}
        existingMeal={editingMeal}
      />

      {imageModalMeal && (
        <ImageUploadModal
          isOpen={imageModalOpen}
          onClose={() => {
            setImageModalOpen(false);
            setImageModalMeal(null);
          }}
          mealId={imageModalMeal.id}
          currentImageUrl={imageModalMeal.imageUrl}
        />
      )}
    </>
  );
}

export default Home;
