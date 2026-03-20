# Bootstrap Prompts — FamilyHome 🏠

Prompts para implementar o módulo de tarefas domésticas do 4Family.
Execute após concluir a Fase 0 (hub base + migração do FamilyChef).

---

## Contexto para o Claude antes de começar

```
Leia o CLAUDE_4Family.md antes de começar.

Vamos implementar o módulo FamilyHome dentro do 4Family.
O hub e o sistema de auth (PIN + sessão) já estão funcionando.
FamilyHome vive em src/modules/home/

Regras deste módulo:
- Tarefas recorrentes geram instâncias automaticamente (não armazenar instâncias futuras)
- Instâncias são geradas para os próximos 7 dias ao abrir o app
- O módulo NÃO importa nada de src/modules/chef/ ou src/modules/fin/
- Tipos ficam em src/modules/home/types/index.ts
```

---

## Prompt Home-0 — Tipos e Stores Base

```
Leia o CLAUDE_4Family.md antes de começar.

Crie a base do FamilyHome:

1. src/modules/home/types/index.ts
   Copie os tipos RecurringTask, TaskInstance, TaskFrequency, TaskPriority, TaskCategory
   do CLAUDE_4Family.md. Adicione:

   type TaskStats = {
     memberId: MemberId;
     completedOnTime: number;
     completedLate: number;
     completedEarly: number;
     pending: number;
     avgCompletionHours: number; // da criação até conclusão
   };

2. src/modules/home/store/recurringStore.ts (Zustand)
   Estado: tasks: RecurringTask[]
   Ações:
   - addRecurring(data: Omit<RecurringTask, 'id' | 'createdAt'>)
   - updateRecurring(id, data: Partial<RecurringTask>)
   - toggleActive(id)
   - deleteRecurring(id)
   Persistência: "4family_home_recurring"

3. src/modules/home/store/tasksStore.ts (Zustand)
   Estado: instances: TaskInstance[]
   
   Ações:
   - addTask(data: Omit<TaskInstance, 'id'>)           // tarefa avulsa
   - completeTask(id, doneBy: MemberId)                // marcar como feita
   - updateTask(id, data: Partial<TaskInstance>)
   - deleteTask(id)
   
   Função interna: generateInstances(recurring: RecurringTask[], upTo: Date): TaskInstance[]
   → Para cada RecurringTask ativa, gera instâncias nos próximos 7 dias
   → Verifica se a instância já existe (por recurringTaskId + dueDate) antes de criar
   → Não deleta instâncias passadas — apenas gera as futuras faltantes
   
   Ação: syncRecurringInstances(recurringTasks: RecurringTask[])
   → Chama generateInstances e faz upsert no estado
   → Deve ser chamada ao abrir o app e ao criar/editar recorrentes
   
   Seletores:
   - getTasksByMember(memberId, date?: string): TaskInstance[]
   - getTasksByDate(date: string): TaskInstance[]
   - getOverdueTasks(): TaskInstance[]     // dueDate < hoje e não concluídas
   - getTaskStats(memberId, month): TaskStats
   
   Na conclusão (completeTask):
   - Calcular lateByDays = Math.max(0, daysDiff(dueDate, today))
   - Chamar homeStatsStore.addPoints com base no lateByDays
   
   Persistência: "4family_home_tasks"

4. src/modules/home/store/homeStatsStore.ts (Zustand)
   Mesmo padrão do chefStatsStore — pontos + streak por membro.
   Pontos:
   - +15 pts: concluída antecipada (lateByDays < 0, ou seja, antes do prazo)
   - +10 pts: concluída no prazo (lateByDays = 0)
   - +5 pts: concluída com 1 dia de atraso
   - 0 pts: concluída com 2+ dias de atraso
   - -5 pts: calculado semanalmente para tarefas atrasadas não concluídas
   Persistência: "4family_home_stats"
```

---

## Prompt Home-1 — Tela "Minhas Tarefas Hoje"

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/home/pages/HomeToday.tsx

Esta é a tela principal do FamilyHome — o que o membro ativo precisa fazer hoje.

Layout:

1. Saudação contextual no topo
   - "Bom dia, Felipe!" (manhã) / "Boa tarde" / "Boa noite"
   - Subtexto: "X tarefas hoje · Y pendentes de ontem"

2. Tarefas atrasadas (se houver)
   - Seção colapsável com borda vermelha
   - Header: "⚠️ Atrasadas (N)" 
   - Lista compacta com dias de atraso em badge vermelho

3. Tarefas de hoje
   - Agrupadas por categoria (Limpeza, Compras, etc.)
   - Cada tarefa: checkbox grande, nome, badge de prioridade (se urgente)
   - Swipe right para concluir (mobile) / checkbox (desktop)
   - Animação de risco ao concluir, some após 800ms

4. Tarefas de amanhã (preview colapsável)
   - Exibe até 3 tarefas do dia seguinte
   - "Ver mais" → expande ou vai para /home-tasks/all

5. Empty state (sem tarefas)
   - Emoji grande + "Tudo em dia! 🎉"
   - "Veja as tarefas da família" → botão para /home-tasks/all

Use tasksStore: getTasksByMember(memberId, today) e getOverdueTasks() filtrado por membro.
Cor accent do módulo: #F9A825 (--home)
Use react-apple-emojis para ícones de categoria e estados.
```

---

## Prompt Home-2 — Todas as Tarefas (Visão Família)

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/home/pages/HomeAll.tsx

Visão completa de todas as tarefas da família.

Layout:

1. Filtros (barra horizontal com scroll)
   - Por membro: chips com avatar (Todos | Elaine | Felipe | Leticia)
   - Por status: Pendentes | Concluídas | Atrasadas
   - Por categoria: chips de categoria

2. Lista de tarefas
   - Agrupada por data (Hoje | Amanhã | Próxima semana | Depois)
   - Cada item:
     - Avatar do responsável (pequeno, colorido)
     - Nome da tarefa
     - Badge de categoria (colorido)
     - Badge "urgente" se prioridade = urgent
     - Data/prazo à direita
     - Ícone de recorrente se for instância gerada
   - Tarefas concluídas: texto riscado, opacidade reduzida

3. Seção "Concluídas hoje"
   - Colapsável
   - Lista com horário de conclusão e quem concluiu

Botão "+" (FAB) → abre modal de nova tarefa avulsa.

Ao clicar em uma tarefa → modal de detalhes/edição.
```

---

## Prompt Home-3 — Criar/Editar Tarefa Avulsa

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/home/components/TaskForm.tsx

Bottom sheet no mobile, modal no desktop.

Campos (em ordem):

1. Nome da tarefa — input de texto, obrigatório
   Exemplos como placeholder: "Tirar o lixo", "Comprar papel higiênico"

2. Responsável — seleção de membro (chips com avatar e cor)
   Obrigatório, default: membro ativo

3. Prazo — date picker
   Default: hoje. Opções rápidas: "Hoje" | "Amanhã" | "Esta semana"

4. Categoria — chips: Limpeza | Compras | Manutenção | Outros
   Default: Outros

5. Prioridade — toggle: Normal / Urgente
   Default: Normal. Urgente adiciona badge laranja na lista.

6. Comentário — textarea opcional
   Placeholder: "Alguma observação para quem vai fazer?"

Botão "Salvar" → chama addTask + fecha sheet.
Botão "Excluir" (só no modo edição) com confirmação "Excluir esta tarefa?".

Ao criar, mostrar toast: "Tarefa adicionada! [nome da tarefa]"

Não usar <form> — usar onClick nos botões.
```

---

## Prompt Home-4 — Tarefas Recorrentes

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/home/pages/HomeRecurring.tsx e
src/modules/home/components/RecurringTaskForm.tsx

### Página (HomeRecurring.tsx)

Lista de tarefas recorrentes da família.

Duas seções: "Ativas" e "Pausadas" (colapsável)

Card de recorrente:
- Nome + emoji de frequência (📅 diária, 🗓️ semanal...)
- Chip da categoria
- Avatar(es) do(s) responsável(eis)
- Texto de frequência: "Toda segunda e quinta" / "Todo dia" / "Todo dia 15"
- Toggle de ativo/pausado
- Botão de editar (ícone lápis)

FAB "+" → abre RecurringTaskForm para criar nova.

### Formulário (RecurringTaskForm.tsx)

Campos:

1. Nome da tarefa

2. Categoria

3. Responsável(eis) — multi-select de membros
   Ao selecionar múltiplos: rodízio automático entre eles
   (instâncias alternadas entre os membros na geração)

4. Frequência — seletor:
   Diária | Semanal | Quinzenal | Mensal | Uma vez

5. Se Semanal ou Quinzenal: seletor de dias da semana
   Checkboxes: Dom Seg Ter Qua Qui Sex Sáb

6. Se Mensal: campo numérico "Dia do mês" (1–28)

Ao salvar: chama addRecurring + chama syncRecurringInstances
Toast: "Tarefa recorrente criada! As instâncias foram geradas."
```

---

## Prompt Home-5 — Histórico e Relatório

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/home/pages/HomeHistory.tsx

Tela de histórico mensal com quem fez o quê.

Layout:

1. Seletor de mês (← Fevereiro 2026 →)

2. Cards de resumo por membro (grid 3 colunas)
   Para cada membro:
   - Avatar + nome
   - "X feitas" (no prazo + antecipadas)
   - "Y atrasadas"
   - Streak atual

3. Ranking do mês
   - Podium simples (1º, 2º, 3º) com pontos do homeStatsStore
   - Cor do membro no pedestal

4. Lista de tarefas concluídas no mês
   - Agrupada por membro (tabs ou accordion)
   - Cada item: nome, data de conclusão, badge "no prazo" / "atrasada X dias" / "antecipada"

5. "Tarefas negligenciadas"
   - Recorrentes que tiveram atraso em 50%+ das instâncias no mês
   - Card de alerta com sugestão: "Considere redistribuir essa tarefa"

Use tasksStore.getTaskStats(memberId, month) para os dados.
```

---

## Prompt Home-6 — Navegação e Layout do Módulo

```
Leia o CLAUDE_4Family.md antes de começar.

Crie o layout e navegação do FamilyHome.

1. src/modules/home/components/HomeLayout.tsx
   Shell do módulo com:
   - Header: "FamilyHome" (cor #F9A825) + avatar do membro ativo + ícone trocar módulo
   - Bottom navigation com 4 abas:
     - Hoje (/home-tasks) — ícone HugeIcons: checkmark-circle
     - Tudo (/home-tasks/all) — ícone: list
     - Recorrentes (/home-tasks/recurring) — ícone: refresh
     - Histórico (/home-tasks/history) — ícone: clock

2. Configure as rotas no React Router:
   /home-tasks              → HomeToday (dentro do HomeLayout)
   /home-tasks/all          → HomeAll
   /home-tasks/recurring    → HomeRecurring
   /home-tasks/history      → HomeHistory
   Todas protegidas por auth guard.

3. Ao montar HomeLayout (useEffect):
   Chamar tasksStore.syncRecurringInstances(recurringStore.tasks)
   para garantir que instâncias dos próximos 7 dias estão geradas.

4. Badge de notificação no ícone da aba "Hoje":
   Número de tarefas pendentes do membro ativo para hoje.
   Badge vermelho se há tarefas atrasadas.
```

---

## Prompt Home-7 — Micro-interações e Polimento

```
Leia o CLAUDE_4Family.md antes de começar.

Adicione polimento ao FamilyHome:

1. Animação de conclusão de tarefa
   - Ao concluir: checkbox preenche com animação de check (CSS keyframe)
   - Item some com slide-left + fade após 800ms
   - Toast: "Tarefa concluída! +10 pts 🏠" (ou +15 se antecipada)

2. Streak visual
   - Na tela HomeToday: se streak > 0, exibir "🔥 X dias seguidos"
   - Se streak atingiu 7: confetti + badge especial

3. Swipe to complete (mobile)
   - Swipe right no item → revela fundo verde com ícone de check
   - Liberar após 60% → conclui a tarefa
   - Swipe left → revela fundo vermelho com ícone de excluir

4. Feedback de tarefa atrasada
   - Badge vermelho com "X dias" no item
   - Ao concluir tarefa atrasada: toast diferente "Concluída com atraso — tente fazer antes da próxima vez!"
   - Sem punição pública: pontos menores, mas sem exibir "-5 pts" na face do usuário

5. Empty state motivacional
   - Sem tarefas: frase rotativa (3 frases, troca por dia)
   - Exemplos: "A casa agradece! 🏡", "Dia livre de tarefas ✨", "Aproveite o descanso! 😊"
```

---

## Ordem de Execução

```
Home-0 → Tipos + Stores (base de tudo)
Home-1 → Tela de hoje
Home-3 → Formulário de tarefa avulsa
Home-6 → Navegação e layout
     ↓
MVP funcional (criar e concluir tarefas)
     ↓
Home-2 → Visão da família
Home-4 → Tarefas recorrentes
Home-5 → Histórico
Home-7 → Polimento
```

---

## Lógica de Geração de Instâncias Recorrentes

Explique ao Claude ao rodar Home-0:

```typescript
// Para uma tarefa com frequency='weekly', weekDays=[1, 4] (segunda e quinta)
// Rodando em 19/03/2026 (quarta), gerar para os próximos 7 dias (até 26/03):
// → quinta 20/03, segunda 23/03, quinta 27/03 (se <= 26/03)

// Para frequency='daily':
// → uma instância por dia nos próximos 7 dias

// Para responsável com rodízio (assignedTo=['elaine', 'felipe']):
// → instâncias alternadas: elaine na segunda, felipe na quinta, elaine na próxima...

// Chave de deduplicação: `${recurringTaskId}_${dueDate}`
// Antes de criar, verificar se já existe no estado (não criar duplicatas)
// Instâncias passadas não são deletadas — ficam no histórico

// Frequência quinzenal (biweekly):
// Usar a data de criação da recorrente como âncora
// A cada 14 dias a partir da criação, gerar instância
```
