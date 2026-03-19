import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { POINTS } from '../constants/points';
import { calculateStreakBonus } from '../utils/points';
import type { Meal, MemberStats } from '../types';

function createEmptyStats(memberId: string): MemberStats {
  return {
    memberId,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    badges: [],
    weeklyPoints: {},
  };
}

function computeStreak(doneDates: string[]): number {
  if (doneDates.length === 0) return 0;

  const unique = [...new Set(doneDates)].sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const mostRecent = new Date(unique[0] + 'T00:00:00');
  mostRecent.setHours(0, 0, 0, 0);
  const diffFromToday = Math.round((todayMs - mostRecent.getTime()) / 86_400_000);

  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1] + 'T00:00:00');
    const curr = new Date(unique[i] + 'T00:00:00');
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const gap = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function rowToStats(row: Record<string, unknown>): MemberStats {
  return {
    memberId: row.member_id as string,
    totalPoints: row.total_points as number,
    currentStreak: row.current_streak as number,
    longestStreak: row.longest_streak as number,
    badges: row.badges as string[],
    weeklyPoints: row.weekly_points as Record<string, number>,
  };
}

type StatsState = {
  stats: Record<string, MemberStats>;
  loading: boolean;
  fetchStats: () => Promise<void>;
  recordMealDone: (meal: Meal, allMeals: Meal[]) => Promise<void>;
  recordMealUndone: (meal: Meal, allMeals: Meal[]) => Promise<void>;
  recordMealDeleted: (meal: Meal, remainingMeals: Meal[]) => Promise<void>;
  recordMealPlanned: (meal: Meal) => Promise<void>;
  getWeekRanking: (weekId: string) => { memberId: string; points: number }[];
  getMemberStats: (memberId: string) => MemberStats;
};

async function upsertStats(memberStats: MemberStats) {
  await supabase.from('member_stats').upsert({
    member_id: memberStats.memberId,
    total_points: memberStats.totalPoints,
    current_streak: memberStats.currentStreak,
    longest_streak: memberStats.longestStreak,
    badges: memberStats.badges,
    weekly_points: memberStats.weeklyPoints,
    updated_at: new Date().toISOString(),
  });
}

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: {},
  loading: true,

  fetchStats: async () => {
    const { data, error } = await supabase
      .from('member_stats')
      .select('*');

    if (!error && data) {
      const stats: Record<string, MemberStats> = {};
      for (const row of data) {
        const s = rowToStats(row);
        stats[s.memberId] = s;
      }
      set({ stats, loading: false });
    } else {
      set({ loading: false });
    }
  },

  recordMealDone: async (meal, allMeals) => {
    const stats = { ...get().stats };

    for (const memberId of meal.responsibleIds) {
      const memberStats = { ...(stats[memberId] ?? createEmptyStats(memberId)) };

      memberStats.totalPoints += POINTS.MEAL_DONE;

      const weeklyPoints = { ...memberStats.weeklyPoints };
      weeklyPoints[meal.weekId] = (weeklyPoints[meal.weekId] ?? 0) + POINTS.MEAL_DONE;
      memberStats.weeklyPoints = weeklyPoints;

      const doneDates = allMeals
        .filter((m) => m.responsibleIds.includes(memberId) && m.done)
        .map((m) => m.date);
      if (!doneDates.includes(meal.date)) {
        doneDates.push(meal.date);
      }

      const previousStreak = memberStats.currentStreak;
      const newStreak = computeStreak(doneDates);
      memberStats.currentStreak = newStreak;
      memberStats.longestStreak = Math.max(memberStats.longestStreak, newStreak);

      const previousBonus = calculateStreakBonus(previousStreak);
      const newBonus = calculateStreakBonus(newStreak);
      const bonusDiff = newBonus - previousBonus;
      if (bonusDiff > 0) {
        memberStats.totalPoints += bonusDiff;
        weeklyPoints[meal.weekId] = (weeklyPoints[meal.weekId] ?? 0) + bonusDiff;
        memberStats.weeklyPoints = weeklyPoints;
      }

      stats[memberId] = memberStats;
      await upsertStats(memberStats);
    }

    set({ stats });
  },

  recordMealUndone: async (meal, allMeals) => {
    const stats = { ...get().stats };

    for (const memberId of meal.responsibleIds) {
      const memberStats = { ...(stats[memberId] ?? createEmptyStats(memberId)) };

      memberStats.totalPoints = Math.max(0, memberStats.totalPoints - POINTS.MEAL_DONE);

      const weeklyPoints = { ...memberStats.weeklyPoints };
      weeklyPoints[meal.weekId] = Math.max(0, (weeklyPoints[meal.weekId] ?? 0) - POINTS.MEAL_DONE);
      memberStats.weeklyPoints = weeklyPoints;

      // Recalcular streak sem essa refeição
      const doneDates = allMeals
        .filter((m) => m.id !== meal.id && m.responsibleIds.includes(memberId) && m.done)
        .map((m) => m.date);

      memberStats.currentStreak = computeStreak(doneDates);

      stats[memberId] = memberStats;
      await upsertStats(memberStats);
    }

    set({ stats });
  },

  recordMealDeleted: async (meal, remainingMeals) => {
    if (!meal.done) return; // Só reverte pontos se a refeição estava concluída

    const stats = { ...get().stats };

    for (const memberId of meal.responsibleIds) {
      const memberStats = { ...(stats[memberId] ?? createEmptyStats(memberId)) };

      memberStats.totalPoints = Math.max(0, memberStats.totalPoints - POINTS.MEAL_DONE);

      const weeklyPoints = { ...memberStats.weeklyPoints };
      weeklyPoints[meal.weekId] = Math.max(0, (weeklyPoints[meal.weekId] ?? 0) - POINTS.MEAL_DONE);
      memberStats.weeklyPoints = weeklyPoints;

      // Recalcular streak sem a refeição deletada
      const doneDates = remainingMeals
        .filter((m) => m.responsibleIds.includes(memberId) && m.done)
        .map((m) => m.date);

      memberStats.currentStreak = computeStreak(doneDates);

      stats[memberId] = memberStats;
      await upsertStats(memberStats);
    }

    set({ stats });
  },

  recordMealPlanned: async (meal) => {
    const stats = { ...get().stats };

    for (const memberId of meal.responsibleIds) {
      const memberStats = { ...(stats[memberId] ?? createEmptyStats(memberId)) };

      memberStats.totalPoints += POINTS.MEAL_PLANNED;

      const weeklyPoints = { ...memberStats.weeklyPoints };
      weeklyPoints[meal.weekId] = (weeklyPoints[meal.weekId] ?? 0) + POINTS.MEAL_PLANNED;
      memberStats.weeklyPoints = weeklyPoints;

      stats[memberId] = memberStats;
      await upsertStats(memberStats);
    }

    set({ stats });
  },

  getWeekRanking: (weekId) => {
    const { stats } = get();
    return Object.values(stats)
      .map((s) => ({
        memberId: s.memberId,
        points: s.weeklyPoints[weekId] ?? 0,
      }))
      .sort((a, b) => b.points - a.points);
  },

  getMemberStats: (memberId) => {
    return get().stats[memberId] ?? createEmptyStats(memberId);
  },
}));
