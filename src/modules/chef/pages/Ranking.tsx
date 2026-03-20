import { useMemo, useState } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award02Icon, LockIcon } from '@hugeicons/core-free-icons';
import { useStatsStore } from '../store/statsStore';
import { FAMILY_MEMBERS } from '../../../core/constants/members';
import { ALL_BADGES } from '../../../core/constants/badges';
import { getWeekId, getMonday } from '../../../core/utils/dates';
import { PodiumMember, GlobalRankingPanel } from '../../../core/components/RankingTabs';

const ACCENT = '#FF6B6B';

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

function Ranking() {
  const [tab, setTab] = useState<'module' | 'global'>('module');
  const stats = useStatsStore((s) => s.stats);

  const currentWeekId = useMemo(() => getWeekId(new Date()), []);
  const lastWeekIds = useMemo(() => getLastWeekIds(4).reverse(), []);

  const fullRanking = useMemo(() => {
    const ranked = FAMILY_MEMBERS.map((m) => ({
      memberId: m.id,
      points: stats[m.id]?.weeklyPoints[currentWeekId] ?? 0,
    }));
    return ranked.sort((a, b) => b.points - a.points);
  }, [stats, currentWeekId]);

  const maxHistoryPoints = useMemo(() => {
    let max = 1;
    for (const s of Object.values(stats)) {
      for (const wId of lastWeekIds) {
        const pts = s.weeklyPoints[wId] ?? 0;
        if (pts > max) max = pts;
      }
    }
    return max;
  }, [stats, lastWeekIds]);

  const podiumMembers = fullRanking.slice(0, 3);
  const weekLabels = lastWeekIds.map((w) => w.split('-W')[1]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Award02Icon} size={22} color={ACCENT} aria-hidden="true" />
          <h1 className="font-display text-xl font-extrabold text-text-primary">Ranking</h1>
        </div>
        <p className="mt-1 text-sm text-text-muted">Quem está mandando bem esta semana?</p>
      </div>

      {/* Tabs: Module / Global */}
      <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
        <button
          onClick={() => setTab('module')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'module' ? 'text-white shadow-sm' : 'text-text-muted hover:bg-gray-50'
          }`}
          style={tab === 'module' ? { backgroundColor: ACCENT } : undefined}
        >
          FamilyChef
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
            <h2 className="mb-4 text-center text-sm font-bold text-text-muted">
              Top da Semana {currentWeekId.split('-W')[1]}
            </h2>
            <div className="flex items-end gap-2">
              {podiumMembers.length >= 2 && (
                <PodiumMember memberId={podiumMembers[1].memberId} points={podiumMembers[1].points} place={2} accentColor={ACCENT} />
              )}
              {podiumMembers.length >= 1 && (
                <PodiumMember memberId={podiumMembers[0].memberId} points={podiumMembers[0].points} place={1} accentColor={ACCENT} />
              )}
              {podiumMembers.length >= 3 && (
                <PodiumMember memberId={podiumMembers[2].memberId} points={podiumMembers[2].points} place={3} accentColor={ACCENT} />
              )}
            </div>
          </section>

          {/* 2. Lista completa */}
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-text-muted">Pontuação</h2>
            <div className="flex flex-col gap-3">
              {fullRanking.map((entry, i) => {
                const member = FAMILY_MEMBERS.find((m) => m.id === entry.memberId);
                const memberStats = stats[entry.memberId];
                if (!member) return null;
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="w-5 text-center text-sm font-bold text-text-muted">
                      {i + 1}
                    </span>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${member.color}20` }}
                    >
                      <Emoji name={member.emoji} width={22} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-text-primary">{member.name}</span>
                      <span className="ml-1 text-xs text-text-muted">
                        Total: {memberStats?.totalPoints ?? 0}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: member.color }}>
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
                const memberBadges = stats[member.id]?.badges ?? [];
                return (
                  <div key={member.id}>
                    <span className="mb-1.5 block text-xs font-semibold" style={{ color: member.color }}>
                      {member.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ALL_BADGES.map((badge) => {
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

          {/* 4. Histórico */}
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
                  weeklyPoints={stats[member.id]?.weeklyPoints ?? {}}
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

export default Ranking;
