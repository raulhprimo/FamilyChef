import type { ModuleId } from '../../constants/modules';

export type AgentId = 'chef' | 'home' | 'fin';

export type Agent = {
  id: AgentId;
  moduleId: ModuleId;
  name: string;
  emoji: string;
  color: string;
  greeting: string;
  description: string;
};

export const AGENTS: Agent[] = [
  {
    id: 'chef',
    moduleId: 'chef',
    name: 'Dona Sabor',
    emoji: 'woman-cook',
    color: '#FF6B6B',
    greeting: 'Oi! Sou a Dona Sabor, sua parceira na cozinha!',
    description: 'Chef de cozinha da família',
  },
  {
    id: 'home',
    moduleId: 'home',
    name: 'Seu Capricho',
    emoji: 'broom',
    color: '#F9A825',
    greeting: 'Fala! Sou o Seu Capricho, bora organizar essa casa!',
    description: 'Organizador profissional',
  },
  {
    id: 'fin',
    moduleId: 'fin',
    name: 'Tio Cofrinho',
    emoji: 'money-bag',
    color: '#4ECDC4',
    greeting: 'E aí! Sou o Tio Cofrinho, vamos cuidar da grana!',
    description: 'Mentor financeiro da família',
  },
];

export function getAgentById(id: AgentId): Agent {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0];
}

export function getAgentByPath(pathname: string): AgentId {
  if (pathname.startsWith('/chef')) return 'chef';
  if (pathname.startsWith('/home-tasks')) return 'home';
  if (pathname.startsWith('/fin')) return 'fin';
  return 'chef'; // default
}
