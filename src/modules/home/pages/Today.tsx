import { useMemo, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { formatDateISO } from '../../../core/utils/dates';
import { useToastStore } from '../../../core/store/toastStore';
import { useTasksStore } from '../store/tasksStore';
import { useHomeStatsStore } from '../store/homeStatsStore';
import type { MemberId } from '../../../core/constants/members';
import type { TaskInstance } from '../types';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const EMPTY_PHRASES = [
  'A casa agradece!',
  'Dia livre de tarefas',
  'Aproveite o descanso!',
];

function getEmptyPhrase(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return EMPTY_PHRASES[dayOfYear % EMPTY_PHRASES.length];
}

const EMPTY_EMOJIS = ['house-with-garden', 'sparkles', 'smiling-face-with-sunglasses'];

function Today() {
  const member = useActiveMember();
  const instances = useTasksStore((s) => s.instances);
  const toggleDone = useTasksStore((s) => s.toggleDone);
  const addInstance = useTasksStore((s) => s.addInstance);
  const deleteInstance = useTasksStore((s) => s.deleteInstance);
  const recordTaskDone = useHomeStatsStore((s) => s.recordTaskDone);
  const recordTaskUndone = useHomeStatsStore((s) => s.recordTaskUndone);
  const getMemberStreak = useHomeStatsStore((s) => s.getMemberStreak);
  const showToast = useToastStore((s) => s.showToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskInstance | undefined>(undefined);
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [tomorrowOpen, setTomorrowOpen] = useState(false);

  const todayISO = useMemo(() => formatDateISO(new Date()), []);
  const tomorrowISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  }, []);

  const streak = member ? getMemberStreak(member.id as MemberId) : 0;

  const todayTasks = useMemo(
    () => instances.filter((t) => t.dueDate === todayISO),
    [instances, todayISO],
  );

  const overdueTasks = useMemo(
    () => member
      ? instances.filter((t) => !t.done && t.dueDate < todayISO && t.assignedTo === member.id)
      : [],
    [instances, todayISO, member],
  );

  const tomorrowTasks = useMemo(
    () => member
      ? instances.filter((t) => t.dueDate === tomorrowISO && t.assignedTo === member.id)
      : [],
    [instances, tomorrowISO, member],
  );

  const myTasks = useMemo(
    () => (member ? todayTasks.filter((t) => t.assignedTo === member.id) : []),
    [todayTasks, member],
  );

  const familyTasks = useMemo(
    () => (member ? todayTasks.filter((t) => t.assignedTo !== member.id) : todayTasks),
    [todayTasks, member],
  );

  const pendingCount = todayTasks.filter((t) => !t.done).length;
  const doneCount = todayTasks.filter((t) => t.done).length;

  const handleToggle = useCallback((id: string) => {
    if (!member) return;
    const task = instances.find((t) => t.id === id);
    if (!task) return;
    const wasDone = task.done;
    toggleDone(id, member.id as MemberId);

    if (!wasDone) {
      // Get the updated task to compute lateByDays
      const dueDate = new Date(task.dueDate + 'T00:00:00');
      const today = new Date(todayISO + 'T00:00:00');
      const diffMs = today.getTime() - dueDate.getTime();
      const lateByDays = Math.max(0, Math.round(diffMs / 86_400_000));

      const updatedTask = { ...task, done: true, doneBy: member.id as MemberId, lateByDays };
      const points = recordTaskDone(updatedTask);

      // Contextual toast
      if (lateByDays > 0) {
        showToast('Concluída com atraso — tente fazer antes da próxima vez!');
      } else if (points === 15) {
        showToast('Tarefa concluída antecipada! +15 pts');
      } else {
        showToast(`Tarefa concluída! +${points} pts`);
      }

      // Check if streak hit 7
      const newStreak = getMemberStreak(member.id as MemberId);
      if (newStreak === 7) {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F9A825', '#FFE66D', '#FF6B6B'],
          });
          showToast('7 dias seguidos! Streak incrível!');
        }, 400);
      }
    } else {
      recordTaskUndone(task);
    }
  }, [member, instances, toggleDone, todayISO, recordTaskDone, recordTaskUndone, showToast, getMemberStreak]);

  function handleSaveNew(task: Omit<TaskInstance, 'id'>) {
    addInstance(task);
    showToast(`Tarefa adicionada: ${task.name}`);
  }

  const emptyPhrase = useMemo(getEmptyPhrase, []);
  const emptyEmojiIdx = useMemo(() => {
    const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
    return d % EMPTY_EMOJIS.length;
  }, []);

  return (
    <>
      {/* Greeting */}
      {member && (
        <div className="mb-4 flex items-center gap-3">
          <div className="animate-wave inline-block origin-bottom-right">
            <Emoji name="waving-hand" width={28} />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-text-primary">
              {getGreeting()}, {member.name}!
            </h2>
            <p className="text-sm text-text-muted">
              {pendingCount > 0
                ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''} · ${doneCount} concluída${doneCount > 1 ? 's' : ''}`
                : doneCount > 0
                  ? 'Tudo feito por hoje!'
                  : 'Nenhuma tarefa para hoje'}
            </p>
          </div>
        </div>
      )}

      {/* Streak */}
      {streak > 0 && member && (
        <div
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold animate-streak-pulse"
          style={{
            borderColor: '#F9A82540',
            backgroundColor: '#F9A82508',
            color: '#F9A825',
          }}
        >
          <Emoji name="fire" width={18} />
          <span>{streak} dia{streak > 1 ? 's' : ''} seguido{streak > 1 ? 's' : ''}!</span>
          {streak >= 7 && <Emoji name="star" width={16} />}
        </div>
      )}

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <section className="mb-4">
          <button
            onClick={() => setOverdueOpen(!overdueOpen)}
            className="mb-2 flex w-full items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-sm font-bold text-red-600"
          >
            <Emoji name="warning" width={16} />
            Atrasadas ({overdueTasks.length})
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              color="#DC2626"
              className={`ml-auto transition-transform ${overdueOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {overdueOpen && (
            <div className="flex flex-col gap-2">
              {overdueTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={(id) => deleteInstance(id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* My tasks */}
      {myTasks.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 text-sm font-bold text-text-muted">Suas tarefas de hoje</h3>
          <div className="flex flex-col gap-2">
            {myTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => { setEditingTask(t); setModalOpen(true); }}
                onDelete={(id) => deleteInstance(id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Family tasks */}
      {familyTasks.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 text-sm font-bold text-text-muted">Tarefas da família hoje</h3>
          <div className="flex flex-col gap-2">
            {familyTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tomorrow preview */}
      {tomorrowTasks.length > 0 && (
        <section className="mb-6">
          <button
            onClick={() => setTomorrowOpen(!tomorrowOpen)}
            className="mb-2 flex w-full items-center gap-2 text-sm font-bold text-text-muted"
          >
            <Emoji name="crystal-ball" width={14} />
            Amanhã ({tomorrowTasks.length})
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              color="#6B7280"
              className={`ml-auto transition-transform ${tomorrowOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {tomorrowOpen && (
            <div className="flex flex-col gap-2 opacity-70">
              {tomorrowTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => {}} // Can't toggle tomorrow's tasks
                />
              ))}
              {tomorrowTasks.length > 3 && (
                <p className="text-center text-xs text-text-muted">
                  +{tomorrowTasks.length - 3} mais
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Empty state - motivational */}
      {todayTasks.length === 0 && overdueTasks.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <Emoji name={EMPTY_EMOJIS[emptyEmojiIdx]} width={48} />
          <div className="text-center">
            <p className="font-display text-base font-bold text-text-primary">
              {emptyPhrase}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Crie tarefas recorrentes ou adicione uma avulsa
            </p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setEditingTask(undefined); setModalOpen(true); }}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 lg:bottom-6"
        style={{ backgroundColor: '#F9A825' }}
        aria-label="Adicionar tarefa"
      >
        <HugeiconsIcon icon={Add01Icon} size={24} color="#fff" />
      </button>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(undefined); }}
        onSave={editingTask ? (data) => {
          useTasksStore.getState().updateInstance(editingTask.id, data);
          setModalOpen(false);
          setEditingTask(undefined);
        } : handleSaveNew}
        onDelete={editingTask ? (id) => { deleteInstance(id); setModalOpen(false); setEditingTask(undefined); } : undefined}
        existingTask={editingTask}
      />
    </>
  );
}

export default Today;
