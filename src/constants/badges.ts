export const ALL_BADGES = [
  { id: 'chef_da_semana',   label: 'Chef da Semana',    emoji: 'trophy' },
  { id: 'streak_3',         label: '3 Dias Seguidos',   emoji: 'fire' },
  { id: 'streak_7',         label: 'Semana Completa',   emoji: 'star' },
  { id: 'primeiro_prato',   label: 'Primeiro Prato',    emoji: 'fork-and-knife' },
  { id: 'mes_completo',     label: 'Mês Completo',      emoji: 'calendar' },
] as const;

export type BadgeId = typeof ALL_BADGES[number]['id'];
