import { useState, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Add01Icon, Camera01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { useToastStore } from '../../../core/store/toastStore';
import { formatDateISO } from '../../../core/utils/dates';
import type { Meal, MealType } from '../../../core/types';

const EMPTY_PHRASES = [
  'O que vai rolar?',
  'Surpreenda a familia!',
  'Bora cozinhar?',
];

type MealCellProps = {
  meal: Meal | undefined;
  mealType: MealType;
  onAdd: () => void;
  onToggleDone: (id: string) => void;
  onEdit?: (meal: Meal) => void;
  onAddPhoto?: (meal: Meal) => void;
};

function MealCell({ meal, mealType, onAdd, onToggleDone, onEdit, onAddPhoto }: MealCellProps) {
  const label = mealType === 'lunch' ? 'Almoço' : 'Janta';
  const [floatingPoints, setFloatingPoints] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const showToast = useToastStore((s) => s.showToast);

  const phrase = useMemo(() => {
    const idx = Math.floor(Math.random() * EMPTY_PHRASES.length);
    return EMPTY_PHRASES[idx];
  }, []);

  const todayISO = useMemo(() => formatDateISO(new Date()), []);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!meal) return;

    const isToday = meal.date === todayISO;

    // Só pode marcar como feito no dia da refeição
    if (!meal.done && !isToday) {
      showToast('Só pode concluir no dia da refeição');
      return;
    }

    // Não pode marcar como feito sem prato definido
    if (!meal.done && !meal.dish.trim()) {
      showToast('Defina o prato antes de concluir');
      return;
    }

    const wasDone = meal.done;
    onToggleDone(meal.id);

    if (!wasDone) {
      const firstMember = FAMILY_MEMBERS.find((m) => m.id === meal.responsibleIds[0]);
      const color = firstMember?.color ?? '#FF6B6B';

      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { x, y },
          colors: [color, '#FFE66D', '#4ECDC4'],
          scalar: 0.8,
          gravity: 1.2,
          ticks: 80,
        });
      }

      setFloatingPoints(true);
      setTimeout(() => setFloatingPoints(false), 1000);
      showToast('Refeição concluída! +10 pontos');
    }
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    if (meal && onEdit) onEdit(meal);
  }

  function handlePhotoClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (meal && onAddPhoto) onAddPhoto(meal);
  }

  if (!meal) {
    return (
      <button
        onClick={onAdd}
        className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-gray-200 bg-white/50 px-2 py-3 transition-colors hover:border-accent hover:bg-white"
        aria-label={`Adicionar ${label}`}
      >
        <Emoji name="fork-and-knife-with-plate" width={20} />
        <span className="flex items-center gap-1 text-[11px] text-text-muted">
          <HugeiconsIcon icon={Add01Icon} size={10} aria-hidden="true" />
          {phrase}
        </span>
      </button>
    );
  }

  const members = FAMILY_MEMBERS.filter((m) => meal.responsibleIds.includes(m.id));
  const hasDish = meal.dish.trim().length > 0;
  const isToday = meal.date === todayISO;
  const canToggle = meal.done || (isToday && hasDish);

  return (
    <div
      ref={cellRef}
      className="relative flex w-full flex-col gap-1 rounded-xl border border-gray-100 bg-white px-2 py-3 text-left shadow-sm transition-colors hover:bg-gray-50"
    >
      {/* Floating +10 */}
      {floatingPoints && (
        <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 animate-float-up text-sm font-extrabold text-accent">
          +10
        </span>
      )}

      {/* Photo thumbnail */}
      {meal.imageUrl && (
        <div className="mb-1 overflow-hidden rounded-lg">
          <img
            src={meal.imageUrl}
            alt={meal.dish || 'Refeição'}
            className="h-16 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Dish name + toggle */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleToggle}
          className={`shrink-0 ${!canToggle ? 'opacity-30' : ''}`}
          aria-label={`${meal.done ? 'Desmarcar' : 'Marcar'} como feito`}
        >
          {meal.done ? (
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={16}
              color="#22C55E"
            />
          ) : (
            <span
              className="inline-block h-3.5 w-3.5 rounded-full border-2 transition-colors hover:border-accent"
              style={{ borderColor: members[0]?.color ?? '#E5E7EB' }}
            />
          )}
        </button>
        <span
          className={`flex-1 truncate text-sm font-medium ${
            meal.done
              ? 'text-text-muted line-through'
              : hasDish
                ? 'text-text-primary'
                : 'italic text-text-muted'
          }`}
        >
          {hasDish ? meal.dish : 'A definir...'}
        </span>
      </div>

      {/* Members + action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 pl-0.5 flex-wrap">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-0.5">
              <Emoji name={member.emoji} width={14} />
              <span className="text-xs" style={{ color: member.color }}>
                {member.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              aria-label="Editar refeição"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={11} color="#6B7280" aria-hidden="true" />
            </button>
          )}

          {/* Camera button - only when done */}
          {meal.done && onAddPhoto && (
            <button
              onClick={handlePhotoClick}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 transition-colors hover:bg-accent/20"
              aria-label="Adicionar foto"
            >
              <HugeiconsIcon icon={Camera01Icon} size={12} color="#FF6B6B" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MealCell;
