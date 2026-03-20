import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award02Icon, ArrowLeft01Icon, FireIcon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../core/constants/members';
import { useGlobalStatsStore, GLOBAL_BADGES } from '../core/store/globalStatsStore';

// --- Sub-components ---

type PodiumMemberProps = {
  memberId: string;
  score: number;
  place: 1 | 2 | 3;
};

const PODIUM_HEIGHT: Record<1 | 2 | 3, string> = {
  1: 'h-28',
  2: 'h-20',
  3: 'h-16',
};

const PODIUM_ORDER: Record<1 | 2 | 3, string> = {
  1: 'order-2',
  2: 'order-1',
  3: 'order-3',
};

function PodiumMember({ memberId, score, place }: PodiumMemberProps) {
  const member = FAMILY_MEMBERS.find((m) => m.id === memberId);
  if (!member) return null;

  return (
    <div
      className={`flex flex-1 flex-col items-center ${PODIUM_ORDER[place]} animate-slide-up`}
      style={{ animationDelay: `${place * 100}ms` }}
    >
      <div className="relative mb-2">
        {place === 1 && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Emoji name="crown" width={24} />
          </div>
        )}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${member.color}25` }}
        >
          <Emoji name={member.emoji} width={32} />
        </div>
      </div>

      <span className="text-sm font-bold text-text-primary">{member.name}</span>
      <span className="text-xs font-semibold text-text-muted">{score} pts</span>

      <div
        className={`mt-2 w-full rounded-t-xl ${PODIUM_HEIGHT[place]}`}
        style={{ backgroundColor: `${member.color}30` }}
      >
        <div className="flex h-full items-start justify-center pt-2">
          <span className="text-lg font-extrabold" style={{ color: member.color }}>
            {place}º
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Module breakdown ---

type ModuleBreakdownProps = {
  memberId: string;
  chef: number;
  home: number;
  fin: number;
};

const MODULE_COLORS = {
  chef: '#FF6B6B',
  home: '#F9A825',
  fin: '#4ECDC4',
};

function ModuleBreakdown({ memberId, chef, home, fin }: ModuleBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const member = FAMILY_MEMBERS.find((m) => m.id === memberId);
  if (!member) return null;

  const total = Math.round(chef * 0.4 + home * 0.4 + fin * 0.2);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${member.color}20` }}
        >
          <Emoji name={member.emoji} width={24} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-text-primary">{member.name}</span>
        </div>
        <span className="text-base font-extrabold" style={{ color: member.color }}>
          {total} pts
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex flex-col gap-2">
            {([
              { label: 'FamilyChef', pts: chef, weight: '40%', color: MODULE_COLORS.chef },
              { label: 'FamilyHome', pts: home, weight: '40%', color: MODULE_COLORS.home },
              { label: 'FamilyFin', pts: fin, weight: '20%', color: MODULE_COLORS.fin },
            ]).map((mod) => (
              <div key={mod.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: mod.color }} />
                  <span className="text-xs text-text-muted">{mod.label}</span>
                  <span className="text-[10px] text-gray-400">({mod.weight})</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">{mod.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main page ---

function GlobalRankingPage() {
  const navigate = useNavigate();
  const getAllRanked = useGlobalStatsStore((s) => s.getAllRanked);
  const globalStats = useGlobalStatsStore((s) => s.globalStats);

  // Recalculate all on mount
  const recalculateScore = useGlobalStatsStore((s) => s.recalculateScore);
  useMemo(() => {
    for (const m of FAMILY_MEMBERS) {
      recalculateScore(m.id as 'elaine' | 'felipe' | 'leticia' | 'raul');
    }
  }, [recalculateScore]);

  const ranked = getAllRanked();
  const podium = ranked.slice(0, 3);

  return (
    <main className="min-h-svh bg-bg-primary px-4 py-6">
      <div className="mx-auto max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/select-module')}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            aria-label="Voltar"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#6B7280" />
          </button>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Award02Icon} size={24} color="#1A1A1A" />
            <h1 className="font-display text-xl font-extrabold text-text-primary">
              4Family Score
            </h1>
          </div>
        </div>

        {/* Podium */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-center text-sm font-bold text-text-muted">
            Ranking Geral
          </h2>
          <div className="flex items-end gap-2">
            {podium.length >= 2 && (
              <PodiumMember memberId={podium[1].memberId} score={podium[1].fourFamilyScore} place={2} />
            )}
            {podium.length >= 1 && (
              <PodiumMember memberId={podium[0].memberId} score={podium[0].fourFamilyScore} place={1} />
            )}
            {podium.length >= 3 && (
              <PodiumMember memberId={podium[2].memberId} score={podium[2].fourFamilyScore} place={3} />
            )}
          </div>
        </section>

        {/* Full list with breakdown */}
        <section>
          <h2 className="mb-3 text-sm font-bold text-text-muted">Pontuação por módulo</h2>
          <div className="flex flex-col gap-3">
            {ranked.map((gs) => (
              <ModuleBreakdown
                key={gs.memberId}
                memberId={gs.memberId}
                chef={gs.modulePoints.chef}
                home={gs.modulePoints.home}
                fin={gs.modulePoints.fin}
              />
            ))}
          </div>
        </section>

        {/* Global badges */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-text-muted">Badges Globais</h2>
          <div className="flex flex-col gap-4">
            {FAMILY_MEMBERS.map((member) => {
              const memberBadges = globalStats[member.id]?.badges ?? [];
              return (
                <div key={member.id}>
                  <span className="mb-1.5 block text-xs font-semibold" style={{ color: member.color }}>
                    {member.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {GLOBAL_BADGES.map((badge) => {
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
                            <HugeiconsIcon icon={FireIcon} size={14} color="#9CA3AF" aria-hidden="true" />
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
      </div>
    </main>
  );
}

export default GlobalRankingPage;
