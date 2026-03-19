import { useState, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../constants/members';
import { useToastStore } from '../store/toastStore';
import type { Meal, MealType } from '../types';

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
};

function MealCell({ meal, mealType, onAdd, onToggleDone }: MealCellProps) {
  const label = mealType === 'lunch' ? 'Almoço' : 'Janta';
  const [floatingPoints, setFloatingPoints] = useState(false);
  const cellRef = useRef<HTMLButtonElement>(null);
  const showToast = useToastStore((s) => s.showToast);

  const phrase = useMemo(() => {
    const idx = Math.floor(Math.random() * EMPTY_PHRASES.length);
    return EMPTY_PHRASES[idx];
  }, []);

  function handleToggle(id: string) {
    const wasDone = meal?.done ?? false;

    onToggleDone(id);

    // Only fire effects when marking as done (not undoing)
    if (!wasDone) {
      const member = FAMILY_MEMBERS.find((m) => m.id === meal?.responsibleId);
      const color = member?.color ?? '#FF6B6B';

      // Confetti from click position
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

      // Floating points
      setFloatingPoints(true);
      setTimeout(() => setFloatingPoints(false), 1000);

      // Toast
      showToast(`Refeicao concluida! +10 pontos`);
    }
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

  const member = FAMILY_MEMBERS.find((m) => m.id === meal.responsibleId);

  return (
    <button
      ref={cellRef}
      onClick={() => handleToggle(meal.id)}
      className="relative flex w-full flex-col gap-1 rounded-xl border border-gray-100 bg-white px-2 py-3 text-left shadow-sm transition-colors hover:bg-gray-50"
      aria-label={`${meal.done ? 'Desmarcar' : 'Marcar'} ${meal.dish} como feito`}
    >
      {/* Floating +10 */}
      {floatingPoints && (
        <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 animate-float-up text-sm font-extrabold text-accent">
          +10
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {meal.done ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            color="#22C55E"
            aria-label="Concluido"
          />
        ) : (
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full border-2"
            style={{ borderColor: member?.color ?? '#E5E7EB' }}
          />
        )}
        <span
          className={`truncate text-sm font-medium ${meal.done ? 'text-text-muted line-through' : 'text-text-primary'}`}
        >
          {meal.dish}
        </span>
      </div>

      {member && (
        <div className="flex items-center gap-1 pl-0.5">
          <Emoji name={member.emoji} width={14} />
          <span className="text-xs" style={{ color: member.color }}>
            {member.name}
          </span>
        </div>
      )}
    </button>
  );
}

export default MealCell;
