import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { useActiveMember } from '../../../core/hooks/useActiveMember';
import { formatDateISO } from '../../../core/utils/dates';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { useToastStore } from '../../../core/store/toastStore';
import { useTasksStore } from '../store/tasksStore';
import { useHomeStatsStore } from '../store/homeStatsStore';
import type { MemberId } from '../../../core/constants/members';
import type { TaskInstance } from '../types';
import TaskCard from '../components/TaskCard';

const WEEK_DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function All() {
  const member = useActiveMember();
  const instances = useTasksStore((s) => s.instances);
  const toggleDone = useTasksStore((s) => s.toggleDone);
  const deleteInstance = useTasksStore((s) => s.deleteInstance);
  const recordTaskDone = useHomeStatsStore((s) => s.recordTaskDone);
  const recordTaskUndone = useHomeStatsStore((s) => s.recordTaskUndone);
  const showToast = useToastStore((s) => s.showToast);
  const [filterMember, setFilterMember] = useState<string | null>(null);

  const todayISO = useMemo(() => formatDateISO(new Date()), []);

  // Next 7 days
  const next7Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(formatDateISO(d));
    }
    return days;
  }, []);

  const filteredInstances = useMemo(() => {
    let filtered = instances.filter((t) => next7Days.includes(t.dueDate));
    if (filterMember) {
      filtered = filtered.filter((t) => t.assignedTo === filterMember);
    }
    return filtered;
  }, [instances, next7Days, filterMember]);

  const grouped = useMemo(() => {
    const groups: Record<string, TaskInstance[]> = {};
    for (const day of next7Days) {
      const dayTasks = filteredInstances.filter((t) => t.dueDate === day);
      if (dayTasks.length > 0) {
        groups[day] = dayTasks;
      }
    }
    return groups;
  }, [filteredInstances, next7Days]);

  function handleToggle(id: string) {
    if (!member) return;
    const task = instances.find((t) => t.id === id);
    if (!task) return;
    const wasDone = task.done;
    toggleDone(id, member.id as MemberId);
    if (!wasDone) {
      const dueDate = new Date(task.dueDate + 'T00:00:00');
      const today = new Date(todayISO + 'T00:00:00');
      const diffMs = today.getTime() - dueDate.getTime();
      const lateByDays = Math.max(0, Math.round(diffMs / 86_400_000));
      const updatedTask = { ...task, done: true, doneBy: member.id as MemberId, lateByDays };
      const points = recordTaskDone(updatedTask);
      if (lateByDays > 0) {
        showToast('Concluída com atraso — tente fazer antes da próxima vez!');
      } else {
        showToast(`Tarefa concluída! +${points} pts`);
      }
    } else {
      recordTaskUndone(task);
    }
  }

  function formatDayLabel(dateISO: string): string {
    if (dateISO === todayISO) return 'Hoje';
    const d = new Date(dateISO + 'T12:00:00');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateISO === formatDateISO(tomorrow)) return 'Amanhã';
    const dayName = WEEK_DAY_NAMES[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${dd}/${mm}`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-extrabold text-text-primary">Todas as Tarefas</h1>
        <p className="mt-1 text-sm text-text-muted">Próximos 7 dias</p>
      </div>

      {/* Filter by member */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterMember(null)}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
            !filterMember
              ? 'text-white'
              : 'bg-white text-text-muted border border-gray-100 hover:bg-gray-50'
          }`}
          style={!filterMember ? { backgroundColor: '#F9A825' } : undefined}
        >
          Todos
        </button>
        {FAMILY_MEMBERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setFilterMember(filterMember === m.id ? null : m.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
              filterMember === m.id
                ? 'text-white shadow-sm'
                : 'bg-white text-text-muted border border-gray-100 hover:bg-gray-50'
            }`}
            style={filterMember === m.id ? { backgroundColor: m.color } : undefined}
          >
            <Emoji name={m.emoji} width={16} />
            {m.name}
          </button>
        ))}
      </div>

      {/* Grouped by day */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <Emoji name="calendar" width={48} />
          <p className="text-sm text-text-muted">Nenhuma tarefa nos próximos 7 dias</p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, tasks]) => (
          <section key={day}>
            <h3 className="mb-2 text-sm font-bold text-text-muted">{formatDayLabel(day)}</h3>
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={(id) => deleteInstance(id)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default All;
