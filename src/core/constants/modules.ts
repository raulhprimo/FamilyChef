export const MODULES = [
  {
    id: 'chef',
    name: 'FamilyChef',
    emoji: 'woman-cook',
    color: '#FF6B6B',
    description: 'Cardápio e culinária',
    route: '/chef',
    enabled: true,
  },
  {
    id: 'home',
    name: 'FamilyHome',
    emoji: 'house',
    color: '#F9A825',
    description: 'Tarefas de casa',
    route: '/home-tasks',
    enabled: true,
  },
  {
    id: 'fin',
    name: 'FamilyFin',
    emoji: 'money-bag',
    color: '#4ECDC4',
    description: 'Finanças compartilhadas',
    route: '/fin',
    enabled: true,
  },
] as const;

export type ModuleId = 'chef' | 'fin' | 'home';
