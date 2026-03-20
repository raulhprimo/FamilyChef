import { useMemo } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { useTasksStore } from '../store/tasksStore';
import { formatDateISO, getMonday } from '../../../core/utils/dates';
import type { TaskInstance } from '../types';

function getWeekLabel(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00');
  const monday = getMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

function getWeekKey(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00');
  const monday = getMonday(d);
  return formatDateISO(monday);
}

function History() {
  const instances = useTasksStore((s) => s.instances);

  const doneTasks = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = formatDateISO(thirtyDaysAgo);

    return instances
      .filter((t) => t.done && t.doneAt && t.dueDate >= cutoff)
      .sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''));
  }, [instances]);

  const groupedByWeek = useMemo(() => {
    const groups: Record<string, TaskInstance[]> = {};
    for (const task of doneTasks) {
      const weekKey = getWeekKey(task.dueDate);
      if (!groups[weekKey]) groups[weekKey] = [];
      groups[weekKey].push(task);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [doneTasks]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={22} color="#F9A825" aria-hidden="true" />
          <h1 className="font-display text-xl font-extrabold text-text-primary">Histórico</h1>
        </div>
        <p className="mt-1 text-sm text-text-muted">Tarefas concluídas nos últimos 30 dias</p>
      </div>

      {groupedByWeek.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 shadow-sm">
          <Emoji name="open-book" width={48} />
          <p className="text-sm text-text-muted">Nenhuma tarefa concluída ainda</p>
        </div>
      ) : (
        groupedByWeek.map(([weekKey, tasks]) => (
          <section key={weekKey}>
            <h3 className="mb-3 text-sm font-bold text-text-muted">
              Semana de {getWeekLabel(weekKey)}
            </h3>
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const member = FAMILY_MEMBERS.find((m) => m.id === task.doneBy);
                const doneDate = task.doneAt
                  ? new Date(task.doneAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })
                  : '';
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    <Emoji name="check-mark-button" width={18} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-text-primary line-through">
                        {task.name}
                      </span>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                        {member && (
                          <span className="flex items-center gap-0.5">
                            <Emoji name={member.emoji} width={12} />
                            {member.name}
                          </span>
                        )}
                        <span>{doneDate}</span>
                        {(task.lateByDays ?? 0) > 0 && (
                          <span className="text-red-500">
                            {task.lateByDays}d atrasada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default History;
