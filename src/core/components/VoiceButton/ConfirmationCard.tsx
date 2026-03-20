import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import type { ConfirmationItem } from '../../types/voice';

const MODULE_COLORS = {
  chef: '#FF6B6B',
  home: '#F9A825',
  fin: '#4ECDC4',
};

const MODULE_LABELS = {
  chef: 'Chef',
  home: 'Home',
  fin: 'Fin',
};

type ConfirmationCardProps = {
  item: ConfirmationItem;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
};

function ConfirmationCard({ item, onConfirm, onReject }: ConfirmationCardProps) {
  const color = MODULE_COLORS[item.action.module];
  const label = MODULE_LABELS[item.action.module];

  if (item.status === 'confirmed') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50/50 p-3 opacity-70">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color="#22C55E" />
        <span className="flex-1 text-sm font-semibold text-green-700 line-through">
          {item.displayText}
        </span>
      </div>
    );
  }

  if (item.status === 'rejected') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-3 opacity-50">
        <HugeiconsIcon icon={Cancel01Icon} size={20} color="#9CA3AF" />
        <span className="flex-1 text-sm font-semibold text-text-muted line-through">
          {item.displayText}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border bg-white p-3 shadow-sm"
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
    >
      <div className="flex-1 min-w-0">
        <span
          className="mb-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
        <p className="text-sm font-semibold text-text-primary">{item.displayText}</p>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={() => onReject(item.id)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200"
          aria-label="Rejeitar"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} color="#9CA3AF" />
        </button>
        <button
          onClick={() => onConfirm(item.id)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 transition-colors hover:bg-green-200"
          aria-label="Confirmar"
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="#22C55E" />
        </button>
      </div>
    </div>
  );
}

export default ConfirmationCard;
