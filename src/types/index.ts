export type MealType = 'lunch' | 'dinner';

export type Meal = {
  id: string;
  weekId: string;         // ex: "2026-W12"
  date: string;           // ISO: "2026-03-18"
  type: MealType;
  dish: string;           // nome do prato
  responsibleId: string;  // 'elaine' | 'felipe' | 'leticia'
  done: boolean;
  doneAt?: string;        // ISO timestamp
};

export type WeekPlan = {
  weekId: string;
  meals: Meal[];
};

export type MemberStats = {
  memberId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  weeklyPoints: Record<string, number>; // weekId → pontos
};
