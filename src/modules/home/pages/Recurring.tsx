import { useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { useRecurringStore } from '../store/recurringStore';
import type { RecurringTask } from '../types';
import RecurringModal from '../components/RecurringModal';

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  once: 'Avulsa',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  limpeza: 'broom',
  compras: 'shopping-cart',
  manutencao: 'wrench',
  outros: 'package',
};

function Recurring() {
  const recurringTasks = useRecurringStore((s) => s.recurringTasks);
  const addRecurring = useRecurringStore((s) => s.addRecurring);
  const updateRecurring = useRecurringStore((s) => s.updateRecurring);
  const deleteRecurring = useRecurringStore((s) => s.deleteRecurring);
  const toggleActive = useRecurringStore((s) => s.toggleActive);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | undefined>(undefined);

  function handleSave(task: Omit<RecurringTask, 'id' | 'createdAt'>) {
    if (editingTask) {
      updateRecurring(editingTask.id, task);
    } else {
      addRecurring(task);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold text-text-primary">Recorrentes</h1>
          <p className="mt-1 text-sm text-text-muted">Tarefas que se repetem automaticamente</p>
        </div>
        <button
          onClick={() => { setEditingTask(undefined); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#F9A825' }}
        >
          <HugeiconsIcon icon={Add01Icon} size={16} color="#fff" />
          Nova
        </button>
      </div>

      {recurringTasks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <Emoji name="repeat-button" width={48} />
          <div className="text-center">
            <p className="font-display text-base font-bold text-text-primary">
              Nenhuma tarefa recorrente
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Crie tarefas que se repetem automaticamente
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recurringTasks.map((task) => {
            const members = FAMILY_MEMBERS.filter((m) =>
              task.assignedTo.includes(m.id as typeof task.assignedTo[number]),
            );
            return (
              <div
                key={task.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors ${
                  task.active ? 'border-gray-100' : 'border-gray-100 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => { setEditingTask(task); setModalOpen(true); }}
                  >
                    <div className="flex items-center gap-2">
                      <Emoji name={CATEGORY_EMOJIS[task.category] ?? 'package'} width={16} />
                      <span className="text-sm font-bold text-text-primary">{task.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span>{FREQ_LABELS[task.frequency]}</span>
                      <div className="flex items-center gap-1">
                        {members.map((m) => (
                          <Emoji key={m.id} name={m.emoji} width={14} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggle active */}
                  <button
                    onClick={() => toggleActive(task.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      task.active ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                    aria-label={task.active ? 'Desativar' : 'Ativar'}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        task.active ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RecurringModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(undefined); }}
        onSave={handleSave}
        onDelete={editingTask ? (id) => { deleteRecurring(id); setModalOpen(false); setEditingTask(undefined); } : undefined}
        existingTask={editingTask}
      />
    </div>
  );
}

export default Recurring;
