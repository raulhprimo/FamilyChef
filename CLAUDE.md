# CLAUDE.md — FamilyChef

Este arquivo define como Claude deve se comportar ao trabalhar neste projeto. Leia antes de qualquer tarefa de desenvolvimento.

---

## Identidade do Projeto

**FamilyChef** é um web app doméstico para a família (Elaine, Felipe e Leticia) organizar o cardápio semanal e gamificar o preparo das refeições. A mãe é a usuária principal.

---

## Stack

```
Frontend:    React 18 + Vite
Estilo:      Tailwind CSS (utility-first)
Emojis:      react-apple-emojis  → import { Emoji } from 'react-apple-emojis'
Ícones:      HugeIcons via MCP   → nunca SVGs inline manuais para ícones
Estado:      Zustand (store global) ou Context API se simples
Persistência MVP: localStorage
Persistência v2:  Supabase
Roteamento:  React Router v6
```

---

## Estrutura de Pastas

```
src/
  components/       # Componentes reutilizáveis (Button, Avatar, Badge...)
  pages/            # Telas principais (Home, Week, Profile, Ranking)
  store/            # Zustand stores
  hooks/            # Custom hooks
  utils/            # Helpers (dates, points, etc.)
  constants/        # Membros, cores, configurações
  assets/           # Fontes, imagens estáticas
```

---

## Membros da Família

```typescript
export const FAMILY_MEMBERS = [
  { id: 'elaine',  name: 'Elaine',  emoji: 'woman',   color: '#FF6B9D' },
  { id: 'felipe',  name: 'Felipe',  emoji: 'man',     color: '#4ECDC4' },
  { id: 'leticia', name: 'Leticia', emoji: 'girl',    color: '#FFE66D' },
] as const;
```

---

## Tipos de Dados

```typescript
type MealType = 'lunch' | 'dinner';

type Meal = {
  id: string;
  weekId: string;         // ex: "2026-W12"
  date: string;           // ISO: "2026-03-18"
  type: MealType;
  dish: string;           // nome do prato
  responsibleId: string;  // 'elaine' | 'felipe' | 'leticia'
  done: boolean;
  doneAt?: string;        // ISO timestamp
};

type WeekPlan = {
  weekId: string;
  meals: Meal[];
};

type MemberStats = {
  memberId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  weeklyPoints: Record<string, number>; // weekId → pontos
};
```

---

## Sistema de Pontos

```
Refeição marcada como feita:    +10 pontos
Planejou um prato:              +2 pontos
Streak de 3 dias:               +15 bônus
Streak de 7 dias:               +50 bônus
Badge "Chef da Semana":         +30 pontos
```

---

## Convenções de Código

- **Componentes:** PascalCase, arquivo `.tsx`
- **Hooks:** prefixo `use`, ex: `useWeekPlan`, `useMemberStats`
- **Stores:** prefixo `use` + Store, ex: `useMealsStore`
- **Utilitários:** camelCase, ex: `getWeekId()`, `calculatePoints()`
- **Constantes:** SCREAMING_SNAKE_CASE

### Não fazer:
- ❌ SVGs inline para ícones (usar HugeIcons)
- ❌ `any` no TypeScript
- ❌ Estilização inline (`style={{}}`) salvo casos extremos
- ❌ Classes Tailwind com mais de 12 utilitários inline — extrair componente

---

## Design System

### Paleta
```css
--bg-primary:    #FAFAF8;    /* Off-white quente */
--bg-card:       #FFFFFF;
--text-primary:  #1A1A1A;
--text-muted:    #6B7280;
--border:        #E5E7EB;
--accent:        #FF6B6B;    /* Vermelho coral — cor principal */

/* Membros */
--elaine:  #FF6B9D;
--felipe:  #4ECDC4;
--leticia: #FFE66D;
```

### Tipografia
- **Display:** `Nunito` (rounded, friendly)
- **Body:** `Inter` ou `DM Sans`
- Títulos: `font-bold text-2xl`
- Labels: `text-sm text-muted`

### Componentes Base
- Cards: `rounded-2xl shadow-sm border border-gray-100 p-4`
- Botões primários: `bg-accent text-white rounded-xl px-4 py-2 font-semibold`
- Avatares: círculo colorido com inicial + emoji do membro

---

## Comportamento Esperado de Claude

### Ao criar componentes:
1. Sempre tipar com TypeScript
2. Usar `react-apple-emojis` para emojis decorativos
3. Usar HugeIcons para ícones de UI (via MCP)
4. Mobile-first no Tailwind
5. Componentizar o que se repete 2x+

### Ao implementar features:
1. Ler o PRD antes de começar
2. Confirmar o tipo de dado necessário antes de criar estado
3. Preferir Zustand para estado global
4. Salvar no localStorage imediatamente após qualquer mutação

### Ao revisar código:
1. Verificar se pontos são calculados corretamente
2. Garantir que `weekId` está no formato `YYYY-WNN` (ISO 8601)
3. Checar acessibilidade mínima (aria-labels em ícones)

---

## Comandos Úteis

```bash
npm run dev         # Inicia dev server
npm run build       # Build de produção
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
```

---

## Notas Importantes

- O app é **uso doméstico**: não precisa de auth complexa. Seleção de perfil na primeira tela é suficiente para MVP.
- **Nunca deletar** dados de refeições passadas — são usados para histórico e badges.
- A semana começa na **segunda-feira** (padrão BR).
- Datas em UTC internamente, exibição em horário de Brasília.
