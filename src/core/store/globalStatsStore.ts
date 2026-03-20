import { create } from 'zustand';
import { FAMILY_MEMBERS } from '../constants/members';
import type { MemberId } from '../constants/members';
import { useStatsStore } from '../../modules/chef/store/statsStore';
import { useHomeStatsStore } from '../../modules/home/store/homeStatsStore';
import { useFinStatsStore } from '../../modules/fin/store/finStatsStore';
import { formatDateISO } from '../utils/dates';

const STORAGE_KEY = '4family_global_stats';

type ModulePoints = {
  chef: number;
  fin: number;
  home: number;
};

type GlobalStats = {
  memberId: string;
  modulePoints: ModulePoints;
  fourFamilyScore: number;
  globalStreak: number;
  lastActivityDate: string; // ISO date para cálculo de streak
  badges: string[];
};

function createEmptyGlobal(memberId: string): GlobalStats {
  return {
    memberId,
    modulePoints: { chef: 0, fin: 0, home: 0 },
    fourFamilyScore: 0,
    globalStreak: 0,
    lastActivityDate: '',
    badges: [],
  };
}

function loadFromStorage(): Record<string, GlobalStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(stats: Record<string, GlobalStats>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

const GLOBAL_BADGES = [
  { id: 'familia_completa', label: 'Família Completa', emoji: 'family', description: 'Todos os 3 módulos ativos na semana' },
  { id: 'mestre_do_lar', label: 'Mestre do Lar', emoji: 'crown', description: 'Top 1 em todos os módulos na mesma semana' },
  { id: 'constante', label: 'Constante', emoji: 'star', description: '30 dias sem falhar em nenhum módulo' },
] as const;

export { GLOBAL_BADGES };

type GlobalStatsState = {
  globalStats: Record<string, GlobalStats>;
  recalculateScore: (memberId: MemberId) => void;
  updateGlobalStreak: (memberId: MemberId) => void;
  getGlobalStats: (memberId: MemberId) => GlobalStats;
  getAllRanked: () => GlobalStats[];
};

export const useGlobalStatsStore = create<GlobalStatsState>((set, get) => ({
  globalStats: loadFromStorage(),

  recalculateScore: (memberId) => {
    const stats = { ...get().globalStats };
    const gs = { ...(stats[memberId] ?? createEmptyGlobal(memberId)) };

    // Buscar pontos de cada módulo
    const chefStats = useStatsStore.getState().getMemberStats(memberId);
    const homePoints = useHomeStatsStore.getState().getMemberPoints(memberId);
    const finPoints = useFinStatsStore.getState().getMemberPoints(memberId);

    gs.modulePoints = {
      chef: chefStats.totalPoints,
      home: homePoints,
      fin: finPoints,
    };

    // 4Family Score = chef*0.4 + home*0.4 + fin*0.2
    gs.fourFamilyScore = Math.round(
      gs.modulePoints.chef * 0.4 +
      gs.modulePoints.home * 0.4 +
      gs.modulePoints.fin * 0.2,
    );

    stats[memberId] = gs;
    set({ globalStats: stats });
    saveToStorage(stats);
  },

  updateGlobalStreak: (memberId) => {
    const stats = { ...get().globalStats };
    const gs = { ...(stats[memberId] ?? createEmptyGlobal(memberId)) };
    const todayISO = formatDateISO(new Date());

    if (gs.lastActivityDate === todayISO) {
      // Já registrou atividade hoje
      return;
    }

    // Verificar se ontem teve atividade
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatDateISO(yesterday);

    if (gs.lastActivityDate === yesterdayISO) {
      gs.globalStreak += 1;
    } else if (gs.lastActivityDate !== todayISO) {
      gs.globalStreak = 1;
    }

    gs.lastActivityDate = todayISO;
    stats[memberId] = gs;
    set({ globalStats: stats });
    saveToStorage(stats);
  },

  getGlobalStats: (memberId) => {
    return get().globalStats[memberId] ?? createEmptyGlobal(memberId);
  },

  getAllRanked: () => {
    const { globalStats } = get();

    // Garantir que todos os membros existem
    const all = FAMILY_MEMBERS.map((m) =>
      globalStats[m.id] ?? createEmptyGlobal(m.id),
    );

    return all.sort((a, b) => b.fourFamilyScore - a.fourFamilyScore);
  },
}));
