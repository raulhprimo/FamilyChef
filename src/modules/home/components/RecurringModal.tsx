import { useEffect, useState, useRef } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import type { MemberId } from '../../../core/constants/members';
import type { TaskCategory, TaskFrequency, RecurringTask } from '../types';

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'compras', label: 'Compras' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' },
];

const FREQUENCIES: { value: TaskFrequency; label: string }[] = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
];

const WEEK_DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

type RecurringModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<RecurringTask, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  existingTask?: RecurringTask;
};

function RecurringModal({ isOpen, onClose, onSave, onDelete, existingTask }: RecurringModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('limpeza');
  const [frequency, setFrequency] = useState<TaskFrequency>('weekly');
  const [weekDays, setWeekDays] = useState<number[]>([1]); // segunda
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [assignedTo, setAssignedTo] = useState<MemberId[]>([]);
  const [visible, setVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(existingTask?.name ?? '');
      setCategory(existingTask?.category ?? 'limpeza');
      setFrequency(existingTask?.frequency ?? 'weekly');
      setWeekDays(existingTask?.weekDays ?? [1]);
      setDayOfMonth(existingTask?.dayOfMonth ?? 1);
      setAssignedTo(existingTask?.assignedTo ?? []);
      setConfirmDelete(false);
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setVisible(false);
    }
  }, [isOpen, existingTask]);

  if (!isOpen) return null;

  const isEditing = !!existingTask;
  const canSave = name.trim().length > 0 && assignedTo.length > 0;

  function toggleMember(memberId: MemberId) {
    setAssignedTo((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  function toggleWeekDay(day: number) {
    setWeekDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      category,
      frequency,
      weekDays: (frequency === 'weekly' || frequency === 'biweekly') ? weekDays : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      assignedTo,
      active: existingTask?.active ?? true,
    });
    handleClose();
  }

  function handleDelete() {
    if (!existingTask || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(existingTask.id);
    handleClose();
  }

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 md:items-center ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl transition-transform duration-200 md:rounded-2xl ${
          visible
            ? 'translate-y-0 md:scale-100'
            : 'translate-y-full md:translate-y-0 md:scale-95'
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            {isEditing ? 'Editar Recorrente' : 'Nova Tarefa Recorrente'}
          </h2>
          <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <HugeiconsIcon icon={Cancel01Icon} size={20} color="#6B7280" />
          </button>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Nome</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Lavar louça"
            className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                  category === cat.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-100 text-text-muted hover:border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Frequência</label>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                  frequency === f.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-100 text-text-muted hover:border-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Week days (for weekly/biweekly) */}
        {(frequency === 'weekly' || frequency === 'biweekly') && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-text-muted">Dias da semana</label>
            <div className="flex gap-1">
              {WEEK_DAYS.map((wd) => (
                <button
                  key={wd.value}
                  onClick={() => toggleWeekDay(wd.value)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                    weekDays.includes(wd.value)
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {wd.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Day of month (for monthly) */}
        {frequency === 'monthly' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-text-muted">Dia do mês</label>
            <input
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
              className="w-24 rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
        )}

        {/* Assigned to (multi) */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">
            Atribuir a <span className="font-normal">(pode selecionar mais de um)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FAMILY_MEMBERS.map((member) => {
              const selected = assignedTo.includes(member.id as MemberId);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id as MemberId)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                    selected
                      ? 'shadow-sm'
                      : 'border-gray-100 text-text-muted hover:border-gray-200'
                  }`}
                  style={
                    selected
                      ? { borderColor: member.color, backgroundColor: `${member.color}15`, color: member.color }
                      : undefined
                  }
                >
                  <Emoji name={member.emoji} width={20} />
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#F9A825' }}
          >
            Salvar
          </button>
          <button
            onClick={handleClose}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50"
          >
            Cancelar
          </button>
          {isEditing && onDelete && (
            <button
              onClick={handleDelete}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                confirmDelete
                  ? 'bg-red-50 text-red-600'
                  : 'text-red-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} aria-hidden="true" />
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir recorrente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecurringModal;
