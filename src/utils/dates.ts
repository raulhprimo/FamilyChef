/**
 * Retorna o weekId no formato ISO 8601 "YYYY-WNN".
 * A semana começa na segunda-feira (padrão BR / ISO).
 */
export function getWeekId(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // ISO: semana começa segunda (1). Ajustar domingo (0) para 7.
  const dayOfWeek = target.getUTCDay() || 7;

  // Quinta-feira da mesma semana ISO determina o ano/semana
  target.setUTCDate(target.getUTCDate() + 4 - dayOfWeek);

  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );

  const year = target.getUTCFullYear();
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Retorna a segunda-feira da semana que contém `date`.
 */
export function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay() || 7; // domingo = 7
  d.setDate(d.getDate() - day + 1);
  return d;
}

/**
 * Retorna as 7 datas (seg→dom) da semana que contém `date`.
 */
export function getWeekDays(date: Date): Date[] {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/**
 * Formata uma Date como "YYYY-MM-DD".
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const WEEK_DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/**
 * Ex: "Seg 18/03"
 */
export function formatDayHeader(date: Date): string {
  const dayIndex = (date.getDay() + 6) % 7; // seg=0 … dom=6
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${WEEK_DAY_SHORT[dayIndex]} ${dd}/${mm}`;
}

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

/**
 * Retorna label para a barra de navegação: "Semana 12 (Mar)"
 */
export function getWeekLabel(weekId: string, referenceDate: Date): string {
  const weekNum = parseInt(weekId.split('-W')[1], 10);
  const monthName = MONTH_NAMES[referenceDate.getMonth()];
  return `Semana ${weekNum} (${monthName})`;
}
