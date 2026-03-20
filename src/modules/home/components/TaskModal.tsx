import { useEffect, useState, useRef } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { formatDateISO } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';
import type { TaskCategory, TaskPriority, TaskInstance } from '../types';

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'compras', label: 'Compras' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' },
];

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskInstance, 'id'>) => void;
  onDelete?: (id: string) => void;
  existingTask?: TaskInstance;
};

function TaskModal({ isOpen, onClose, onSave, onDelete, existingTask }: TaskModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TaskCategory>('limpeza');
  const [assignedTo, setAssignedTo] = useState<MemberId | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [visible, setVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(existingTask?.name ?? '');
      setCategory(existingTask?.category ?? 'limpeza');
      setAssignedTo(existingTask?.assignedTo ?? '');
      setDueDate(existingTask?.dueDate ?? formatDateISO(new Date()));
      setPriority(existingTask?.priority ?? 'normal');
      setConfirmDelete(false);
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setVisible(false);
    }
  }, [isOpen, existingTask]);

  if (!isOpen) return null;

  const isEditing = !!existingTask;
  const canSave = name.trim().length > 0 && assignedTo !== '';

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      category,
      assignedTo: assignedTo as MemberId,
      dueDate,
      priority,
      done: existingTask?.done ?? false,
      doneAt: existingTask?.doneAt,
      doneBy: existingTask?.doneBy,
      recurringTaskId: existingTask?.recurringTaskId,
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
        className={`w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl transition-transform duration-200 md:rounded-2xl ${
          visible
            ? 'translate-y-0 md:scale-100'
            : 'translate-y-full md:translate-y-0 md:scale-95'
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
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
            placeholder="Ex: Limpar a cozinha"
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

        {/* Assigned to */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Atribuir a</label>
          <div className="flex flex-wrap gap-2">
            {FAMILY_MEMBERS.map((member) => (
              <button
                key={member.id}
                onClick={() => setAssignedTo(member.id as MemberId)}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                  assignedTo === member.id
                    ? 'shadow-sm'
                    : 'border-gray-100 text-text-muted hover:border-gray-200'
                }`}
                style={
                  assignedTo === member.id
                    ? { borderColor: member.color, backgroundColor: `${member.color}15`, color: member.color }
                    : undefined
                }
              >
                <Emoji name={member.emoji} width={20} />
                {member.name}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Data</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-bg-primary px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Priority */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-text-muted">Prioridade</label>
          <div className="flex gap-2">
            {(['normal', 'urgent'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all ${
                  priority === p
                    ? p === 'urgent'
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-100 text-text-muted hover:border-gray-200'
                }`}
              >
                {p === 'normal' ? 'Normal' : 'Urgente'}
              </button>
            ))}
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
              {confirmDelete ? 'Confirmar exclusão' : 'Excluir tarefa'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
