import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award02Icon, FireIcon, LockIcon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import type { MemberId } from '../../../core/constants/members';
import { getWeekId, getMonday } from '../../../core/utils/dates';
import { useHomeStatsStore, HOME_BADGES } from '../store/homeStatsStore';
import { useTasksStore } from '../store/tasksStore';
import { formatDateISO } from '../../../core/utils/dates';
import { PodiumMember, GlobalRankingPanel } from '../../../core/components/RankingTabs';

const ACCENT = '#F9A825';

function getLastWeekIds(count: number): string[] {
  const today = new Date();
  const monday = getMonday(today);
  const weeks: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() - i * 7);
    weeks.push(getWeekId(d));
  }
  return weeks;
}

// --- History bar (same pattern as Chef) ---

type HistoryBarProps = {
  memberId: string;
  weekIds: string[];
  maxPoints: number;
  weeklyPoints: Record<string, number>;
};

function HistoryBar({ memberId, weekIds, maxPoints, weeklyPoints }: HistoryBarProps) {
  const member = FAMILY_MEMBERS.find((m) => m.id === memberId);
  if (!member) return null;

  return (
    <div className="flex items-end gap-1">
      <span className="w-16 shrink-0 text-xs font-semibold" style={{ color: member.color }}>
        {member.name}
      </span>
      {weekIds.map((wId) => {
        const pts = weeklyPoints[wId] ?? 0;
        const pct = maxPoints > 0 ? (pts / maxPoints) * 100 : 0;
        return (
          <div key={wId} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="relative h-16 w-full">
              <div
                className="absolute bottom-0 w-full rounded-t"
                style={{
                  height: `${Math.max(pct, 4)}%`,
                  backgroundColor: member.color,
                  opacity: 0.7,
                }}
              />
            </div>
            <span className="text-[10px] text-text-muted">{pts}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Main ---

function HomeRanking() {
  const [tab, setTab] = useState<'module' | 'global'>('module');
  const getMemberPoints = useHomeStatsStore((s) => s.getMemberPoints);
  const getMemberStreak = useHomeStatsStore((s) => s.getMemberStreak);
  const getMemberStats = useHomeStatsStore((s) => s.getMemberStats);
  const allStats = useHomeStatsStore((s) => s.stats);
  const instances = useTasksStore((s) => s.instances);

  const todayISO = useMemo(() => formatDateISO(new Date()), []);
  const currentWeekId = useMemo(() => getWeekId(new Date()), []);
  const lastWeekIds = useMemo(() => getLastWeekIds(4).reverse(), []);
  const weekLabels = lastWeekIds.map((w) => w.split('-W')[1]);

  const ranked = useMemo(() => {
    return FAMILY_MEMBERS
      .map((m) => ({
        memberId: m.id,
        points: getMemberPoints(m.id as MemberId),
        weekPoints: getMemberStats(m.id as MemberId).weeklyPoints[currentWeekId] ?? 0,
        streak: getMemberStreak(m.id as MemberId),
      }))
      .sort((a, b) => b.points - a.points);
  }, [getMemberPoints, getMemberStreak, getMemberStats, currentWeekId]);

  const memberTaskStats = useMemo(() => {
    const stats: Record<string, { doneToday: number; totalDone: number; overdue: number }> = {};
    for (const m of FAMILY_MEMBERS) {
      const mi = instances.filter((t) => t.assignedTo === m.id);
      stats[m.id] = {
        doneToday: mi.filter((t) => t.done && t.doneAt?.startsWith(todayISO)).length,
        totalDone: mi.filter((t) => t.done).length,
        overdue: mi.filter((t) => !t.done && t.dueDate < todayISO).length,
      };
    }
    return stats;
  }, [instances, todayISO]);

  const maxHistoryPoints = useMemo(() => {
    let max = 1;
    for (const s of Object.values(allStats)) {
      for (const wId of lastWeekIds) {
        const pts = (s.weeklyPoints ?? {})[wId] ?? 0;
        if (pts > max) max = pts;
      }
    }
    return max;
  }, [allStats, lastWeekIds]);

  const podium = ranked.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Award02Icon} size={22} color={ACCENT} aria-hidden="true" />
          <h1 className="font-display text-xl font-extrabold text-text-primary">Ranking</h1>
        </div>
        <p className="mt-1 text-sm text-text-muted">Quem está mandando bem nas tarefas?</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
        <button
          onClick={() => setTab('module')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'module' ? 'text-white shadow-sm' : 'text-text-muted hover:bg-gray-50'
          }`}
          style={tab === 'module' ? { backgroundColor: ACCENT } : undefined}
        >
          FamilyHome
        </button>
        <button
          onClick={() => setTab('global')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'global' ? 'bg-text-primary text-white shadow-sm' : 'text-text-muted hover:bg-gray-50'
          }`}
        >
          4Family
        </button>
      </div>

      {tab === 'module' ? (
        <>
          {/* 1. Podium */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-center text-sm font-bold text-text-muted">Top Tarefas</h2>
            <div className="flex items-end gap-2">
              {podium.length >= 2 && <PodiumMember memberId={podium[1].memberId} points={podium[1].points} place={2} accentColor={ACCENT} />}
              {podium.length >= 1 && <PodiumMember memberId={podium[0].memberId} points={podium[0].points} place={1} accentColor={ACCENT} />}
              {podium.length >= 3 && <PodiumMember memberId={podium[2].memberId} points={podium[2].points} place={3} accentColor={ACCENT} />}
            </div>
          </section>

          {/* 2. Lista com detalhes */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-text-muted">Pontuação</h2>
            <div className="flex flex-col gap-4">
              {ranked.map((entry, i) => {
                const member = FAMILY_MEMBERS.find((m) => m.id === entry.memberId);
                const ts = memberTaskStats[entry.memberId];
                if (!member) return null;
                return (
                  <div key={member.id} className="flex items-start gap-3">
                    <span className="mt-2 w-5 text-center text-sm font-bold text-text-muted">{i + 1}</span>
                    <div
                      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${member.color}20` }}
                    >
                      <Emoji name={member.emoji} width={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">{member.name}</span>
                        {entry.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: ACCENT }}>
                            <HugeiconsIcon icon={FireIcon} size={12} color={ACCENT} />
                            {entry.streak}d
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-text-muted">
                        <span>{ts?.totalDone ?? 0} feitas</span>
                        <span>{ts?.doneToday ?? 0} hoje</span>
                        {(ts?.overdue ?? 0) > 0 && (
                          <span className="text-red-500">{ts.overdue} atrasadas</span>
                        )}
                      </div>
                    </div>
                    <span className="mt-1 text-sm font-extrabold" style={{ color: ACCENT }}>
                      {entry.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Badges */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-text-muted">Badges</h2>
            <div className="flex flex-col gap-4">
              {FAMILY_MEMBERS.map((member) => {
                const ms = getMemberStats(member.id as MemberId);
                const memberBadges = ms.badges ?? [];
                return (
                  <div key={member.id}>
                    <span className="mb-1.5 block text-xs font-semibold" style={{ color: member.color }}>
                      {member.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {HOME_BADGES.map((badge) => {
                        const unlocked = memberBadges.includes(badge.id);
                        return (
                          <div
                            key={badge.id}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                              unlocked
                                ? 'border border-gray-100 bg-white text-text-primary'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {unlocked ? (
                              <Emoji name={badge.emoji} width={14} />
                            ) : (
                              <HugeiconsIcon icon={LockIcon} size={14} color="#9CA3AF" aria-hidden="true" />
                            )}
                            {badge.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Histórico últimas 4 semanas */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-text-muted">Últimas 4 semanas</h2>
            <div className="mb-1 flex">
              <div className="w-16 shrink-0" />
              {weekLabels.map((label) => (
                <span key={label} className="flex-1 text-center text-[10px] font-semibold text-text-muted">
                  S{label}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {FAMILY_MEMBERS.map((member) => (
                <HistoryBar
                  key={member.id}
                  memberId={member.id}
                  weekIds={lastWeekIds}
                  maxPoints={maxHistoryPoints}
                  weeklyPoints={allStats[member.id]?.weeklyPoints ?? {}}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <GlobalRankingPanel />
      )}
    </div>
  );
}

export default HomeRanking;
