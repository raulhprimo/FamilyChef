import { create } from 'zustand';
import { formatDateISO, getWeekId } from '../../../core/utils/dates';
import type { MemberId } from '../../../core/constants/members';
import type { TaskInstance } from '../types';

const STORAGE_KEY = '4family_home_stats';

const POINTS = {
  TASK_ON_TIME: 10,
  TASK_EARLY: 15,
  TASK_LATE: 5,
  TASK_AD_HOC: 8,
} as const;

type HomeStats = {
  memberId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string;
  badges: string[];
  weeklyPoints: Record<string, number>; // weekId → pontos
};

function createEmpty(memberId: string): HomeStats {
  return {
    memberId,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: '',
    badges: [],
    weeklyPoints: {},
  };
}

function loadFromStorage(): Record<string, HomeStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(stats: Record<string, HomeStats>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

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

type HomeStatsState = {
  stats: Record<string, HomeStats>;
  recordTaskDone: (task: TaskInstance) => number;
  recordTaskUndone: (task: TaskInstance) => void;
  getMemberPoints: (memberId: MemberId) => number;
  getMemberStreak: (memberId: MemberId) => number;
  getMemberStats: (memberId: MemberId) => HomeStats;
};

export const useHomeStatsStore = create<HomeStatsState>((set, get) => ({
  stats: loadFromStorage(),

  recordTaskDone: (task) => {
    const stats = { ...get().stats };
    const ms = { ...(stats[task.assignedTo] ?? createEmpty(task.assignedTo)) };
    const points = calcPoints(task);
    ms.totalPoints += points;

    // Weekly points
    const weekId = getWeekId(new Date());
    const wp = { ...ms.weeklyPoints };
    wp[weekId] = (wp[weekId] ?? 0) + points;
    ms.weeklyPoints = wp;

    // Update streak
    const todayISO = formatDateISO(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatDateISO(yesterday);

    if (ms.lastStreakDate === todayISO) {
      // Already counted today
    } else if (ms.lastStreakDate === yesterdayISO) {
      ms.currentStreak += 1;
      ms.lastStreakDate = todayISO;
    } else {
      ms.currentStreak = 1;
      ms.lastStreakDate = todayISO;
    }
    ms.longestStreak = Math.max(ms.longestStreak, ms.currentStreak);

    // Auto-badges
    const badges = [...(ms.badges ?? [])];
    if (!badges.includes('primeira_tarefa')) badges.push('primeira_tarefa');
    if (ms.currentStreak >= 3 && !badges.includes('streak_3')) badges.push('streak_3');
    if (ms.currentStreak >= 7 && !badges.includes('streak_7')) badges.push('streak_7');
    if (ms.totalPoints >= 100 && !badges.includes('centenario')) badges.push('centenario');
    ms.badges = badges;

    stats[task.assignedTo] = ms;
    set({ stats });
    saveToStorage(stats);
    return points;
  },

  recordTaskUndone: (task) => {
    const stats = { ...get().stats };
    const ms = { ...(stats[task.assignedTo] ?? createEmpty(task.assignedTo)) };
    const points = calcPoints(task);
    ms.totalPoints = Math.max(0, ms.totalPoints - points);

    const weekId = getWeekId(new Date());
    const wp = { ...ms.weeklyPoints };
    wp[weekId] = Math.max(0, (wp[weekId] ?? 0) - points);
    ms.weeklyPoints = wp;

    stats[task.assignedTo] = ms;
    set({ stats });
    saveToStorage(stats);
  },

  getMemberPoints: (memberId) => {
    return get().stats[memberId]?.totalPoints ?? 0;
  },

  getMemberStreak: (memberId) => {
    const ms = get().stats[memberId];
    if (!ms) return 0;
    const todayISO = formatDateISO(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatDateISO(yesterday);
    if (ms.lastStreakDate === todayISO || ms.lastStreakDate === yesterdayISO) {
      return ms.currentStreak;
    }
    return 0;
  },

  getMemberStats: (memberId) => {
    return get().stats[memberId] ?? createEmpty(memberId);
  },
}));

// Badges específicos do FamilyHome
export const HOME_BADGES = [
  { id: 'primeira_tarefa', label: 'Primeira Tarefa', emoji: 'broom' },
  { id: 'streak_3',        label: '3 Dias Seguidos', emoji: 'fire' },
  { id: 'streak_7',        label: 'Semana Completa', emoji: 'star' },
  { id: 'centenario',      label: '100 Pontos',      emoji: 'hundred-points' },
] as const;
