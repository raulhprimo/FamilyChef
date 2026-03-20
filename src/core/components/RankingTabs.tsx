import { useMemo } from 'react';
import { Emoji } from 'react-apple-emojis';
import { HugeiconsIcon } from '@hugeicons/react';
import { FireIcon } from '@hugeicons/core-free-icons';
import { FAMILY_MEMBERS } from '../constants/members';
import type { MemberId } from '../constants/members';
import { useGlobalStatsStore, GLOBAL_BADGES } from '../store/globalStatsStore';

// --- Shared podium ---

type PodiumMemberProps = {
  memberId: string;
  points: number;
  place: 1 | 2 | 3;
  accentColor: string;
};

const PODIUM_HEIGHT: Record<1 | 2 | 3, string> = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
const PODIUM_ORDER: Record<1 | 2 | 3, string> = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };

function PodiumMember({ memberId, points, place, accentColor }: PodiumMemberProps) {
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
      <span className="text-xs font-semibold text-text-muted">{points} pts</span>
      <div
        className={`mt-2 w-full rounded-t-xl ${PODIUM_HEIGHT[place]}`}
        style={{ backgroundColor: `${accentColor}30` }}
      >
        <div className="flex h-full items-start justify-center pt-2">
          <span className="text-lg font-extrabold" style={{ color: accentColor }}>
            {place}º
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Global ranking panel ---

const MODULE_COLORS = { chef: '#FF6B6B', home: '#F9A825', fin: '#4ECDC4' };

function GlobalRankingPanel() {
  const getAllRanked = useGlobalStatsStore((s) => s.getAllRanked);
  const globalStats = useGlobalStatsStore((s) => s.globalStats);
  const recalculateScore = useGlobalStatsStore((s) => s.recalculateScore);

  useMemo(() => {
    for (const m of FAMILY_MEMBERS) {
      recalculateScore(m.id as MemberId);
    }
  }, [recalculateScore]);

  const ranked = getAllRanked();
  const podium = ranked.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Podium */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-center text-sm font-bold text-text-muted">4Family Score</h2>
        <div className="flex items-end gap-2">
          {podium.length >= 2 && <PodiumMember memberId={podium[1].memberId} points={podium[1].fourFamilyScore} place={2} accentColor="#1A1A1A" />}
          {podium.length >= 1 && <PodiumMember memberId={podium[0].memberId} points={podium[0].fourFamilyScore} place={1} accentColor="#1A1A1A" />}
          {podium.length >= 3 && <PodiumMember memberId={podium[2].memberId} points={podium[2].fourFamilyScore} place={3} accentColor="#1A1A1A" />}
        </div>
      </section>

      {/* Breakdown */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-text-muted">Pontuação por módulo</h2>
        <div className="flex flex-col gap-3">
          {ranked.map((gs) => {
            const member = FAMILY_MEMBERS.find((m) => m.id === gs.memberId);
            if (!member) return null;
            return (
              <div key={gs.memberId} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${member.color}20` }}
                >
                  <Emoji name={member.emoji} width={22} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-text-primary">{member.name}</span>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-text-muted">
                    <span style={{ color: MODULE_COLORS.chef }}>Chef {gs.modulePoints.chef}</span>
                    <span style={{ color: MODULE_COLORS.home }}>Home {gs.modulePoints.home}</span>
                    <span style={{ color: MODULE_COLORS.fin }}>Fin {gs.modulePoints.fin}</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-text-primary">{gs.fourFamilyScore}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global badges */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-text-muted">Badges Globais</h2>
        <div className="flex flex-col gap-4">
          {FAMILY_MEMBERS.map((member) => {
            const badges = globalStats[member.id]?.badges ?? [];
            return (
              <div key={member.id}>
                <span className="mb-1.5 block text-xs font-semibold" style={{ color: member.color }}>{member.name}</span>
                <div className="flex flex-wrap gap-2">
                  {GLOBAL_BADGES.map((badge) => {
                    const unlocked = badges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                          unlocked ? 'border border-gray-100 bg-white text-text-primary' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {unlocked ? <Emoji name={badge.emoji} width={14} /> : <HugeiconsIcon icon={FireIcon} size={14} color="#9CA3AF" />}
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
  );
}

export { PodiumMember, GlobalRankingPanel };
