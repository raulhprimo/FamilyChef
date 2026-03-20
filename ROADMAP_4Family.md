# Roadmap — 4Family 🗓️

**Última atualização:** Março 2026  
**Estratégia:** Hub primeiro, módulos em paralelo depois. Cada fase é usável de forma independente.

---

## Visão Geral

```
Fase 0  → Migração FamilyChef + Hub base          [Semana 1]
Fase 1  → FamilyHome MVP                           [Semanas 2–3]
Fase 2  → FamilyFin MVP                            [Semanas 4–5]
Fase 3  → Gamificação unificada (4Family Score)    [Semana 6]
Fase 4  → IA nos 3 módulos                        [Semanas 7–9]
Fase 5  → Backend real (Supabase)                  [Semanas 10–13]
Fase 6  → PWA + Polimento                         [Semana 14]
```

---

## Fase 0 — Migração + Hub Base
**Objetivo:** FamilyChef vira módulo do 4Family. Hub funcional com PIN.

### Entregas

- [ ] **Refatoração de estrutura**
  - Mover `src/` atual do FamilyChef para `src/modules/chef/`
  - Criar `src/core/` com constantes e tipos compartilhados
  - Atualizar imports

- [ ] **Script de migração de dados**
  - Ler chaves `familychef_*` do localStorage
  - Reescrever como `4family_chef_*`
  - Toast de confirmação na primeira abertura

- [ ] **Sistema de PIN**
  - Hash SHA-256 via SubtleCrypto (sem libs extras)
  - Tela de entrada de PIN (teclado numérico customizado)
  - Membro sem PIN: acesso direto
  - Configuração de PIN no perfil

- [ ] **Auth Store**
  - Sessão em sessionStorage (8h)
  - Guard nas rotas protegidas
  - Troca de membro sem logout total

- [ ] **Hub 4Family**
  - 3 cards de módulos com preview de status
  - Ícone de troca de módulo no header de cada módulo
  - Animação de entrada no hub

- [ ] **Branding 4Family**
  - Trocar nome e logo para 4Family
  - Tela de splash/loading com a identidade nova
  - Favicon atualizado

**Critério de aceite:** FamilyChef funciona igual ao antes, agora acessado via hub. PIN funcionando para pelo menos 1 membro.

---

## Fase 1 — FamilyHome MVP
**Objetivo:** Família consegue criar, atribuir e concluir tarefas de casa.

### Entregas

- [ ] **Tarefas Avulsas**
  - Criar tarefa: nome, responsável, prazo, prioridade, categoria
  - Concluir tarefa + registrar pontos
  - Editar e excluir
  - Visual de "atrasada" (borda vermelha, ícone)

- [ ] **Tarefas Recorrentes**
  - Criar recorrente: nome, frequência, dia(s), responsável(eis)
  - Geração automática de instâncias ao abrir o app
  - Instâncias geradas para 7 dias à frente
  - Pausar/retomar tarefa recorrente

- [ ] **Visão "Minhas tarefas hoje"**
  - Lista filtrada pelo membro ativo
  - Agrupar por categoria
  - Badge de urgente em destaque

- [ ] **Visão "Todas as tarefas"**
  - Listagem completa da família
  - Filtros: status, membro, categoria
  - Agrupamento por data

- [ ] **HomeStore (Zustand)**
  - Persistência no localStorage (`4family_home_*`)
  - Cálculo de `lateByDays` na conclusão
  - Geração de instâncias recorrentes

- [ ] **Pontuação FamilyHome**
  - +10 pts: no prazo
  - +15 pts: antecipada
  - -5 pts: atrasada > 1 dia
  - Streak de tarefas

**Critério de aceite:** Cada membro vê suas tarefas do dia ao abrir o app e consegue concluir sem dificuldade.

---

## Fase 2 — FamilyFin MVP
**Objetivo:** Família registra gastos e sabe quem deve quanto pra quem, sempre.

### Entregas

- [ ] **Registro de Gastos**
  - Formulário: valor (calculadora numérica), descrição, categoria, quem pagou, data
  - Divisão padrão: igualmente entre todos
  - Divisão customizada: ajuste por membro
  - Editar e excluir gasto

- [ ] **Acerto de Contas**
  - Cálculo automático de dívidas (algoritmo de simplificação de dívidas)
  - Tela "Quem deve pra quem": lista clara de transferências necessárias
  - Botão "Liquidar" registra pagamento e zera a dívida

- [ ] **Metas de Economia**
  - Criar meta: nome, valor, prazo, cor
  - Adicionar contribuição por membro
  - Barra de progresso
  - Celebração ao atingir meta

- [ ] **Orçamento Mensal**
  - Definir limite por categoria
  - Alerta ao atingir 80% do limite
  - Resumo visual do mês: gasto vs orçado

- [ ] **FinStore (Zustand)**
  - Todos os valores em centavos (sem float)
  - Persistência `4family_fin_*`
  - Algoritmo de simplificação de dívidas

- [ ] **Pontuação FamilyFin**
  - +5 pts: registrar gasto no dia
  - +10 pts: liquidar dívida em até 3 dias
  - +20 pts: contribuir para meta
  - -5 pts: dívida aberta > 7 dias

**Critério de aceite:** Após uma semana de uso, qualquer membro consegue ver exatamente quanto deve ou tem a receber, sem fazer conta manual.

---

## Fase 3 — Gamificação Unificada
**Objetivo:** 4Family Score funcionando, ranking geral visível no hub.

### Entregas

- [ ] **4Family Score**
  - Cálculo: `chef*0.4 + home*0.4 + fin*0.2`
  - Atualizado em tempo real ao ganhar pontos em qualquer módulo
  - Exibido no hub e no perfil

- [ ] **Ranking Global**
  - Tela de ranking no hub (não dentro de módulo)
  - Podium com 4Family Score
  - Sub-rankings por módulo colapsáveis

- [ ] **Badges Cross-Módulo**
  - "Família Completa" — todos os 3 ativos na semana
  - "Mestre do Lar" — top 1 em todos na mesma semana
  - "Constante" — 30 dias sem falhar em nenhum módulo
  - Notificação in-app ao conquistar badge

- [ ] **Global Stats Store**
  - Agregação dos 3 módulos
  - Histórico de 4Family Score por semana (últimas 8)
  - Persistência `4family_global_stats`

**Critério de aceite:** Qualquer membro abre o hub e vê seu 4Family Score e a posição no ranking sem entrar em nenhum módulo.

---

## Fase 4 — IA nos 3 Módulos
**Objetivo:** Inteligência contextual em cada módulo.

### FamilyChef IA (já planejado no BOOTSTRAP_LLM.md)
- Sugestão de cardápio semanal
- Modo improviso
- Guia de preparo
- Alerta de repetição

### FamilyFin IA (novo)
- [ ] Análise de gastos: "Vocês gastaram 30% mais no mercado esse mês"
- [ ] Sugestão de orçamento baseada no histórico
- [ ] Alerta proativo: "A meta de férias está em risco — faltam R$800 em 2 semanas"

### FamilyHome IA (novo)
- [ ] Sugestão de redistribuição: "Felipe tem 5 tarefas abertas, Leticia tem 1 — redistribuir?"
- [ ] Detecção de tarefas negligenciadas: "Limpar banheiro não é feita há 12 dias"
- [ ] Geração automática de recorrentes: "Com base no histórico, sugerimos: lavar louça diário"

**Critério de aceite:** Cada módulo tem pelo menos 1 sugestão de IA útil e usada semanalmente.

---

## Fase 5 — Backend Real (Supabase)
**Objetivo:** Dados sincronizados entre dispositivos em tempo real.

### Entregas

- [ ] **Schema Supabase**
  - Tabelas para todos os módulos
  - RLS por família (multi-tenant preparado)
  - Migrações versionadas

- [ ] **Sincronização**
  - Migração do localStorage para Supabase
  - Realtime: atualizações instantâneas entre dispositivos
  - Conflito offline: last-write-wins com timestamp

- [ ] **Auth Real**
  - Login por email + magic link
  - Ou OAuth Google
  - PIN ainda funciona como camada de privacidade local

- [ ] **Histórico Completo**
  - Tarefas, gastos e refeições de meses anteriores
  - Sem limite de armazenamento local

**Critério de aceite:** Felipe registra gasto no celular e Leticia vê no computador em < 2 segundos.

---

## Fase 6 — PWA + Polimento Final
**Objetivo:** App nativo no celular, bonito e rápido.

### Entregas

- [ ] **PWA completo**
  - Manifest do 4Family (ícone, splash, cores)
  - Service Worker com cache inteligente por módulo
  - Funciona offline com dados do localStorage

- [ ] **Modo escuro**
  - Paleta adaptada por módulo (cores mantidas, fundo escurecido)
  - Respeita preferência do sistema

- [ ] **Micro-interações**
  - Confetti ao concluir tarefa ou atingir meta
  - Animação de pontos subindo (+10!)
  - Transição suave entre módulos

- [ ] **Onboarding**
  - Tour de 3 steps para novos membros
  - Tooltip na primeira visita a cada módulo

**Critério de aceite:** App instalado na tela inicial de todos os membros da família.

---

## Marcos

| Marco | Semana | Entregável |
|-------|--------|-----------|
| 🔄 FamilyChef migrado | 1 | Hub funcionando com PIN |
| 🏠 FamilyHome no ar | 3 | Tarefas recorrentes e avulsas |
| 💰 FamilyFin no ar | 5 | Gastos e acerto de contas |
| 🏆 4Family Score | 6 | Ranking unificado |
| 🤖 IA completa | 9 | IA nos 3 módulos |
| ☁️ Sync em tempo real | 13 | Backend Supabase |
| 📱 App instalado | 14 | PWA na tela inicial |
