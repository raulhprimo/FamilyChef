export const FAMILY_MEMBERS = [
  { id: 'elaine',  name: 'Elaine',  emoji: 'woman', color: '#FF6B9D' },
  { id: 'felipe',  name: 'Felipe',  emoji: 'man',   color: '#4ECDC4' },
  { id: 'leticia', name: 'Leticia', emoji: 'girl',  color: '#FFE66D' },
  { id: 'raul',    name: 'Raul',    emoji: 'man',   color: '#7C83FD' },
] as const;

export type MemberId = typeof FAMILY_MEMBERS[number]['id'];
