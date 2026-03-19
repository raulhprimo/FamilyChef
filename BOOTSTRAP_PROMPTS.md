# Bootstrap Prompts — FamilyChef 🤖

Prompts prontos para usar com Claude ao desenvolver cada parte do FamilyChef. Execute-os em ordem dentro de um projeto Claude com o CLAUDE.md e PRD carregados no contexto.

---

## Como Usar

1. Abra o Claude (Claude.ai ou Claude Code)
2. Faça upload do `CLAUDE.md` e do `PRD.md` no início da conversa
3. Use os prompts abaixo em ordem
4. Sempre inicie uma nova sessão com: *"Leia o CLAUDE.md e o PRD.md antes de começar."*

---

## Prompt 0 — Setup Inicial do Projeto

```
Leia o CLAUDE.md e o PRD.md. 

Agora crie o setup inicial do projeto FamilyChef com:
- Vite + React 18 + TypeScript
- Tailwind CSS v3
- React Router v6
- Zustand
- react-apple-emojis

Crie a estrutura de pastas exatamente como definida no CLAUDE.md.
Crie também o arquivo src/constants/members.ts com os dados dos membros da família (Elaine, Felipe, Leticia) conforme o CLAUDE.md.
Crie o arquivo src/types/index.ts com todos os tipos definidos no CLAUDE.md.

Não crie nenhuma tela ainda — apenas o scaffold.
```

---

## Prompt 1 — Tela de Seleção de Perfil

```
Leia o CLAUDE.md antes de começar.

Crie a tela de seleção de perfil (src/pages/ProfileSelect.tsx).

Requisitos:
- Exibir os 3 membros: Elaine, Felipe, Leticia
- Cada card deve ter: emoji (react-apple-emojis), nome, cor do membro como destaque
- Ao clicar, salva { memberId, memberName } no localStorage com chave "familychef_active_member"
- Redireciona para /home após seleção
- Design: clean, mobile-first, fundo off-white (#FAFAF8), cards grandes e clicáveis
- Animação sutil de escala ao hover
- Fonte: Nunito (importar do Google Fonts no index.html)

Não use auth real — isso é uso doméstico/local.
```

---

## Prompt 2 — Store de Refeições (Zustand)

```
Leia o CLAUDE.md antes de começar.

Crie o store de refeições em src/store/mealsStore.ts usando Zustand.

O store deve ter:
- Estado: meals: Meal[] (tipo definido em src/types/index.ts)
- Ação: addMeal(meal: Omit<Meal, 'id'>)
- Ação: updateMeal(id: string, data: Partial<Meal>)
- Ação: deleteMeal(id: string)
- Ação: toggleDone(id: string) → marca como feito + registra doneAt timestamp
- Seletor: getMealsByWeek(weekId: string): Meal[]
- Seletor: getMealsByDate(date: string): Meal[]

Toda mutação deve persistir automaticamente no localStorage sob a chave "familychef_meals".
O store deve carregar do localStorage ao inicializar.

weekId deve ser gerado no formato ISO 8601: "YYYY-WNN" (ex: "2026-W12").
Crie também src/utils/dates.ts com a função getWeekId(date: Date): string.
```

---

## Prompt 3 — Grade da Semana

```
Leia o CLAUDE.md antes de começar.

Crie a grade semanal em src/components/WeekGrid.tsx.

Requisitos:
- 7 colunas (Segunda → Domingo) × 2 linhas (Almoço, Janta)
- Header de cada coluna: dia da semana abreviado + data (ex: "Seg 18/03")
- Coluna do dia atual com destaque visual (borda colorida ou fundo levemente diferente)
- Cada célula de refeição (MealCell) deve mostrar:
  - Se vazia: emoji de prato vazio + texto "Adicionar" (clicável)
  - Se preenchida: nome do prato + avatar do responsável
  - Se concluída: check verde + nome riscado sutilmente
- Barra de navegação de semana: "← Semana anterior | Semana 12 (Mar) | Próxima semana →"
- Mobile: scroll horizontal na grade (overflow-x-auto)
- Desktop: grade completa visível

Use o mealsStore para buscar dados.
Use react-apple-emojis para emojis.
Use HugeIcons para o ícone de check e de adicionar (via MCP).
```

---

## Prompt 4 — Modal de Adicionar/Editar Prato

```
Leia o CLAUDE.md antes de começar.

Crie o modal de adicionar/editar prato em src/components/MealModal.tsx.

Props:
- isOpen: boolean
- onClose: () => void
- date: string (ISO)
- mealType: 'lunch' | 'dinner'
- existingMeal?: Meal (se edição)

O modal deve ter:
- Campo de texto: "Nome do prato" (obrigatório)
- Seleção de responsável: botões/chips com avatar de cada membro (Elaine, Felipe, Leticia)
  - Cada chip com a cor do membro e emoji (react-apple-emojis)
- Botão "Salvar" (chama addMeal ou updateMeal do store)
- Botão "Cancelar"
- Se existingMeal: botão "Excluir prato" com confirmação
- Design: bottom sheet no mobile, modal centralizado no desktop
- Animação: slide-up no mobile, fade no desktop

Não usar <form> tags — usar onClick nos botões.
```

---

## Prompt 5 — Sistema de Pontos

```
Leia o CLAUDE.md antes de começar.

Crie o sistema de pontos em src/utils/points.ts e src/store/statsStore.ts.

Em points.ts, crie as funções:
- calculateMealPoints(meal: Meal): number → retorna pontos por refeição concluída
- calculateStreakBonus(streak: number): number → bônus por streak
- getStreakMessage(streak: number): string → mensagem motivacional por streak

Em statsStore.ts (Zustand), crie:
- Estado: stats: Record<string, MemberStats> (chave = memberId)
- Ação: recordMealDone(meal: Meal) → adiciona pontos + atualiza streak
- Ação: recordMealPlanned(meal: Meal) → +2 pontos por planejamento
- Seletor: getWeekRanking(weekId: string): { memberId, points }[]
- Seletor: getMemberStats(memberId: string): MemberStats

Regras de pontos (conforme CLAUDE.md):
- Refeição feita: +10 pontos
- Planejou prato: +2 pontos
- Streak 3 dias: +15 bônus
- Streak 7 dias: +50 bônus

Persistir no localStorage sob "familychef_stats".
Streaks são calculados por dias corridos (não por semana).
```

---

## Prompt 6 — Tela de Ranking

```
Leia o CLAUDE.md antes de começar.

Crie a tela de ranking em src/pages/Ranking.tsx.

Seções da tela:
1. **Podium** (top 3 da semana atual)
   - 1º lugar no centro, mais alto
   - 2º à esquerda, 3º à direita
   - Avatar com emoji (react-apple-emojis) + nome + pontos
   - Coroa emoji no 1º lugar
   - Cores dos membros nos pedestais

2. **Lista completa** com pontos da semana e total geral

3. **Badges conquistados** — grid de ícones com badges de cada membro
   - Badge "bloqueado" em cinza se ainda não conquistado

4. **Histórico** — mini gráfico de barras das últimas 4 semanas por membro

Use statsStore para os dados.
Animação: membros do podium entram com slide-up ao montar a tela.
Use HugeIcons para ícones de troféu e medalha (via MCP).
```

---

## Prompt 7 — Tela de Perfil do Membro

```
Leia o CLAUDE.md antes de começar.

Crie a tela de perfil em src/pages/Profile.tsx.

Exibir para o membro ativo:
- Avatar grande com emoji (react-apple-emojis) e cor do membro
- Nome e "Chef desde [data de criação]"
- Card de estatísticas: pontos totais, streak atual, recorde de streak
- Grid de badges (conquistados em destaque, bloqueados em cinza)
  - Tooltip com descrição de cada badge ao hover/tap
- Botão "Trocar perfil" → volta para /profile-select

Use statsStore e mealsStore para os dados.
Design: fundo com gradiente sutil na cor do membro (opacity baixa), cards brancos sobre fundo colorido.
```

---

## Prompt 8 — Navegação e Layout

```
Leia o CLAUDE.md antes de começar.

Crie o layout principal em src/components/Layout.tsx e a navegação inferior.

Navegação (bottom nav, mobile-first):
- 4 abas: Cardápio | Ranking | Perfil | (aba extra futura)
- Ícones HugeIcons via MCP + label pequena
- Indicador de aba ativa com cor do membro atual
- No desktop: sidebar lateral com as mesmas abas

Header:
- Logo "FamilyChef" com emoji 🍽️ (react-apple-emojis)
- Avatar pequeno do membro ativo no canto direito (clicável → perfil)
- Semana atual no centro (ex: "Semana 12")

Configure o React Router com as rotas:
- / → ProfileSelect
- /home → Home (grade da semana)
- /ranking → Ranking
- /profile → Profile

Proteja /home, /ranking, /profile: se não há membro ativo no localStorage, redireciona para /.
```

---

## Prompt 9 — PWA e Deploy

```
Configure o FamilyChef como PWA.

Passos:
1. Crie public/manifest.json com:
   - name: "FamilyChef"
   - short_name: "FamilyChef"
   - theme_color: "#FF6B6B"
   - background_color: "#FAFAF8"
   - display: "standalone"
   - start_url: "/"
   - Ícones em 192x192 e 512x512 (placeholder colorido se não tiver asset)

2. Use vite-plugin-pwa para o Service Worker
   - Estratégia: "NetworkFirst" para assets dinâmicos
   - Cache completo dos assets estáticos

3. Crie um arquivo vercel.json simples para deploy no Vercel
   - SPA redirect: toda rota → /index.html

4. Adicione ao README.md instruções de:
   - Como rodar localmente
   - Como fazer deploy no Vercel
   - Como adicionar à tela inicial no iOS e Android
```

---

## Prompt 10 — Polimento e Micro-interações

```
Leia o CLAUDE.md antes de começar.

Adicione polimento visual ao FamilyChef:

1. **Confetti ao marcar refeição como feita**
   - Instale canvas-confetti
   - Dispara ao chamar toggleDone() com done: true
   - Cores do confetti = cor do membro responsável

2. **Animação de pontos**
   - Ao ganhar pontos, exibe "+10 🎉" flutuando e sumindo acima da célula
   - Implementar com CSS keyframes ou Framer Motion

3. **Toast de feedback**
   - Crie src/components/Toast.tsx
   - Mensagens: "Refeição concluída! +10 pontos 🍽️"
   - Auto-dismiss em 3 segundos
   - Posição: topo centralizado no mobile

4. **Skeleton loading**
   - Enquanto carrega do localStorage, exibe skeleton na grade da semana
   - Animação de shimmer

5. **Célula vazia motivacional**
   - Células sem prato: rotacionam entre 3 frases motivacionais
     Ex: "O que vai rolar hoje? 🤔", "Surpreenda a família! 🌟"
```

---

## Dicas de Uso

- **Sempre carregue o CLAUDE.md** no início de cada sessão de desenvolvimento
- Use um prompt por sessão para manter o contexto limpo
- Após cada prompt, teste no browser antes de avançar
- Se algo quebrar, inclua o erro completo no próximo prompt
- Os prompts podem ser combinados se quiser avançar mais rápido: ex., Prompts 3+4 juntos

---

## Ordem Recomendada para MVP Rápido

```
Prompt 0 → Setup
Prompt 1 → Perfil
Prompt 2 → Store
Prompt 3 → Grade
Prompt 4 → Modal
Prompt 8 → Navegação
↓
✅ MVP funcional
↓
Prompt 5 → Pontos
Prompt 6 → Ranking
Prompt 7 → Perfil completo
Prompt 10 → Polimento
```
