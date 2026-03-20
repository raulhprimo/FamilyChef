import { create } from 'zustand';
import { getWeekId } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';

const STORAGE_KEY = '4family_fin_stats';

type FinStats = {
  memberId: string;
  totalPoints: number;
  weeklyPoints: Record<string, number>;
  badges: string[];
};

function createEmpty(memberId: string): FinStats {
  return { memberId, totalPoints: 0, weeklyPoints: {}, badges: [] };
}

function load(): Record<string, FinStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function save(stats: Record<string, FinStats>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export const FIN_BADGES = [
  { id: 'primeiro_gasto', label: 'Primeiro Gasto', emoji: 'money-with-wings' },
  { id: 'meta_atingida',  label: 'Meta Atingida',  emoji: 'trophy' },
  { id: 'sem_dividas',    label: 'Sem Dívidas',    emoji: 'check-mark-button' },
  { id: 'cem_pontos',     label: '100 Pontos',     emoji: 'hundred-points' },
] as const;

type FinStatsState = {
  stats: Record<string, FinStats>;
  addPoints: (memberId: MemberId, points: number) => void;
  getMemberPoints: (memberId: MemberId) => number;
  getMemberStats: (memberId: MemberId) => FinStats;
  addBadge: (memberId: MemberId, badgeId: string) => void;
};

export const useFinStatsStore = create<FinStatsState>((set, get) => ({
  stats: load(),

  addPoints: (memberId, points) => {
    const stats = { ...get().stats };
    const ms = { ...(stats[memberId] ?? createEmpty(memberId)) };
    ms.totalPoints += points;

    const weekId = getWeekId(new Date());
    const wp = { ...ms.weeklyPoints };
    wp[weekId] = (wp[weekId] ?? 0) + points;
    ms.weeklyPoints = wp;

    // Auto-badges
    const badges = [...(ms.badges ?? [])];
    if (!badges.includes('primeiro_gasto')) badges.push('primeiro_gasto');
    if (ms.totalPoints >= 100 && !badges.includes('cem_pontos')) badges.push('cem_pontos');
    ms.badges = badges;

    stats[memberId] = ms;
    set({ stats });
    save(stats);
  },

  getMemberPoints: (memberId) => {
    return get().stats[memberId]?.totalPoints ?? 0;
  },

  getMemberStats: (memberId) => {
    return get().stats[memberId] ?? createEmpty(memberId);
  },

  addBadge: (memberId, badgeId) => {
    const stats = { ...get().stats };
    const ms = { ...(stats[memberId] ?? createEmpty(memberId)) };
    const badges = [...(ms.badges ?? [])];
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      ms.badges = badges;
      stats[memberId] = ms;
      set({ stats });
      save(stats);
    }
  },
}));
