import { POINTS } from '../constants/points';
import type { Meal } from '../types';

/**
 * Pontos ganhos por uma refeição concluída.
 * Retorna MEAL_DONE (10) se done, 0 caso contrário.
 */
export function calculateMealPoints(meal: Meal): number {
  return meal.done ? POINTS.MEAL_DONE : 0;
}

/**
 * Bônus acumulado por streak de dias corridos.
 * Streak 3 → +15, Streak 7 → +50 (cumulativo: 3+7 = +65 total de bônus).
 */
export function calculateStreakBonus(streak: number): number {
  let bonus = 0;
  if (streak >= 3) bonus += POINTS.STREAK_3_DAYS;
  if (streak >= 7) bonus += POINTS.STREAK_7_DAYS;
  return bonus;
}

/**
 * Mensagem motivacional baseada no streak atual.
 */
export function getStreakMessage(streak: number): string {
  if (streak >= 7) return 'Uma semana inteira! Você é imparável!';
  if (streak >= 5) return 'Quase uma semana! Continue assim!';
  if (streak >= 3) return 'Três dias seguidos! Mandou bem!';
  if (streak >= 2) return 'Dois dias seguidos, bora manter!';
  if (streak === 1) return 'Primeiro dia do streak!';
  return 'Cozinhe hoje para iniciar um streak!';
}
