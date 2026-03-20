import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import { getWeekId } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';

type FinStats = {
  memberId: string;
  totalPoints: number;
  weeklyPoints: Record<string, number>;
  badges: string[];
};

function createEmpty(memberId: string): FinStats {
  return { memberId, totalPoints: 0, weeklyPoints: {}, badges: [] };
}

function rowToStats(row: Record<string, unknown>): FinStats {
  return {
    memberId: row.member_id as string,
    totalPoints: row.total_points as number,
    badges: row.badges as string[],
    weeklyPoints: row.weekly_points as Record<string, number>,
  };
}

async function upsertStats(ms: FinStats) {
  await supabase.from('fin_stats').upsert({
    member_id: ms.memberId,
    total_points: ms.totalPoints,
    badges: ms.badges,
    weekly_points: ms.weeklyPoints,
    updated_at: new Date().toISOString(),
  });
}

export const FIN_BADGES = [
  { id: 'primeiro_gasto', label: 'Primeiro Gasto', emoji: 'money-with-wings' },
  { id: 'meta_atingida',  label: 'Meta Atingida',  emoji: 'trophy' },
  { id: 'sem_dividas',    label: 'Sem Dívidas',    emoji: 'check-mark-button' },
  { id: 'cem_pontos',     label: '100 Pontos',     emoji: 'hundred-points' },
] as const;

type FinStatsState = {
  stats: Record<string, FinStats>;
  loading: boolean;
  fetchFinStats: () => Promise<void>;
  addPoints: (memberId: MemberId, points: number) => void;
  getMemberPoints: (memberId: MemberId) => number;
  getMemberStats: (memberId: MemberId) => FinStats;
  addBadge: (memberId: MemberId, badgeId: string) => void;
};

export const useFinStatsStore = create<FinStatsState>((set, get) => ({
  stats: {},
  loading: true,

  fetchFinStats: async () => {
    const { data, error } = await supabase.from('fin_stats').select('*');
    if (!error && data) {
      const stats: Record<string, FinStats> = {};
      for (const row of data) {
        const s = rowToStats(row);
        stats[s.memberId] = s;
      }
      set({ stats, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addPoints: (memberId, points) => {
    const stats = { ...get().stats };
    const ms = { ...(stats[memberId] ?? createEmpty(memberId)) };
    ms.totalPoints += points;

    const weekId = getWeekId(new Date());
    const wp = { ...ms.weeklyPoints };
    wp[weekId] = (wp[weekId] ?? 0) + points;
    ms.weeklyPoints = wp;

    const badges = [...(ms.badges ?? [])];
    if (!badges.includes('primeiro_gasto')) badges.push('primeiro_gasto');
    if (ms.totalPoints >= 100 && !badges.includes('cem_pontos')) badges.push('cem_pontos');
    ms.badges = badges;

    stats[memberId] = ms;
    set({ stats });
    upsertStats(ms);
  },

  getMemberPoints: (memberId) => get().stats[memberId]?.totalPoints ?? 0,

  getMemberStats: (memberId) => get().stats[memberId] ?? createEmpty(memberId),

  addBadge: (memberId, badgeId) => {
    const stats = { ...get().stats };
    const ms = { ...(stats[memberId] ?? createEmpty(memberId)) };
    const badges = [...(ms.badges ?? [])];
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      ms.badges = badges;
      stats[memberId] = ms;
      set({ stats });
      upsertStats(ms);
    }
  },
}));
