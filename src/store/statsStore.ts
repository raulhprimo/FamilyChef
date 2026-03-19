import { create } from 'zustand';
import { POINTS } from '../constants/points';
import { calculateStreakBonus } from '../utils/points';
import type { Meal, MemberStats } from '../types';

const STORAGE_KEY = 'familychef_stats';

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

function loadStats(): Record<string, MemberStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MemberStats>) : {};
  } catch {
    return {};
  }
}

function persistStats(stats: Record<string, MemberStats>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/**
 * Calcula o streak atual a partir das datas de refeições concluídas.
 * Streak = dias corridos consecutivos até hoje (ou ontem) em que o membro
 * completou pelo menos 1 refeição.
 */
function computeStreak(doneDates: string[]): number {
  if (doneDates.length === 0) return 0;

  const unique = [...new Set(doneDates)].sort().reverse(); // mais recente primeiro

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const mostRecent = new Date(unique[0] + 'T00:00:00');
  mostRecent.setHours(0, 0, 0, 0);
  const diffFromToday = Math.round((todayMs - mostRecent.getTime()) / 86_400_000);

  // Se a data mais recente não é hoje nem ontem, streak quebrou
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

type StatsState = {
  stats: Record<string, MemberStats>;
  recordMealDone: (meal: Meal, allMeals: Meal[]) => void;
  recordMealPlanned: (meal: Meal) => void;
  getWeekRanking: (weekId: string) => { memberId: string; points: number }[];
  getMemberStats: (memberId: string) => MemberStats;
};

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: loadStats(),

  recordMealDone: (meal, allMeals) => {
    set((state) => {
      const stats = { ...state.stats };
      const memberId = meal.responsibleId;
      const memberStats = { ...(stats[memberId] ?? createEmptyStats(memberId)) };

      // +10 pontos pela refeição
      memberStats.totalPoints += POINTS.MEAL_DONE;

      // Pontos semanais
      const weeklyPoints = { ...memberStats.weeklyPoints };
      weeklyPoints[meal.weekId] = (weeklyPoints[meal.weekId] ?? 0) + POINTS.MEAL_DONE;
      memberStats.weeklyPoints = weeklyPoints;

      // Recalcular streak com todas as refeições concluídas deste membro
      const doneDates = allMeals
        .filter((m) => m.responsibleId === memberId && m.done)
        .map((m) => m.date);
      // Incluir a refeição atual (pode ainda não estar no array allMeals atualizado)
      if (!doneDates.includes(meal.date)) {
        doneDates.push(meal.date);
      }

      const previousStreak = memberStats.currentStreak;
      const newStreak = computeStreak(doneDates);
      memberStats.currentStreak = newStreak;
      memberStats.longestStreak = Math.max(memberStats.longestStreak, newStreak);

      // Bônus de streak (só concede quando atinge o patamar pela primeira vez)
      const previousBonus = calculateStreakBonus(previousStreak);
      const newBonus = calculateStreakBonus(newStreak);
      const bonusDiff = newBonus - previousBonus;
      if (bonusDiff > 0) {
        memberStats.totalPoints += bonusDiff;
        weeklyPoints[meal.weekId] = (weeklyPoints[meal.weekId] ?? 0) + bonusDiff;
        memberStats.weeklyPoints = weeklyPoints;
      }

      stats[memberId] = memberStats;
      persistStats(stats);
      return { stats };
    });
  },

  recordMealPlanned: (meal) => {
    set((state) => {
      const stats = { ...state.stats };
      const memberId = meal.responsibleId;
      const memberStats = { ...(stats[memberId] ?? createEmptyStats(memberId)) };

      memberStats.totalPoints += POINTS.MEAL_PLANNED;

      const weeklyPoints = { ...memberStats.weeklyPoints };
      weeklyPoints[meal.weekId] = (weeklyPoints[meal.weekId] ?? 0) + POINTS.MEAL_PLANNED;
      memberStats.weeklyPoints = weeklyPoints;

      stats[memberId] = memberStats;
      persistStats(stats);
      return { stats };
    });
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
