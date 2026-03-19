# PRD — FamilyChef 🍽️
### Product Requirements Document

**Versão:** 1.0  
**Data:** Março 2026  
**Equipe:** Elaine, Felipe, Leticia  
**Status:** Draft

---

## 1. Visão Geral

FamilyChef é um web app doméstico para organizar o cardápio semanal da família, atribuir responsáveis por cada refeição e gamificar a participação de cada membro — reduzindo a carga mental sobre a mãe e tornando a cozinha uma responsabilidade compartilhada (e divertida).

---

## 2. Problema

A mãe carrega sozinha o peso de decidir, planejar e preparar o almoço e jantar toda semana. Não há visibilidade do que será feito, nem distribuição justa das tarefas. Isso gera sobrecarga, repetição de pratos e falta de engajamento dos demais membros da família.

---

## 3. Objetivo

- Planejar o cardápio semanal (Almoço + Janta, Seg–Dom)
- Distribuir responsáveis por cada refeição entre: Elaine, Felipe e Leticia
- Gamificar a participação (pontos, streaks, ranking semanal)
- Dar visibilidade a todos via interface simples e bonita

---

## 4. Usuários

| Persona | Descrição |
|--------|-----------|
| **Mãe (usuária principal)** | Quer planejar e delegar com facilidade |
| **Felipe** | Quer saber o que vai comer e quando é sua vez |
| **Leticia** | Quer participar e acompanhar o ranking |
| **Elaine** | Co-gestora do planejamento semanal |

---

## 5. Funcionalidades

### 5.1 Cardápio Semanal
- Grade visual semana a semana (Segunda → Domingo)
- Duas linhas por dia: Almoço e Janta
- Campo para nome do prato em cada célula
- Edição inline ou via modal
- Navegação entre semanas (anterior / próxima / hoje)

### 5.2 Responsáveis por Refeição
- Cada refeição tem um responsável atribuído: Elaine, Felipe ou Leticia
- Avatar + nome colorido do responsável
- Indicador visual de "hoje" na grade

### 5.3 Gamificação
- Pontos por refeição preparada e marcada como concluída
- Streak semanal por membro (dias consecutivos sem falhar)
- Ranking semanal (podium dos 3 membros)
- Badges: "Chef da Semana", "5 dias seguidos", "Mês completo"
- Histórico de pontuação por membro

### 5.4 Notificações (futuro)
- Lembrete de qual refeição cada um deve preparar hoje
- Aviso se nenhum prato foi cadastrado para o dia seguinte

### 5.5 Receitas Rápidas (futuro)
- Vincular um prato a uma receita salva
- Sugestões automáticas baseadas nos favoritos

---

## 6. Requisitos Não Funcionais

- **Plataforma:** Web (mobile-first, responsivo)
- **Autenticação:** Simples, baseada em seleção de perfil (sem senha, uso doméstico)
- **Persistência:** localStorage para MVP; backend real em fase posterior
- **Performance:** Carregamento instantâneo, sem dependências pesadas
- **Design:** Clean, Apple-inspired, emojis como linguagem visual

---

## 7. Fora do Escopo (v1)

- Notificações push
- Integração com apps de compras
- Receitas com ingredientes
- Múltiplas famílias / multi-tenant
- Autenticação com senha

---

## 8. Métricas de Sucesso

- Toda semana tem cardápio preenchido até domingo
- Pelo menos 2 membros diferentes preparam refeições por semana
- App usado ativamente por 3+ semanas seguidas
- Mãe reporta redução na carga de decisão

---

## 9. Riscos

| Risco | Mitigação |
|-------|-----------|
| Membros não marcam refeições como feitas | Gamificação + lembretes visuais |
| Cardápio não preenchido na semana | Notificação (v2) + responsável pelo planejamento rotativo |
| Dados perdidos sem backend | Exportar/importar JSON no MVP |

---

## 10. Stack Técnica Recomendada

- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS
- **Emojis:** react-apple-emojis
- **Ícones:** HugeIcons (via MCP)
- **Estado:** Zustand ou Context API
- **Persistência MVP:** localStorage
- **Persistência v2:** Supabase (PostgreSQL + Realtime)
- **Deploy:** Vercel ou Netlify
