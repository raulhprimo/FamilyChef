# Roadmap — FamilyChef 🗓️

**Última atualização:** Março 2026  
**Metodologia:** Entregas iterativas por fase — cada fase é utilizável de forma independente.

---

## Visão das Fases

```
Fase 1 (MVP)     → Cardápio + Responsáveis         [Semanas 1–2]
Fase 2           → Gamificação Completa             [Semanas 3–4]
Fase 3           → UX Polida + PWA                 [Semanas 5–6]
Fase 4           → Backend Real                    [Semanas 7–10]
Fase 5           → Funcionalidades Avançadas        [Futuro]
```

---

## Fase 1 — MVP: O Cardápio da Semana
**Objetivo:** A família consegue planejar e visualizar o cardápio completo da semana.

### Entregas

- [ ] **Setup do projeto**
  - Vite + React + TypeScript
  - Tailwind CSS configurado
  - react-apple-emojis instalado
  - HugeIcons integrado
  - Estrutura de pastas conforme CLAUDE.md

- [ ] **Seleção de Perfil**
  - Tela inicial com os 3 membros (Elaine, Felipe, Leticia)
  - Salva perfil ativo no localStorage
  - Avatar com emoji + cor do membro

- [ ] **Grade da Semana**
  - 7 colunas (Seg → Dom) × 2 linhas (Almoço, Janta)
  - Navegação entre semanas (← →)
  - Indicador de "hoje"
  - Célula vazia com CTA para adicionar prato

- [ ] **Adicionar / Editar Prato**
  - Modal ou edição inline
  - Campo: nome do prato
  - Seleção de responsável
  - Salvar no localStorage

- [ ] **Marcar Refeição como Feita**
  - Toggle na célula da refeição
  - Visual de "concluído" (check verde)
  - Registro do timestamp

- [ ] **Persistência Local**
  - Toda mutação salva no localStorage
  - Carregamento automático ao abrir app

**Critério de aceite:** Qualquer membro da família consegue planejar a semana inteira e marcar refeições como feitas sem instrução prévia.

---

## Fase 2 — Gamificação
**Objetivo:** Tornar o preparo das refeições competitivo e divertido.

### Entregas

- [ ] **Sistema de Pontos**
  - Cálculo de pontos por refeição feita
  - Bônus de planejamento (+2 por prato cadastrado)
  - Persistência de pontos por membro

- [ ] **Streaks**
  - Cálculo de dias consecutivos ativos
  - Visual de streak na tela de perfil
  - Bônus automático por streak de 3 e 7 dias

- [ ] **Ranking Semanal**
  - Tela de Ranking com podium animado
  - Pontuação da semana atual
  - Histórico das últimas 4 semanas

- [ ] **Badges**
  - "Chef da Semana" (maior pontuação na semana)
  - "Sequência de 3 dias"
  - "Sequência de 7 dias"
  - "Mês Completo" (28+ refeições no mês)
  - Exibição de badges no perfil

- [ ] **Tela de Perfil**
  - Pontuação total
  - Streak atual e recorde
  - Badges conquistados
  - Gráfico simples de participação por semana

**Critério de aceite:** Os membros verificam o ranking espontaneamente sem serem pedidos.

---

## Fase 3 — UX Polida + PWA
**Objetivo:** O app sente-se nativo no celular, bonito e rápido.

### Entregas

- [ ] **Animações e Micro-interações**
  - Confetti ao marcar refeição como feita
  - Animação de subida de pontos (+10!)
  - Transição suave entre semanas
  - Entrada no podium animada

- [ ] **PWA**
  - Service Worker para uso offline
  - Manifest com ícone e splash screen
  - "Adicionar à tela inicial" funcional
  - Funciona sem internet (lê do cache)

- [ ] **Modo Escuro**
  - Toggle claro/escuro
  - Respeita preferência do sistema
  - Cores adaptadas por membro mantidas

- [ ] **Onboarding**
  - Tour de 3 passos na primeira vez
  - Tooltip nas funcionalidades principais

- [ ] **Acessibilidade**
  - Foco visível em todos os elementos
  - Labels ARIA em ícones e botões
  - Contraste mínimo WCAG AA

**Critério de aceite:** App instalado na tela inicial do celular de todos os membros.

---

## Fase 4 — Backend Real
**Objetivo:** Dados sincronizados entre dispositivos em tempo real.

### Entregas

- [ ] **Supabase Setup**
  - Banco de dados PostgreSQL
  - Tabelas: meals, members, stats, badges
  - Row Level Security básico

- [ ] **Sync de Dados**
  - Migração do localStorage para Supabase
  - Realtime: atualização automática quando outro membro edita
  - Fallback offline: salva local, sincroniza ao reconectar

- [ ] **Autenticação Simples**
  - Login por nome (sem senha, uso doméstico)
  - Ou magic link por email
  - Sessão persistente

- [ ] **Histórico Completo**
  - Consulta de cardápios de semanas anteriores
  - Exportação como PDF ou imagem

**Critério de aceite:** Felipe edita no celular e Leticia vê a atualização no computador em menos de 2 segundos.

---

## Fase 5 — Funcionalidades Avançadas (Backlog)

- [ ] **Receitas**
  - Banco de receitas da família
  - Vincular prato a receita
  - Ingredientes e modo de preparo

- [ ] **Lista de Compras Automática**
  - Gerada a partir do cardápio da semana
  - Compartilhável via WhatsApp

- [ ] **Sugestões com IA**
  - "Não sei o que cozinhar" → sugestão baseada em histórico
  - Sugestões por temporada ou ingredientes disponíveis

- [ ] **Notificações**
  - Push notification: "Hoje é sua vez de cozinhar o almoço!"
  - Lembrete para planejar a semana (todo domingo)

- [ ] **Fotos das Refeições**
  - Tirar foto do prato após preparo
  - Galeria semanal da família

---

## Marcos

| Marco | Data Estimada | Entregável |
|-------|--------------|-----------|
| 🚀 MVP Online | Semana 2 | App funcional, cardápio + responsáveis |
| 🎮 Gamificação Live | Semana 4 | Pontos, streaks, ranking |
| 📱 Instalado nos celulares | Semana 6 | PWA na tela inicial |
| ☁️ Sync em tempo real | Semana 10 | Backend Supabase |

---

## Priorização (MoSCoW)

### Must Have (MVP)
- Grade semanal visual
- Cadastro de pratos com responsável
- Marcar como feito
- Ranking básico

### Should Have
- Streaks e badges
- Modo escuro
- PWA / offline

### Could Have
- Receitas vinculadas
- Lista de compras
- Fotos

### Won't Have (v1)
- Múltiplas famílias
- Integração com supermercados
- Análise nutricional
