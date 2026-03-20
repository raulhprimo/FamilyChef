# PRD — 4Family 🏠
### Product Requirements Document

**Versão:** 1.0  
**Data:** Março 2026  
**Família:** Elaine, Felipe, Leticia  
**Status:** Draft  
**Substitui:** PRD FamilyChef v1.0

---

## 1. Visão Geral

**4Family** é um hub doméstico que centraliza três módulos essenciais para a rotina familiar:

| Módulo | Foco | Status |
|--------|------|--------|
| **FamilyChef** | Cardápio semanal, responsáveis e IA culinária | Existente — migrar |
| **FamilyFin** | Gastos compartilhados, divisão e metas | Novo |
| **FamilyHome** | Tarefas de casa, recorrentes e avulsas | Novo |

O app é acessado por seleção de membro + PIN opcional, e permite navegar entre módulos sem precisar fazer login novamente.

---

## 2. Problema

A família gerencia comida, dinheiro e tarefas em ferramentas separadas (ou na cabeça). Não há visibilidade compartilhada, a carga mental recai desigualmente e não existe forma de reconhecer quem está contribuindo mais no geral.

---

## 3. Usuários

| Membro | Perfil | Interesse principal |
|--------|--------|---------------------|
| **Elaine** | Co-gestora, mais envolvida | FamilyChef + FamilyFin |
| **Felipe** | Quer saber suas obrigações | FamilyChef + FamilyHome |
| **Leticia** | Engaja via gamificação | FamilyHome + ranking geral | - Leticia fica fora do FamilyFin por ser menor

---

## 4. Arquitetura de Navegação

### Fluxo principal
1. **Tela de entrada** — seleção de membro (cards com emoji + cor) + PIN de 4 dígitos
2. **Hub 4Family** — 3 cards grandes, um por módulo, com preview de status
3. **Módulo ativo** — navegação interna própria do módulo (bottom nav ou sidebar)
4. **Trocar módulo** — ícone no header do módulo volta ao hub sem novo login

### Sessão
- PIN correto → sessão válida por 8 horas ou até fechar o app
- Ao voltar ao hub, sessão permanece ativa
- Trocar de membro → solicita PIN do novo membro

---

## 5. Hub 4Family — Tela Inicial (pós-login)

Cada card de módulo exibe:

**FamilyChef card:**
- Prato do almoço de hoje (ou "Não planejado")
- Quem cozinha hoje
- Quantos dias da semana estão preenchidos

**FamilyFin card:**
- Organizador de finanças
- Incluir gastos do mês (Compras, Despesas, Contas e etc)
- Meta do mês: X% atingida

**FamilyHome card:**
- Tarefas pendentes hoje para o membro ativo
- Total de tarefas abertas na semana
- Streak atual do membro

---

## 6. Sistema de Gamificação — Híbrido

### Rankings por módulo
Cada módulo tem seu próprio ranking semanal com pontos e badges específicos.

### 4Family Score (ranking geral)
Soma ponderada dos módulos:
- FamilyChef: peso 40%
- FamilyHome: peso 40%
- FamilyFin: peso 20% (participação — registrar gastos, não ter dívidas)

Exibido no perfil do membro e na tela do hub.

### Badges cross-módulo
- **"Família Completa"** — todos os 3 módulos ativos na semana
- **"Mestre do Lar"** — top 1 em todos os módulos na mesma semana
- **"Constante"** — 30 dias sem falhar em nenhum módulo

---

## 7. FamilyFin — Requisitos

### 7.1 Registro de Gastos
- Cadastrar gasto: valor, descrição, categoria, quem pagou
- Categorias padrão: Mercado, Conta, Transporte, Lazer, Outros
- Múltiplos pagadores por gasto (ex: "Felipe e Elaine dividiram a conta da internet")
- Data do gasto (default: hoje)

### 7.2 Divisão entre Membros
- Visão de "quem deve quanto pra quem" sempre atualizada
- Divisão igual como padrão, ajustável por gasto
- Tela de acerto: botão "Liquidar dívida" registra o pagamento
- Histórico de acertos

### 7.3 Metas de Economia
- Criar meta: nome, valor alvo, data limite, cor
- Contribuições da família para a meta (quem depositou quanto)
- Progresso visual em barra
- Notificação quando meta atingida

### 7.4 Orçamento Mensal por Categoria
- Definir limite mensal por categoria (ex: Mercado R$800)
- Alerta quando gasto atinge 80% do limite
- Resumo mensal de quanto foi gasto vs orçado

### 7.5 Pontuação FamilyFin
- +5 pts: registrar um gasto no dia em que aconteceu
- +10 pts: liquidar dívida em até 3 dias
- +20 pts: contribuir para uma meta
- -5 pts: ter dívida aberta há mais de 7 dias

---

## 8. FamilyHome — Requisitos

### 8.1 Tarefas Recorrentes
- Criar tarefa com: nome, responsável(eis), frequência (diária, semanal, quinzenal, mensal)
- Dia(s) da semana para tarefas semanais
- Instâncias geradas automaticamente conforme a frequência
- Exemplos: "Tirar o lixo — Felipe — segunda e quinta", "Limpar banheiro — Leticia — sábado"

### 8.2 Tarefas Avulsas
- Criar tarefa com: nome, responsável, prazo, prioridade (normal/urgente)
- Tag de categoria: Limpeza, Compras, Manutenção, Outros
- Comentários na tarefa

### 8.3 Visão por Membro
- Aba "Minhas tarefas hoje" — só o que é do membro ativo
- Aba "Todas as tarefas" — visão da família completa
- Filtros por status (pendente, concluída, atrasada)

### 8.4 Histórico e Relatório
- Tarefas concluídas por membro no mês
- Quem foi mais ativo (contagem + tempo de resposta médio)
- Tarefas que ficaram atrasadas com frequência (para redistribuir)

### 8.5 Pontuação FamilyHome
- +10 pts: concluir tarefa no prazo
- +15 pts: concluir tarefa antecipada (antes do prazo)
- -5 pts: tarefa atrasada em mais de 1 dia
- Streak de tarefas: bônus por dias consecutivos sem atraso

---

## 9. Perfil e PIN

- PIN de 4 dígitos por membro (opcional — pode deixar em branco)
- Membro sem PIN: acesso direto ao tocar o card
- Membro com PIN: teclado numérico exibido após selecionar
- PIN pode ser alterado dentro do perfil
- Sem recuperação de PIN (uso doméstico — qualquer adulto pode resetar)
- Reset de PIN: tela de configurações, visível para todos os membros

---

## 10. Fora do Escopo (v1)

- Múltiplas famílias / contas
- Integração bancária automática (Open Finance)
- Notificações push (push notifications)
- Foto de comprovante de gasto
- Sincronização com Google Calendar
- Relatórios exportáveis em PDF

---

## 11. Requisitos Não Funcionais

- **Mobile-first**, responsivo até desktop
- **Offline-first**: lê do localStorage, sincroniza quando online (v2)
- **Performance**: transição entre módulos < 300ms
- **Design**: tema consistente entre módulos, identidade visual unificada do 4Family

---

## 12. Métricas de Sucesso

- Os 3 módulos usados ativamente na mesma semana
- Dívidas entre membros liquidadas em até 3 dias (média)
- Taxa de tarefas concluídas no prazo > 80%
- Cardápio preenchido para 5+ dias toda semana
