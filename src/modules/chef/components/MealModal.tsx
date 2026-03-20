import { useEffect, useState, useRef } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { useMealsStore } from '../store/mealsStore';
import { useStatsStore } from '../store/statsStore';
import { getWeekId } from '../../../core/utils/dates';
import type { Meal, MealType } from '../../../core/types';

type MealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  mealType: MealType;
  existingMeal?: Meal;
};

function MealModal({ isOpen, onClose, date, mealType, existingMeal }: MealModalProps) {
  const addMeal = useMealsStore((s) => s.addMeal);
  const updateMeal = useMealsStore((s) => s.updateMeal);
  const deleteMeal = useMealsStore((s) => s.deleteMeal);
  const meals = useMealsStore((s) => s.meals);
  const recordMealDeleted = useStatsStore((s) => s.recordMealDeleted);

  const [dish, setDish] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [visible, setVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDish(existingMeal?.dish ?? '');
      setSelectedIds(existingMeal?.responsibleIds ?? []);
      setConfirmDelete(false);
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setVisible(false);
    }
  }, [isOpen, existingMeal]);

  if (!isOpen) return null;

  const title = mealType === 'lunch' ? 'Almoço' : 'Janta';
  const isEditing = !!existingMeal;
  // Pode salvar só com membros selecionados (prato é opcional)
  const canSave = selectedIds.length > 0;

  function toggleMember(memberId: string) {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  function handleSave() {
    if (!canSave) return;
    const parsedDate = new Date(date + 'T12:00:00');
    const weekId = getWeekId(parsedDate);

    if (isEditing) {
      updateMeal(existingMeal.id, { dish: dish.trim(), responsibleIds: selectedIds });
    } else {
      addMeal({
        weekId,
        date,
        type: mealType,
        dish: dish.trim(),
        responsibleIds: selectedIds,
        done: false,
      });
    }
    handleClose();
  }

  function handleDelete() {
    if (!existingMeal) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    // Reverter pontos se a refeição estava concluída
    const remainingMeals = meals.filter((m) => m.id !== existingMeal.id);
    recordMealDeleted(existingMeal, remainingMeals);

    deleteMeal(existingMeal.id);
    handleClose();
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 md:items-center ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${isEditing ? 'Editar' : 'Adicionar'} ${title}`}
    >
      <div
        className={`w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl transition-transform duration-200 md:rounded-2xl ${
          visible
            ? 'translate-y-0 md:scale-100'
            : 'translate-y-full md:translate-y-0 md:scale-95'
        }`}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            {isEditing ? 'Editar' : 'Adicionar'} {title}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Fechar"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} color="#6B7280" />
          </button>
        </div>

        {/* Seleção de responsáveis (multi-select) — primeiro */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-text-muted">
            Quem vai preparar?
            <span className="ml-1 font-normal text-text-muted">(pode selecionar mais de um)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FAMILY_MEMBERS.map((member) => {
              const selected = selectedIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                    selected
                      ? 'shadow-sm'
                      : 'border-gray-100 bg-white text-text-muted hover:border-gray-200'
                  }`}
                  style={
                    selected
                      ? { borderColor: member.color, backgroundColor: `${member.color}15`, color: member.color }
                      : undefined
                  }
                  aria-pressed={selected}
                >
                  <Emoji name={member.emoji} width={20} />
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Campo do prato (opcional) */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">
            Nome do prato
            <span className="ml-1 font-normal text-text-muted">(opcional — pode preencher depois)</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            placeholder="Ex: Frango grelhado com arroz"
            className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-gray-400 focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition-opacity disabled:opacity-40"
          >
            Salvar
          </button>

          <button
            onClick={handleClose}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>

          {isEditing && (
            <button
              onClick={handleDelete}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                confirmDelete
                  ? 'bg-red-50 text-red-600'
                  : 'text-red-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} aria-hidden="true" />
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir prato'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MealModal;
