import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import { getFamilyId } from '../../../core/hooks/useFamilyId';
import { formatDateISO, getWeekId } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';
import type { TaskInstance } from '../types';

type HomeStats = {
  memberId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string;
  badges: string[];
  weeklyPoints: Record<string, number>;
};

function createEmpty(memberId: string): HomeStats {
  return { memberId, totalPoints: 0, currentStreak: 0, longestStreak: 0, lastStreakDate: '', badges: [], weeklyPoints: {} };
}

const POINTS = {
  TASK_ON_TIME: 10,
  TASK_EARLY: 15,
  TASK_LATE: 5,
  TASK_AD_HOC: 8,
} as const;

function calcPoints(task: TaskInstance): number {
  if (!task.recurringTaskId) return POINTS.TASK_AD_HOC;
  const late = task.lateByDays ?? 0;
  if (late > 0) return POINTS.TASK_LATE;
  if (task.doneAt && task.dueDate) {
    const doneDate = task.doneAt.slice(0, 10);
    if (doneDate < task.dueDate) return POINTS.TASK_EARLY;
  }
  return POINTS.TASK_ON_TIME;
}

function rowToStats(row: Record<string, unknown>): HomeStats {
  return {
    memberId: row.member_id as string,
    totalPoints: row.total_points as number,
    currentStreak: row.current_streak as number,
    longestStreak: row.longest_streak as number,
    lastStreakDate: (row.last_streak_date as string) ?? '',
    badges: row.badges as string[],
    weeklyPoints: row.weekly_points as Record<string, number>,
  };
}

async function upsertStats(ms: HomeStats) {
  await supabase.from('home_stats').upsert({
    family_id: getFamilyId(),
    member_id: ms.memberId,
    total_points: ms.totalPoints,
    current_streak: ms.currentStreak,
    longest_streak: ms.longestStreak,
    last_streak_date: ms.lastStreakDate || null,
    badges: ms.badges,
    weekly_points: ms.weeklyPoints,
    updated_at: new Date().toISOString(),
  });
}

type HomeStatsState = {
  stats: Record<string, HomeStats>;
  loading: boolean;
  fetchHomeStats: () => Promise<void>;
  recordTaskDone: (task: TaskInstance) => number;
  recordTaskUndone: (task: TaskInstance) => void;
  getMemberPoints: (memberId: MemberId) => number;
  getMemberStreak: (memberId: MemberId) => number;
  getMemberStats: (memberId: MemberId) => HomeStats;
};

export const useHomeStatsStore = create<HomeStatsState>((set, get) => ({
  stats: {},
  loading: true,

  fetchHomeStats: async () => {
    const familyId = getFamilyId();
    let query = supabase.from('home_stats').select('*');
    if (familyId) query = query.eq('family_id', familyId);
    const { data, error } = await query;
    if (!error && data) {
      const stats: Record<string, HomeStats> = {};
      for (const row of data) {
        const s = rowToStats(row);
        stats[s.memberId] = s;
      }
      set({ stats, loading: false });
    } else {
      set({ loading: false });
    }
  },

  recordTaskDone: (task) => {
    if (!task.assignedTo) return 0; // unassigned tasks don't earn points
    const memberId = task.assignedTo;
    const stats = { ...get().stats };
    const ms = { ...(stats[memberId] ?? createEmpty(memberId)) };
    const points = calcPoints(task);
    ms.totalPoints += points;

    const weekId = getWeekId(new Date());
    const wp = { ...ms.weeklyPoints };
    wp[weekId] = (wp[weekId] ?? 0) + points;
    ms.weeklyPoints = wp;

    const todayISO = formatDateISO(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatDateISO(yesterday);

    if (ms.lastStreakDate === todayISO) {
      // already counted
    } else if (ms.lastStreakDate === yesterdayISO) {
      ms.currentStreak += 1;
      ms.lastStreakDate = todayISO;
    } else {
      ms.currentStreak = 1;
      ms.lastStreakDate = todayISO;
    }
    ms.longestStreak = Math.max(ms.longestStreak, ms.currentStreak);

    const badges = [...(ms.badges ?? [])];
    if (!badges.includes('primeira_tarefa')) badges.push('primeira_tarefa');
    if (ms.currentStreak >= 3 && !badges.includes('streak_3')) badges.push('streak_3');
    if (ms.currentStreak >= 7 && !badges.includes('streak_7')) badges.push('streak_7');
    if (ms.totalPoints >= 100 && !badges.includes('centenario')) badges.push('centenario');
    ms.badges = badges;

    stats[memberId] = ms;
    set({ stats });
    upsertStats(ms);
    return points;
  },

  recordTaskUndone: (task) => {
    if (!task.assignedTo) return;
    const memberId = task.assignedTo;
    const stats = { ...get().stats };
    const ms = { ...(stats[memberId] ?? createEmpty(memberId)) };
    const points = calcPoints(task);
    ms.totalPoints = Math.max(0, ms.totalPoints - points);

    const weekId = getWeekId(new Date());
    const wp = { ...ms.weeklyPoints };
    wp[weekId] = Math.max(0, (wp[weekId] ?? 0) - points);
    ms.weeklyPoints = wp;

    stats[memberId] = ms;
    set({ stats });
    upsertStats(ms);
  },

  getMemberPoints: (memberId) => get().stats[memberId]?.totalPoints ?? 0,

  getMemberStreak: (memberId) => {
    const ms = get().stats[memberId];
    if (!ms) return 0;
    const todayISO = formatDateISO(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatDateISO(yesterday);
    if (ms.lastStreakDate === todayISO || ms.lastStreakDate === yesterdayISO) return ms.currentStreak;
    return 0;
  },

  getMemberStats: (memberId) => get().stats[memberId] ?? createEmpty(memberId),
}));

export const HOME_BADGES = [
  { id: 'primeira_tarefa', label: 'Primeira Tarefa', emoji: 'broom' },
  { id: 'streak_3',        label: '3 Dias Seguidos', emoji: 'fire' },
  { id: 'streak_7',        label: 'Semana Completa', emoji: 'star' },
  { id: 'centenario',      label: '100 Pontos',      emoji: 'hundred-points' },
] as const;
