# Bootstrap Prompts — Hub 4Family + Migração 🏠

Prompts para transformar o FamilyChef no hub 4Family.
Execute ANTES dos bootstraps do FamilyFin e FamilyHome.

---

## Contexto para o Claude antes de começar

```
Leia o CLAUDE_4Family.md antes de começar.

Vamos transformar o FamilyChef existente no hub 4Family.
Esta é a Fase 0 — sem ela, os outros módulos não funcionam.

O que vai acontecer:
1. Refatorar a estrutura de pastas
2. Criar sistema de auth com PIN
3. Criar o hub central com os 3 módulos
4. Migrar dados do localStorage do FamilyChef
5. Adicionar troca de módulo no header
```

---

## Prompt Hub-0 — Refatoração de Estrutura

```
Leia o CLAUDE_4Family.md antes de começar.

Refatore a estrutura de pastas do projeto FamilyChef para o 4Family.

1. Mover arquivos do FamilyChef:
   src/components/ → src/modules/chef/components/
   src/pages/      → src/modules/chef/pages/
   src/store/      → src/modules/chef/store/
   src/hooks/      → src/modules/chef/hooks/ (se houver)
   src/types/      → src/modules/chef/types/

2. Criar estrutura nova:
   src/core/components/   (vazio por enquanto)
   src/core/constants/    → mover members.ts e modules.ts para cá
   src/core/types/        → criar index.ts com tipos globais do CLAUDE_4Family.md
   src/core/store/        (vazio por enquanto)
   src/core/utils/        → mover dates.ts e points.ts para cá
   src/hub/               (vazio por enquanto)
   src/auth/              (vazio por enquanto)
   src/modules/fin/       (vazio — estrutura para futuro)
   src/modules/home/      (vazio — estrutura para futuro)

3. Atualizar todos os imports quebrados após o move.
   Use find-and-replace: "@/" paths devem continuar funcionando se Vite aliases estiverem configurados.

4. Renomear no package.json e index.html:
   "FamilyChef" → "4Family"
   Atualizar title, description e manifest (se existir)

5. Verificar que npm run build passa sem erros após a refatoração.
```

---

## Prompt Hub-1 — Sistema de Auth e PIN

```
Leia o CLAUDE_4Family.md antes de começar.

Crie o sistema de autenticação do 4Family.

1. src/core/utils/pin.ts
   Funções:
   - hashPIN(pin: string): Promise<string>
     Usa SubtleCrypto — sem libs externas:
     const data = encoder.encode(pin + '4familysalt2026')
     const hash = await crypto.subtle.digest('SHA-256', data)
     return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('')
   
   - verifyPIN(input: string, storedHash: string): Promise<boolean>
   - isPINSet(memberId: MemberId): boolean
     Lê de localStorage "4family_pins" — objeto { memberId: hash | null }

2. src/core/store/authStore.ts (Zustand)
   Estado:
   - session: AuthSession | null
   - activeMember: Member | null
   
   Ações:
   - login(memberId: MemberId): void
     Cria sessão (8h) e salva em sessionStorage "4family_session"
   - logout(): void
     Limpa sessionStorage
   - switchMember(memberId: MemberId): void
     Se novo membro tem PIN → retorna false (UI deve mostrar PINEntry)
     Se não tem PIN → faz login direto
   - isSessionValid(): boolean
     Verifica se expiresAt > agora
   - setPIN(memberId, pin): Promise<void>
     Hasheia e salva em localStorage "4family_pins"
   - removePIN(memberId): void
   
   Inicialização: ao criar o store, carregar sessão do sessionStorage se ainda válida.

3. src/auth/ProfileSelect.tsx (refatorado do FamilyChef)
   Mantém o visual de cards de membros.
   Ao clicar:
   - Se membro tem PIN: navega para /pin com memberId em state
   - Se não tem PIN: chama authStore.login(memberId) e navega para /hub

4. src/auth/PINEntry.tsx
   Teclado numérico 3×4 (1-9, *, 0, backspace).
   Display de 4 pontos (preenchidos conforme digita).
   Ao completar 4 dígitos: verifyPIN automaticamente.
   - Correto: login + navegar para /hub
   - Errado: shake animation + limpa os dígitos + "PIN incorreto"
   Após 5 tentativas erradas: "Tente novamente em 30 segundos" (cooldown local).
   Link "Esqueci o PIN" → modal de confirmação com aviso "Só um adulto pode resetar"
     → remove o PIN do membro (removePIN) e redireciona para /profile com a opção de criar novo.

5. src/core/components/AuthGuard.tsx
   HOC ou wrapper que verifica authStore.isSessionValid().
   Se inválida: redireciona para /.
   Use em todas as rotas protegidas.
```

---

## Prompt Hub-2 — Hub Central

```
Leia o CLAUDE_4Family.md antes de começar.

Crie a tela hub do 4Family.

1. src/hub/Hub.tsx
   Tela principal pós-login. Exibe os 3 módulos como cards grandes.
   
   Header do hub:
   - Logo/nome "4Family" centralizado
   - Avatar do membro ativo + nome no canto direito
   - Ao clicar no avatar: menu com "Trocar membro" e "Configurações"
   
   Grid de módulos (2 colunas no mobile, 3 no desktop):
   - FamilyChef card
   - FamilyFin card  
   - FamilyHome card
   
   Cada card tem cor do módulo como accent (borda top colorida de 4px).

2. src/hub/ModuleCard.tsx
   Props: module (ModuleId), previewData (any)
   
   Layout do card:
   - Emoji grande do módulo (react-apple-emojis)
   - Nome do módulo (ex: "FamilyChef")
   - Descrição curta
   - Área de preview (conteúdo específico por módulo — ver abaixo)
   - Botão "Abrir" ou clique no card inteiro navega para a rota do módulo
   
   Preview por módulo (dados reais dos stores):
   
   FamilyChef:
     - "Almoço hoje: [prato]" ou "Não planejado"
     - "Cozinha: [membro]" com avatar
     - "[N] dias planejados esta semana"
   
   FamilyFin:
     - "Mês atual: R$X gastos"
     - Dívida ativa: "Felipe deve R$Y para Elaine" (a mais urgente)
     - Ou: "Sem dívidas este mês ✓"
   
   FamilyHome:
     - "Suas tarefas hoje: N pendentes"
     - "X da família atrasadas" (se houver)
     - Ou: "Tudo em dia! ✓"
   
   Animação: cards entram com staggered fade-in-up ao montar o hub.

3. src/hub/GlobalRanking.tsx
   Seção abaixo dos cards: "4Family Score desta semana"
   Mini podium dos 3 membros com pontuação global.
   Botão "Ver ranking completo" → /ranking (tela global futura).
```

---

## Prompt Hub-3 — Troca de Módulo no Header

```
Leia o CLAUDE_4Family.md antes de começar.

Implemente o sistema de troca de módulo acessível de dentro de qualquer módulo.

1. src/core/components/ModuleSwitcher.tsx
   Componente chamado pelo header de cada módulo.
   
   UI: botão de ícone de grade/apps no header.
   Ao clicar: abre um bottom sheet (mobile) ou popover (desktop) com:
   - 3 opções de módulo em lista
   - Módulo atual marcado com checkmark
   - Avatar da cor do módulo + nome
   - Ao selecionar: navega para a rota raiz do módulo (/chef, /fin, /home-tasks)
   - Animação de fechamento antes de navegar

2. Atualizar o layout do FamilyChef (src/modules/chef/components/Layout.tsx)
   Adicionar no header:
   - Ícone de troca de módulo à esquerda (usa ModuleSwitcher)
   - "FamilyChef" no centro com a cor #FF6B6B
   - Avatar do membro ativo à direita

3. Criar src/core/components/AppHeader.tsx
   Header genérico que todos os módulos vão usar.
   Props:
   - moduleName: string
   - moduleColor: string
   - showModuleSwitcher?: boolean (default true)
   
   Combina ModuleSwitcher + título + avatar do membro ativo.
   Avatar clicável → dropdown: "Trocar membro" | "Configurações"

4. Ao trocar de membro pelo header (sem logout):
   Se novo membro tem PIN: mostrar PINEntry inline (modal, não navegar)
   Se não tem PIN: troca direto e atualiza a sessão
```

---

## Prompt Hub-4 — Migração de Dados

```
Leia o CLAUDE_4Family.md antes de começar.

Crie o sistema de migração dos dados do FamilyChef para o 4Family.

1. src/core/utils/migration.ts

Função: runMigrationIfNeeded(): boolean
  Returns true se migração foi executada, false se já foi feita antes ou sem dados para migrar.

Passos da migração:
  a. Verificar se chave "4family_migrated_v1" existe no localStorage → se sim, skip
  b. Verificar se chave "familychef_meals" existe → se não, skip (sem dados antigos)
  c. Ler "familychef_meals" e parsear
  d. Transformar para novo formato (tipos do CLAUDE_4Family.md):
     - Adicionar campo weekId se ausente (calcular de date)
     - Garantir que todos os campos obrigatórios existem
  e. Salvar em "4family_chef_meals"
  f. Fazer o mesmo para "familychef_stats" → "4family_chef_stats"
  g. Salvar "4family_migrated_v1": true no localStorage
  h. Retornar true

2. Chamar runMigrationIfNeeded() no App.tsx antes do render principal
   Se retornar true: exibir toast "Seus dados do FamilyChef foram migrados para o 4Family ✓"

3. Manter as chaves antigas ("familychef_*") intactas por enquanto.
   Adicionar um comentário no código: "TODO: remover em Maio 2026 após período de compatibilidade"

4. Criar uma função de diagnóstico para desenvolvimento:
   diagnoseMigration(): void
   Loga no console o estado de todas as chaves 4family_* e familychef_* no localStorage.
   Só disponível em import.meta.env.DEV.
```

---

## Prompt Hub-5 — Ranking Global e Perfil

```
Leia o CLAUDE_4Family.md antes de começar.

Crie o ranking global e a tela de perfil unificada.

1. src/core/store/globalStatsStore.ts (Zustand)
   
   Estado: globalStats: Record<MemberId, GlobalStats>
   
   Ação: recalculateScore(memberId)
   Busca pontos dos 3 módulos e recalcula:
   fourFamilyScore = chef*0.4 + home*0.4 + fin*0.2
   
   Esta ação deve ser chamada sempre que pontos de qualquer módulo mudam.
   Cada store de módulo deve chamar globalStatsStore.recalculateScore(memberId) após addPoints.
   
   Ação: updateGlobalStreak(memberId)
   Verifica se o membro teve atividade em qualquer módulo hoje.
   Se sim e tinha streak de ontem: incrementa. Se não: reseta.
   
   Persistência: "4family_global_stats"

2. src/hub/GlobalRankingPage.tsx (rota /ranking)
   
   Seções:
   - Seletor de semana atual / semana passada
   - Podium com 4Family Score (posição 1, 2, 3)
   - Lista completa com pontos por módulo (expandível)
     Cada membro: 4Family Score total + breakdown Chef/Fin/Home
   - Badges globais conquistados essa semana

3. src/auth/MemberProfile.tsx (rota /profile)
   
   Perfil unificado do membro ativo:
   - Avatar grande + nome + 4Family Score total
   - Streak global atual
   - Cards de estatísticas por módulo (3 mini-cards)
   - Todos os badges (globais + por módulo)
   - Seção de configurações:
     - "Alterar PIN" → PINEntry com modo de criação
     - "Remover PIN" → confirmação
```

---

## Ordem de Execução (Fase 0 completa)

```
Hub-0 → Refatoração de estrutura (crítico — fazer primeiro)
Hub-4 → Migração de dados (antes de qualquer teste)
Hub-1 → Auth + PIN
Hub-2 → Hub central
Hub-3 → Troca de módulo
Hub-5 → Ranking global + Perfil
     ↓
✅ Fase 0 concluída
     ↓
Iniciar BOOTSTRAP_FamilyHome.md
Iniciar BOOTSTRAP_FamilyFin.md (em paralelo ou depois)
     ↓
BOOTSTRAP_LLM.md (após os módulos estarem funcionando)
```

---

## Checklist de Aceite da Fase 0

```
- [ ] npm run build passa sem erros após refatoração
- [ ] FamilyChef funciona igual ao antes (nenhuma regressão)
- [ ] Dados antigos do localStorage aparecem no app após migração
- [ ] Toast de migração aparece na primeira abertura
- [ ] Seleção de membro funciona
- [ ] PIN pode ser configurado e verificado
- [ ] 5 tentativas erradas de PIN ativam cooldown de 30s
- [ ] Hub exibe os 3 cards de módulos
- [ ] Preview de dados reais aparece nos cards (pelo menos FamilyChef)
- [ ] Clicar em FamilyChef no hub abre o módulo
- [ ] Ícone de troca de módulo no header do FamilyChef funciona
- [ ] Trocar de membro sem logout funciona
- [ ] Sessão de 8h: ao reabrir o app antes de expirar, não pede login
- [ ] Sessão expirada: redireciona para /
```
