# Bootstrap Prompts — FamilyFin 💰

Prompts para implementar o módulo financeiro do 4Family.
Execute após concluir a Fase 0 (hub base + migração do FamilyChef).

---

## Contexto para o Claude antes de começar

```
Leia o CLAUDE_4Family.md antes de começar.

Vamos implementar o módulo FamilyFin dentro do 4Family.
O hub e o sistema de auth (PIN + sessão) já estão funcionando.
FamilyFin vive em src/modules/fin/

Regras críticas deste módulo:
- TODOS os valores monetários em centavos (integer) — NUNCA float
- Exibição sempre via: (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
- O módulo NÃO importa nada de src/modules/chef/ ou src/modules/home/
- Tipos ficam em src/modules/fin/types/index.ts
```

---

## Prompt Fin-0 — Tipos e Store de Gastos

```
Leia o CLAUDE_4Family.md antes de começar.

Crie a base do FamilyFin:

1. src/modules/fin/types/index.ts
   Copie os tipos Expense, Debt, Goal, Budget, ExpenseCategory
   definidos no CLAUDE_4Family.md. Adicione:

   type MonthSummary = {
     month: string;           // "2026-03"
     totalExpenses: number;   // em centavos
     byCategory: Record<ExpenseCategory, number>;
     byMember: Record<MemberId, number>; // quanto cada um pagou
     debts: Debt[];
   };

2. src/modules/fin/store/expensesStore.ts (Zustand)
   Estado: expenses: Expense[]
   
   Ações:
   - addExpense(data: Omit<Expense, 'id' | 'createdAt'>)
   - updateExpense(id, data: Partial<Expense>)
   - deleteExpense(id)
   
   Seletores:
   - getExpensesByMonth(month: string): Expense[]
   - calculateDebts(month: string): Debt[]
     → Algoritmo de simplificação de dívidas:
       1. Calcular saldo líquido de cada membro (pagou - deve)
       2. Separar credores (saldo positivo) e devedores (saldo negativo)
       3. Emparelar devedores com credores até zerar
       4. Retornar lista mínima de transferências
   - getMonthSummary(month: string): MonthSummary
   
   Persistência: localStorage "4family_fin_expenses"
   
3. src/modules/fin/store/finStatsStore.ts (Zustand)
   Estado: stats: Record<MemberId, { totalPoints: number; weeklyPoints: Record<string, number> }>
   Ações:
   - addPoints(memberId, points, reason)
   - getWeekPoints(memberId, weekId): number
   Persistência: "4family_fin_stats"
```

---

## Prompt Fin-1 — Tela Principal (FamilyFin Home)

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/fin/pages/FinHome.tsx

Esta é a tela inicial do FamilyFin — visão geral do mês atual.

Seções (de cima para baixo):

1. Header do mês
   - "Março 2026" com setas para navegar entre meses
   - Total gasto no mês (formatado em R$)
   - Subtexto: "X gastos registrados"

2. Card "Acerto de contas"
   - Se sem dívidas: mensagem verde "Tudo certo! Nenhuma dívida pendente"
   - Se com dívidas: lista compacta de "Felipe → Elaine: R$45,00"
   - Botão "Ver detalhes" → navega para /fin/debts

3. Card "Metas do mês"
   - Preview das metas ativas (máx 2 no card)
   - Barra de progresso por meta
   - Botão "Ver todas" → /fin/goals

4. Resumo por categoria
   - Gráfico de barras horizontal simples (sem lib — barras em divs com width%)
   - Ordenado por maior gasto
   - Cada barra tem: ícone emoji da categoria, nome, valor, % do total

5. FAB "+" para adicionar gasto rápido

Use expensesStore para todos os dados.
Cor accent do módulo: #4ECDC4 (--fin)
Use react-apple-emojis para ícones de categoria.
```

---

## Prompt Fin-2 — Adicionar / Editar Gasto

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/fin/components/ExpenseForm.tsx

Bottom sheet no mobile, modal no desktop.

Campos (em ordem):
1. Valor — teclado numérico customizado (0-9 + vírgula + backspace)
   Display grande no topo: "R$ 0,00" atualizado em tempo real
   Valor internamente em centavos.

2. Descrição — input de texto, placeholder: "Ex: Mercado, Netflix, Conta de luz"

3. Categoria — chips horizontais com scroll:
   Mercado 🛒 | Conta 📄 | Transporte 🚗 | Lazer 🎉 | Outros

4. Quem pagou — multi-select dos membros (chips com avatar)
   Default: membro ativo selecionado
   Se mais de um selecionado: divisão igual entre os pagadores

5. Data — seletor de data, default: hoje

6. Divisão (colapsável, "Avançado"):
   Toggle "Dividir igualmente" (default ON)
   Se OFF: campos de valor por membro com validação (soma deve = total)

Botão "Salvar" chama addExpense e fecha o sheet.
Botão "Excluir" (só no modo edição) com confirmação.

Ao salvar, chamar finStatsStore.addPoints(memberId, 5, 'registrou_gasto')
se o gasto foi registrado no dia de hoje.

Não usar <form> — usar onClick nos botões.
```

---

## Prompt Fin-3 — Acerto de Contas

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/fin/pages/FinDebts.tsx

Tela de acerto de contas entre os membros.

Layout:

1. Resumo visual no topo
   - Para cada membro: card com avatar, nome, e saldo do mês
   - Saldo positivo (verde): "tem a receber R$X"
   - Saldo negativo (vermelho): "deve R$X"
   - Saldo zero: "quitado"

2. Lista de transferências necessárias
   - Gerada por calculateDebts() do expensesStore
   - Cada item: "Felipe paga R$45,00 para Elaine"
   - Avatar do pagador → seta → avatar do recebedor
   - Botão "Liquidar" por transferência

3. Modal de liquidação (ao clicar "Liquidar"):
   - Confirma o valor
   - Campo opcional: "Como foi pago?" (PIX, dinheiro, etc.)
   - Botão "Confirmar pagamento"
   - Ao confirmar: registra um Expense com valor negativo zerador,
     dá +10 pts ao pagador via finStatsStore

4. Histórico de liquidações
   - Lista colapsável dos pagamentos já feitos no mês
   - Data, quem pagou quem, valor

Filtro de mês no header (mesmo padrão do FinHome).
```

---

## Prompt Fin-4 — Metas de Economia

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/fin/store/goalsStore.ts e src/modules/fin/pages/FinGoals.tsx

### Store (goalsStore.ts)
Zustand com estado: goals: Goal[]
Ações: addGoal, updateGoal, deleteGoal, addContribution(goalId, memberId, amount)
Seletor: getGoalProgress(goalId): { percent: number; remaining: number; daysLeft: number }
Persistência: "4family_fin_goals"

### Página (FinGoals.tsx)

Lista de metas ativas e concluídas.

Card de meta:
- Nome da meta + cor customizada como accent da barra
- Progresso: "R$X de R$Y" + porcentagem
- Barra de progresso animada (CSS transition na width)
- Prazo: "Faltam X dias" (urgente se < 7 dias)
- Mini avatares das contribuições: quem contribuiu e quanto

Botão "+" → modal de criar meta:
- Nome, valor alvo, prazo (date picker), cor (paleta de 6 cores)

Botão "Contribuir" no card → modal:
- Quem está contribuindo (membro ativo pré-selecionado)
- Valor da contribuição (teclado numérico)
- Ao confirmar: +20 pts via finStatsStore

Quando meta atingida (currentAmount >= targetAmount):
- Card fica com fundo verde + badge "Conquistada!"
- Confetti ao atingir pela primeira vez (canvas-confetti)
- Mover para seção "Metas concluídas" (colapsável)
```

---

## Prompt Fin-5 — Orçamento Mensal

```
Leia o CLAUDE_4Family.md antes de começar.

Crie src/modules/fin/store/budgetStore.ts e src/modules/fin/pages/FinBudget.tsx

### Store (budgetStore.ts)
Estado: budgets: Budget[]
Ações: setBudget(category, monthlyLimit, month), removeBudget(category, month)
Seletor: getBudgetStatus(month): { category, limit, spent, percent, status: 'ok'|'warning'|'over' }[]
  - 'ok': < 80%
  - 'warning': 80-99%
  - 'over': >= 100%
Persistência: "4family_fin_budget"

### Página (FinBudget.tsx)

Mês atual com navegação.

Por categoria com orçamento definido:
- Ícone + nome da categoria
- Barra dupla: gasto (preenchida) sobre limite (fundo)
- Valor: "R$X de R$Y"
- Status colorido: verde / amarelo / vermelho

Categorias sem orçamento: listadas em cinza com botão "Definir limite"

Modal de definir orçamento:
- Categoria (pré-selecionada se clicou no botão)
- Valor limite mensal (teclado numérico)
- Checkbox "Repetir nos próximos meses"

Alerta visual (banner amarelo) se qualquer categoria em 'warning'.
Alerta vermelho se qualquer categoria em 'over'.

Dica: "Com base nos últimos 3 meses, você gastou em média R$X em Mercado"
(calculado a partir do expensesStore sem chamar IA).
```

---

## Prompt Fin-6 — Navegação e Layout do Módulo

```
Leia o CLAUDE_4Family.md antes de começar.

Crie o layout e navegação do FamilyFin.

1. src/modules/fin/components/FinLayout.tsx
   Shell do módulo com:
   - Header: "FamilyFin" (cor #4ECDC4) + avatar do membro ativo + ícone de trocar módulo
   - Bottom navigation com 4 abas:
     - Início (/fin) — ícone HugeIcons: home
     - Gastos (/fin/expenses) — ícone: wallet
     - Metas (/fin/goals) — ícone: target
     - Orçamento (/fin/budget) — ícone: chart

2. src/modules/fin/pages/FinExpenses.tsx
   Lista completa de gastos do mês com:
   - Filtro por categoria (chips)
   - Agrupado por data (hoje, ontem, + antigas)
   - Cada item: categoria emoji, descrição, valor, quem pagou
   - Swipe para excluir no mobile (ou botão de menu no desktop)
   - FAB "+" para adicionar

3. Configure as rotas no React Router:
   /fin → FinHome (dentro do FinLayout)
   /fin/expenses → FinExpenses
   /fin/goals → FinGoals
   /fin/budget → FinBudget
   /fin/debts → FinDebts
   Todas protegidas por auth guard (sessão ativa).
```

---

## Ordem de Execução

```
Fin-0 → Tipos + Store de gastos (base de tudo)
Fin-1 → Tela principal
Fin-2 → Formulário de gasto
Fin-6 → Navegação e layout
     ↓
MVP funcional (registrar gastos e ver resumo)
     ↓
Fin-3 → Acerto de contas
Fin-4 → Metas
Fin-5 → Orçamento
```

---

## Algoritmo de Simplificação de Dívidas

O algoritmo chave do FamilyFin — explique ao Claude ao rodar Fin-0:

```
Dado: lista de gastos com splitBetween e paidBy

1. Para cada membro, calcular saldo:
   saldo[membro] = (total que pagou) - (total que deve)

2. Separar em dois grupos:
   credores = membros com saldo > 0 (têm a receber)
   devedores = membros com saldo < 0 (devem)

3. Enquanto houver devedores e credores:
   - Pegar o maior devedor (D) e o maior credor (C)
   - transferência = min(|saldo[D]|, saldo[C])
   - Registrar: "D paga transferência para C"
   - Atualizar saldos: saldo[D] += transferência, saldo[C] -= transferência
   - Se saldo[D] = 0, remover de devedores
   - Se saldo[C] = 0, remover de credores

Resultado: lista mínima de transferências para zerar todas as dívidas.
Exemplo com 3 pessoas:
  A pagou R$90 (deve 30), B pagou R$0 (deve 30), C pagou R$30 (deve 30)
  → B paga R$30 para A (2 transferências eliminadas em 1!)
```
