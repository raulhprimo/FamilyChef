# CLAUDE.md — 4Family

Este arquivo define como Claude deve se comportar ao trabalhar neste projeto.
Leia antes de qualquer tarefa de desenvolvimento. Substitui o CLAUDE.md do FamilyChef.

---
# IMPORTANTE: E DE EXTREMA IMPORTÂNCIA QUE A PARTIR DAQUI VOCÊ MODULARIZE, então não coloque tudo em um .tsx, coloque o Family HOME E demais em um .tsx a parte

## Identidade do Projeto

**4Family** é um hub doméstico com três módulos:
- **FamilyChef** — cardápio semanal + IA culinária (existente, migrado)
- **FamilyFin** — finanças compartilhadas (novo)
- **FamilyHome** — tarefas de casa (novo)

Família: Elaine, Felipe, Leticia.

---

## Stack

```
Frontend:    React 18 + Vite + TypeScript
Estilo:      Tailwind CSS (utility-first)
Emojis:      react-apple-emojis  → import { Emoji } from 'react-apple-emojis'
Ícones:      HugeIcons via MCP   → nunca SVGs inline manuais para ícones
Estado:      Zustand (um store por módulo + store global)
Roteamento:  React Router v6
Persistência MVP:  localStorage
Persistência v2:   Supabase (PostgreSQL + Realtime)
IA:          Anthropic Claude API (via Edge Function em produção)
```

---

## Estrutura de Pastas

```
src/
  core/                   # Compartilhado entre todos os módulos
    components/           # Button, Avatar, Badge, PIN, Toast, Modal...
    store/                # authStore, statsStore (pontuação global)
    hooks/                # useFamily, useActiveModule, usePIN
    constants/            # members, colors, modules
    types/                # tipos globais (Member, Badge, etc.)
    utils/                # dates, points, formatting

  modules/
    chef/                 # FamilyChef (migrado do FamilyChef)
      components/
      pages/
      store/
      types/
    fin/                  # FamilyFin (novo)
      components/
      pages/
      store/
      types/
    home/                 # FamilyHome (novo)
      components/
      pages/
      store/
      types/

  hub/                    # Tela hub + roteamento entre módulos
    Hub.tsx
    ModuleCard.tsx

  auth/                   # Seleção de membro + PIN
    ProfileSelect.tsx
    PINEntry.tsx
```

---

## Membros da Família

```typescript
// src/core/constants/members.ts
export const FAMILY_MEMBERS = [
  { id: 'elaine',  name: 'Elaine',  emoji: 'woman',  color: '#FF6B9D', pin: null },
  { id: 'felipe',  name: 'Felipe',  emoji: 'man',    color: '#4ECDC4', pin: null },
  { id: 'leticia', name: 'Leticia', emoji: 'girl',   color: '#FFE66D', pin: null },
] as const;

export type MemberId = 'elaine' | 'felipe' | 'leticia';
```

PINs são armazenados hasheados no localStorage. Nunca em plain text.

---

## Módulos

```typescript
// src/core/constants/modules.ts
export const MODULES = [
  {
    id: 'chef',
    name: 'FamilyChef',
    emoji: 'fork-and-knife',
    color: '#FF6B6B',
    description: 'Cardápio e culinária',
    route: '/chef',
  },
  {
    id: 'fin',
    name: 'FamilyFin',
    emoji: 'money-bag',
    color: '#4ECDC4',
    description: 'Finanças compartilhadas',
    route: '/fin',
  },
  {
    id: 'home',
    name: 'FamilyHome',
    emoji: 'house',
    color: '#FFE66D',
    description: 'Tarefas de casa',
    route: '/home-tasks',
  },
] as const;

export type ModuleId = 'chef' | 'fin' | 'home';
```

---

## Tipos Globais

```typescript
// src/core/types/index.ts

export type MemberId = 'elaine' | 'felipe' | 'leticia';
export type ModuleId = 'chef' | 'fin' | 'home';

export type Member = {
  id: MemberId;
  name: string;
  emoji: string;
  color: string;
  pin: string | null; // hash SHA-256 do PIN, ou null se sem PIN
};

// --- Auth ---
export type AuthSession = {
  memberId: MemberId;
  authenticatedAt: string; // ISO timestamp
  expiresAt: string;       // authenticatedAt + 8h
};

// --- Gamificação global ---
export type ModulePoints = {
  chef: number;
  fin: number;
  home: number;
};

export type GlobalStats = {
  memberId: MemberId;
  modulePoints: ModulePoints;
  fourFamilyScore: number; // calculado: chef*0.4 + home*0.4 + fin*0.2
  globalStreak: number;    // dias consecutivos com atividade em qualquer módulo
  badges: string[];        // IDs de badges cross-módulo
};

// --- FamilyFin ---
export type ExpenseCategory = 'mercado' | 'conta' | 'transporte' | 'lazer' | 'outros';

export type Expense = {
  id: string;
  description: string;
  amount: number;           // em centavos (evitar float)
  category: ExpenseCategory;
  paidBy: MemberId[];       // quem pagou (pode ser mais de um)
  splitBetween: MemberId[]; // quem divide (default: todos)
  customSplit?: Record<MemberId, number>; // valores em centavos por membro
  date: string;             // ISO date
  createdAt: string;
};

export type Debt = {
  from: MemberId;
  to: MemberId;
  amount: number; // em centavos
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;   // em centavos
  currentAmount: number;  // em centavos
  deadline: string;       // ISO date
  color: string;
  contributions: { memberId: MemberId; amount: number; date: string }[];
};

export type Budget = {
  category: ExpenseCategory;
  monthlyLimit: number; // em centavos
  month: string;        // "2026-03"
};

// --- FamilyHome ---
export type TaskFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'once';
export type TaskPriority = 'normal' | 'urgent';
export type TaskCategory = 'limpeza' | 'compras' | 'manutencao' | 'outros';

export type RecurringTask = {
  id: string;
  name: string;
  category: TaskCategory;
  assignedTo: MemberId[];
  frequency: TaskFrequency;
  weekDays?: number[];    // 0=dom, 1=seg... para weekly
  dayOfMonth?: number;    // para monthly
  active: boolean;
  createdAt: string;
};

export type TaskInstance = {
  id: string;
  recurringTaskId?: string; // se gerada de recorrente
  name: string;
  category: TaskCategory;
  assignedTo: MemberId;
  dueDate: string;        // ISO date
  priority: TaskPriority;
  done: boolean;
  doneAt?: string;
  doneBy?: MemberId;
  lateByDays?: number;    // calculado na conclusão
  comment?: string;
};
```

---

## Stores por Módulo

```
src/core/store/
  authStore.ts       → sessão ativa, PIN, trocar membro
  globalStatsStore.ts → 4Family Score, badges globais

src/modules/chef/store/
  mealsStore.ts      → refeições (existente, migrado)
  chefStatsStore.ts  → pontos e streaks do chef

src/modules/fin/store/
  expensesStore.ts   → gastos
  goalsStore.ts      → metas
  budgetStore.ts     → orçamentos
  finStatsStore.ts   → pontos do fin

src/modules/home/store/
  tasksStore.ts      → instâncias de tarefas
  recurringStore.ts  → tarefas recorrentes
  homeStatsStore.ts  → pontos do home
```

Cada store persiste no localStorage com prefixo do módulo:
- `4family_auth`, `4family_global_stats`
- `4family_chef_meals`, `4family_chef_stats`
- `4family_fin_expenses`, `4family_fin_goals`, `4family_fin_budget`, `4family_fin_stats`
- `4family_home_tasks`, `4family_home_recurring`, `4family_home_stats`

---

## Sistema de PIN

```typescript
// Nunca armazenar PIN em plain text
// Usar SubtleCrypto (disponível no browser sem libs externas)

async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'familysalt2026'); // salt fixo para MVP
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPIN(inputPin: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPIN(inputPin);
  return inputHash === storedHash;
}
```

Sessão armazenada em `sessionStorage` (apagada ao fechar o browser).
localStorage guarda apenas o hash do PIN, nunca o valor.

---

## Roteamento

```
/                       → ProfileSelect (seleção de membro)
/pin                    → PINEntry (se membro tem PIN)
/hub                    → Hub 4Family (cards dos módulos)

/chef                   → FamilyChef Home (grade da semana)
/chef/ranking           → Ranking do Chef
/chef/profile           → Perfil do membro no Chef

/fin                    → FamilyFin Home (visão geral do mês)
/fin/expenses           → Lista de gastos
/fin/goals              → Metas
/fin/budget             → Orçamentos
/fin/debts              → Acerto de contas

/home-tasks             → FamilyHome Home (minhas tarefas hoje)
/home-tasks/all         → Todas as tarefas
/home-tasks/recurring   → Gerenciar recorrentes
/home-tasks/history     → Histórico
```

Guards:
- `/hub`, `/chef/*`, `/fin/*`, `/home-tasks/*` → requer sessão ativa (authStore)
- Se sessão expirada (> 8h) → redireciona para `/`

---

## Design System 4Family

### Paleta Global
```css
--bg-primary:    #FAFAF8;
--bg-card:       #FFFFFF;
--text-primary:  #1A1A1A;
--text-muted:    #6B7280;
--border:        #E5E7EB;

/* Módulos */
--chef:    #FF6B6B;   /* coral */
--fin:     #4ECDC4;   /* teal */
--home:    #F9A825;   /* amber */

/* Membros */
--elaine:  #FF6B9D;
--felipe:  #4ECDC4;
--leticia: #FFE66D;
```

Cada módulo usa sua cor como accent no header, botões primários e indicadores.
Fora do módulo (hub, auth): cor neutra `#1A1A1A`.

### Tipografia
- **Display:** `Nunito` (rounded, friendly) — títulos e branding
- **Body:** `DM Sans` — conteúdo e UI
- Mantém o padrão já estabelecido no FamilyChef

### Layout de Módulo
Todo módulo segue o mesmo layout shell:
- Header fixo: nome do módulo (cor do módulo) + avatar do membro ativo + ícone de "trocar módulo"
- Conteúdo principal (scroll)
- Bottom navigation com 4 abas (ícones HugeIcons + label)

---

## Convenções de Código

- **Módulos são ilhas** — `src/modules/chef/` não importa de `src/modules/fin/`
- Compartilhado vive em `src/core/` — acessível por todos
- Nomes de arquivo: PascalCase para componentes, camelCase para utils/hooks/stores
- Tipos de módulo: arquivo próprio em `src/modules/{mod}/types/index.ts`
- Valores monetários: **sempre em centavos (integer)**. Formatar apenas na exibição.
  ```typescript
  // ❌ NUNCA
  const amount = 49.90;
  // ✅ SEMPRE
  const amountCents = 4990;
  const display = (4990 / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  ```

### Não fazer:
- ❌ SVGs inline para ícones (usar HugeIcons via MCP)
- ❌ `any` no TypeScript
- ❌ Importar de outro módulo diretamente
- ❌ Valores monetários como float
- ❌ PIN em plain text em nenhum storage
- ❌ `console.log` em produção (usar flags de env)

---

## Comandos

```bash
npm run dev           # Dev server
npm run build         # Build produção
npm run lint          # ESLint
npm run type-check    # tsc --noEmit
npm run migrate:chef  # Script de migração do localStorage FamilyChef → 4Family
```

---

## Migração do FamilyChef

O FamilyChef existente tem dados no localStorage sob chaves `familychef_*`.
A migração deve:
1. Ler as chaves antigas
2. Transformar para os novos tipos do 4Family
3. Salvar sob `4family_chef_*`
4. Manter as chaves antigas por 30 dias (compatibilidade)
5. Exibir toast "Seus dados do FamilyChef foram migrados com sucesso!"

Script: `src/core/utils/migration.ts` — chamado uma vez ao carregar o app se detectar chaves antigas.
