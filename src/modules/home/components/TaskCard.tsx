import { useState, useRef, useCallback } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { formatDateISO } from '../../../core/utils/dates';
import type { TaskInstance } from '../types';
import NudgeButton from './NudgeButton';
import NudgeBadge from './NudgeBadge';

const CATEGORY_ICONS: Record<string, { emoji: string; label: string }> = {
  limpeza: { emoji: 'broom', label: 'Limpeza' },
  compras: { emoji: 'shopping-cart', label: 'Compras' },
  manutencao: { emoji: 'wrench', label: 'Manutenção' },
  outros: { emoji: 'package', label: 'Outros' },
};

const SWIPE_THRESHOLD = 0.35; // 35% of card width

type TaskCardProps = {
  task: TaskInstance;
  onToggle: (id: string) => void;
  onEdit?: (task: TaskInstance) => void;
  onDelete?: (id: string) => void;
  onClaim?: (id: string) => void;  // "Pegar pra mim"
};

function TaskCard({ task, onToggle, onEdit, onDelete, onClaim }: TaskCardProps) {
  const isUnassigned = !task.assignedTo;
  const member = FAMILY_MEMBERS.find((m) => m.id === task.assignedTo);
  const todayISO = formatDateISO(new Date());
  const isLate = !task.done && task.dueDate < todayISO;
  const lateDays = isLate
    ? Math.round(
        (new Date(todayISO + 'T00:00:00').getTime() - new Date(task.dueDate + 'T00:00:00').getTime()) / 86_400_000,
      )
    : 0;
  const cat = CATEGORY_ICONS[task.category] ?? CATEGORY_ICONS.outros;

  const [completing, setCompleting] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    setSwipeX(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current) return;
    swiping.current = false;
    const width = cardRef.current?.offsetWidth ?? 300;

    if (swipeX > width * SWIPE_THRESHOLD && !task.done) {
      // Swipe right → complete
      handleComplete();
    } else if (swipeX < -(width * SWIPE_THRESHOLD) && onDelete) {
      // Swipe left → delete
      onDelete(task.id);
    }
    setSwipeX(0);
  }, [swipeX, task.done, task.id, onDelete]);

  function handleComplete() {
    if (task.done) {
      onToggle(task.id);
      return;
    }
    setCompleting(true);
    onToggle(task.id);
    // Animation runs for 800ms via CSS
  }

  function handleCheckClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (task.done) {
      onToggle(task.id);
    } else {
      handleComplete();
    }
  }

  // Determine swipe background
  const swipeDir = swipeX > 30 ? 'right' : swipeX < -30 ? 'left' : null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe background layers */}
      {swipeDir === 'right' && (
        <div className="absolute inset-0 flex items-center justify-start rounded-2xl bg-green-500 pl-5">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color="#fff" />
        </div>
      )}
      {swipeDir === 'left' && (
        <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-500 pr-5">
          <HugeiconsIcon icon={Delete02Icon} size={24} color="#fff" />
        </div>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        className={`relative flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-colors ${
          completing
            ? 'animate-task-done'
            : task.done
              ? 'border-green-100 bg-green-50/30'
              : isLate
                ? 'border-red-200 bg-red-50/30'
                : 'border-gray-100'
        }`}
        style={swipeX !== 0 ? { transform: `translateX(${swipeX}px)`, transition: 'none' } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !completing && onEdit?.(task)}
        role={onEdit ? 'button' : undefined}
      >
        {/* Toggle */}
        <button
          onClick={handleCheckClick}
          className="shrink-0"
          aria-label={task.done ? 'Desmarcar tarefa' : 'Marcar como feita'}
        >
          {task.done ? (
            <span className="animate-check-fill inline-block">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} color="#22C55E" />
            </span>
          ) : (
            <span
              className="inline-block h-5 w-5 rounded-full border-2 transition-colors hover:border-amber-500"
              style={{ borderColor: isLate ? '#EF4444' : (member?.color ?? '#E5E7EB') }}
            />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                task.done ? 'text-text-muted line-through' : 'text-text-primary'
              }`}
            >
              {task.name}
            </span>
            {task.priority === 'urgent' && !task.done && (
              <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
                Urgente
              </span>
            )}
            {isLate && (
              <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                {lateDays}d atrás
              </span>
            )}
            {task.recurringTaskId && !task.done && (
              <span className="text-[10px] text-text-muted">↻</span>
            )}
            <NudgeBadge taskId={task.id} />
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Emoji name={cat.emoji} width={12} />
              {cat.label}
            </span>
            {member ? (
              <span className="flex items-center gap-0.5">
                <Emoji name={member.emoji} width={12} />
                {member.name}
              </span>
            ) : (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                Disponível
              </span>
            )}
          </div>
        </div>

        {/* Nudge button */}
        <NudgeButton task={task} />

        {/* Claim button for unassigned tasks */}
        {isUnassigned && !task.done && onClaim && (
          <button
            onClick={(e) => { e.stopPropagation(); onClaim(task.id); }}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 transition-colors hover:bg-amber-200"
          >
            Pegar
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
