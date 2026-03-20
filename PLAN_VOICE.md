# Plano: Voice-to-Action com Whisper + GPT — HubFamily

**Data:** Março 2026
**Status:** Planejamento

---

## 1. Visão Geral

O usuário abre o microfone, fala o que precisa, e a aplicação:
1. Transcreve a fala (Whisper)
2. Interpreta e extrai ações estruturadas (GPT-4o-mini)
3. Mostra cards de confirmação antes de executar
4. Após confirmação, salva no banco (Supabase)

---

## 2. Fluxo de Dados

```
Usuário segura mic
  → MediaRecorder captura áudio (WebM/Opus)
  → Solta / silêncio 2s / máx 30s → blob base64
  → Supabase Edge Function "voice-process"
      1. Envia áudio → OpenAI Whisper API → transcrição pt-BR
      2. Envia transcrição + contexto → OpenAI GPT-4o-mini → VoiceAction[]
      3. Retorna ações + texto de confirmação
  → Frontend exibe ConfirmationCards
  → Usuário confirma/rejeita cada ação individualmente
  → Confirmar → executa no Zustand store → salva no Supabase
```

---

## 3. Agentes (Personalidades)

| Agente | Módulo | Cor | Ações que extrai |
|--------|--------|-----|------------------|
| **Dona Sabor** | FamilyChef | `#FF6B6B` | `add_meal` — prato, data, tipo (almoço/janta), responsáveis |
| **Seu Capricho** | FamilyHome | `#F9A825` | `add_task` — tarefa, categoria, membro, data, prioridade |
| **Tio Cofrinho** | FamilyFin | `#4ECDC4` | `add_expense` — descrição, valor (centavos), categoria, quem pagou |

Cada agente recebe **apenas o schema do seu módulo** no prompt, reduzindo tokens.

---

## 4. Custos por Comando

| Etapa | Modelo | Custo estimado |
|-------|--------|----------------|
| Transcrição (10s áudio) | Whisper (`whisper-1`) | ~$0.003 |
| Interpretação (~200 tokens in, ~150 out) | GPT-4o-mini | ~$0.0003 |
| **Total por comando** | | **~$0.003-0.005** |

### Otimizações de custo

- **WebM/Opus**: menor formato de áudio nativo do browser (~30KB para 10s)
- `language: "pt"` no Whisper: pula detecção de idioma, mais rápido
- `response_format: "text"`: sem JSON/timestamps, só texto puro
- **GPT-4o-mini** (não GPT-4o): 15x mais barato, suficiente para extração estruturada
- **Detecção de silêncio** via `AnalyserNode`: para após 2s de silêncio
- **Cap de 30s**: limite máximo de gravação
- **Mínimo 1KB**: evita envio acidental (toque rápido no mic)
- **Schema mínimo por agente**: Claude recebe apenas os campos do módulo ativo

---

## 5. Tipos TypeScript

### `src/core/types/voice.ts`

```typescript
import type { MemberId } from '../constants/members';
import type { AgentId } from '../components/VoiceButton/constants';
import type { MealType } from '../types';
import type { TaskCategory, TaskPriority } from '../../modules/home/types';
import type { ExpenseCategory } from '../../modules/fin/types';

// === Ações que o LLM pode produzir ===

export type MealAction = {
  module: 'chef';
  action: 'add_meal';
  data: {
    date: string;             // "YYYY-MM-DD"
    type: MealType;           // 'lunch' | 'dinner'
    dish: string;
    responsibleIds: MemberId[];
  };
};

export type TaskAction = {
  module: 'home';
  action: 'add_task';
  data: {
    name: string;
    category: TaskCategory;
    assignedTo: MemberId;
    dueDate: string;          // "YYYY-MM-DD"
    priority: TaskPriority;
  };
};

export type ExpenseAction = {
  module: 'fin';
  action: 'add_expense';
  data: {
    description: string;
    amount: number;           // centavos (integer)
    category: ExpenseCategory;
    paidBy: MemberId[];
    splitBetween: MemberId[];
    date: string;
  };
};

export type VoiceAction = MealAction | TaskAction | ExpenseAction;

// === Card de confirmação ===

export type ConfirmationItem = {
  id: string;
  action: VoiceAction;
  status: 'pending' | 'confirmed' | 'rejected';
  displayText: string;        // texto legível gerado pelo LLM
};

// === API request/response ===

export type VoiceProcessRequest = {
  audio: string;              // base64 do áudio WebM/Opus
  agentId: AgentId;
  activeMemberId: MemberId;
  todayISO: string;
};

export type VoiceProcessResponse = {
  transcript: string;
  actions: Array<{
    action: VoiceAction;
    displayText: string;
  }>;
  agentReply?: string;        // fala do personagem
};
```

---

## 6. Supabase Edge Function

### `supabase/functions/voice-process/index.ts`

Uma única Edge Function que faz o pipeline completo:

```
POST /voice-process
Body: { audio, agentId, activeMemberId, todayISO }

  1. Decodifica base64 → Uint8Array
  2. Envia para Whisper API → transcrição texto
  3. Monta system prompt baseado no agentId
  4. Envia transcrição + prompt → GPT-4o-mini → JSON estruturado
  5. Parseia resposta → retorna VoiceProcessResponse
```

### Variáveis de ambiente

```
OPENAI_API_KEY=sk-...
```

### Chamada Whisper

```
POST https://api.openai.com/v1/audio/transcriptions
Content-Type: multipart/form-data

model: whisper-1
language: pt
response_format: text
file: <audio blob>
```

### Chamada GPT-4o-mini

```
POST https://api.openai.com/v1/chat/completions

model: gpt-4o-mini
response_format: { type: "json_object" }
messages: [system_prompt, user_message]
temperature: 0.1
max_tokens: 500
```

### System Prompt (por agente)

```
Você é {agentName}, assistente de voz do módulo {moduleName} do app HubFamily.

Data de hoje: {todayISO}
Amanhã: {tomorrowISO}

Membros da família: Elaine (elaine), Felipe (felipe), Leticia (leticia), Raul (raul)
{se fin: "Membros do FamilyFin: elaine, felipe, raul (Leticia não participa)"}
Membro ativo (quem está falando): {activeMemberId}

Sua tarefa: extrair ações estruturadas do texto transcrito do usuário.

REGRAS:
- Se não especificar membro, assuma o membro ativo ({activeMemberId})
- Se não especificar data, assuma hoje ({todayISO})
- "amanhã" = {tomorrowISO}
- Valores em reais → converter para centavos (R$ 50,00 = 5000)
- Uma frase pode conter MÚLTIPLAS ações — extraia TODAS
- Se não conseguir extrair ação válida, retorne actions: []
- Se o nome transcrito for parecido com um membro, use o mais próximo
  (ex: "Ilaini" → "elaine", "Haul" → "raul")

{SCHEMA DO MÓDULO — apenas o schema relevante para o agente}

Responda APENAS com JSON válido:
{
  "actions": [
    {
      "action": { "module": "...", "action": "...", "data": { ... } },
      "displayText": "Descrição em português do que será feito"
    }
  ],
  "agentReply": "Resposta curta e simpática no estilo do personagem"
}
```

#### Schema por agente

**Dona Sabor (chef):**
```
Schema de ação:
{ "module": "chef", "action": "add_meal", "data": {
    "date": "YYYY-MM-DD",
    "type": "lunch" | "dinner",  // padrão "lunch", "dinner" se disser janta/jantar
    "dish": "nome do prato",
    "responsibleIds": ["memberId"]  // quem vai cozinhar
} }
```

**Seu Capricho (home):**
```
Schema de ação:
{ "module": "home", "action": "add_task", "data": {
    "name": "nome da tarefa",
    "category": "limpeza" | "compras" | "manutencao" | "outros",  // padrão "limpeza"
    "assignedTo": "memberId",
    "dueDate": "YYYY-MM-DD",
    "priority": "normal" | "urgent"  // padrão "normal", "urgent" se disser urgente
} }
```

**Tio Cofrinho (fin):**
```
Schema de ação:
{ "module": "fin", "action": "add_expense", "data": {
    "description": "descrição do gasto",
    "amount": 5000,  // SEMPRE em centavos
    "category": "mercado" | "conta" | "transporte" | "lazer" | "outros",
    "paidBy": ["memberId"],
    "splitBetween": ["elaine", "felipe", "raul"],  // padrão: todos do fin
    "date": "YYYY-MM-DD"
} }
```

---

## 7. Arquitetura de Arquivos

### Novos

```
src/
  core/
    types/
      voice.ts                            # tipos VoiceAction, ConfirmationItem, API
    hooks/
      useAudioRecorder.ts                 # MediaRecorder + silêncio + max 30s
    services/
      voiceService.ts                     # supabase.functions.invoke('voice-process')
      voiceActionExecutor.ts              # mapeia VoiceAction → store.addMeal/addInstance/addExpense
    components/
      VoiceButton/
        ConfirmationCard.tsx              # card individual de confirmação

supabase/
  functions/
    voice-process/
      index.ts                            # Edge Function: Whisper → GPT-4o-mini → JSON
```

### Modificados

```
src/core/store/voiceAgentStore.ts         # + isProcessing, transcript, confirmations, agentReply, error
src/core/components/VoiceButton/
  AgentSheet.tsx                          # 4 fases visuais: idle → recording → processing → confirmation
  VoiceButton.tsx                         # badge de contagem de pendentes (opcional)
```

---

## 8. Fases da UI no AgentSheet

| Fase | Estado | Visual |
|------|--------|--------|
| **Idle** | `!isRecording && !isProcessing && confirmations.length === 0` | Seletor de agente + mic + "Toque para falar" |
| **Recording** | `isRecording` | Mic pulsando (pulse-ring) + "Ouvindo..." + indicador de tempo |
| **Processing** | `isProcessing` | Spinner + "Dona Sabor está pensando..." |
| **Confirmation** | `confirmations.length > 0` | Transcrição + cards + reply do agente |

---

## 9. ConfirmationCard — UX

Cada card mostra:

```
┌─────────────────────────────────────────────────┐
│ 🏠 Adicionar tarefa 'Limpar cozinha'            │
│    para Raul — amanhã (20/03)                   │
│                                                 │
│                        [✕ Rejeitar]  [✓ Confirmar] │
└─────────────────────────────────────────────────┘
```

- Borda esquerda colorida pelo módulo (chef=coral, home=amber, fin=teal)
- `displayText` gerado pelo GPT-4o-mini
- Botão confirmar (verde) e rejeitar (cinza)
- Se houver 2+ cards pendentes: botão "Confirmar todos" no final
- Após ação: card mostra estado confirmado/rejeitado com fade-out

---

## 10. Hook useAudioRecorder

```typescript
// src/core/hooks/useAudioRecorder.ts

Retorna: {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string>  // base64
  isRecording: boolean
  duration: number                      // segundos
  error: string | null
}

Comportamento:
1. getUserMedia({ audio: true })
2. MediaRecorder com mimeType 'audio/webm;codecs=opus'
   (fallback 'audio/mp4' no Safari iOS)
3. AnalyserNode do AudioContext monitora amplitude
4. Se silêncio > 2s após pelo menos 1s de fala → auto-stop
5. Se duração > 30s → auto-stop
6. ondataavailable com timeslice: 250ms (para silêncio detection em tempo real)
7. stopRecording() monta o Blob, converte para base64, retorna
8. Cleanup: revoga media stream tracks no unmount
9. Se blob < 1KB → retorna erro "Áudio muito curto"
```

---

## 11. Action Executor

```typescript
// src/core/services/voiceActionExecutor.ts

executeVoiceAction(action: VoiceAction): void {
  switch (action.module) {
    case 'chef':
      useMealsStore.getState().addMeal({...})
      break;
    case 'home':
      useTasksStore.getState().addInstance({...})
      break;
    case 'fin':
      useExpensesStore.getState().addExpense({...})
      break;
  }
}
```

---

## 12. Exemplo Multi-Ação

**Voz:** "Adiciona lavar louça pro Felipe e limpar banheiro pra Elaine amanhã"

**Whisper transcreve:** "adiciona lavar louça pro Felipe e limpar banheiro pra Elaine amanhã"

**GPT-4o-mini retorna:**
```json
{
  "actions": [
    {
      "action": {
        "module": "home",
        "action": "add_task",
        "data": {
          "name": "Lavar louça",
          "category": "limpeza",
          "assignedTo": "felipe",
          "dueDate": "2026-03-19",
          "priority": "normal"
        }
      },
      "displayText": "Adicionar tarefa 'Lavar louça' para Felipe hoje (19/03)"
    },
    {
      "action": {
        "module": "home",
        "action": "add_task",
        "data": {
          "name": "Limpar banheiro",
          "category": "limpeza",
          "assignedTo": "elaine",
          "dueDate": "2026-03-20",
          "priority": "normal"
        }
      },
      "displayText": "Adicionar tarefa 'Limpar banheiro' para Elaine amanhã (20/03)"
    }
  ],
  "agentReply": "Registrei as duas tarefas! Confirma aí pra mim!"
}
```

**Frontend:** 2 ConfirmationCards independentes + botão "Confirmar todos"

---

## 13. Tratamento de Erros

| Cenário | Resposta |
|---------|----------|
| Permissão de microfone negada | Toast: "Permita acesso ao microfone nas configurações" |
| Áudio muito curto (<1KB) | Ignora, não envia para API |
| Whisper retorna vazio | Toast: "Não consegui ouvir, tente novamente" |
| GPT retorna JSON inválido | Retry 1x; se falhar: "Não entendi, tente falar de outra forma" |
| GPT retorna actions: [] | Toast: "Não identifiquei nenhuma ação. Tente ser mais específico" |
| Rede offline | Toast: "Sem conexão, tente novamente" |
| Edge Function timeout | Toast: "Demorou demais, tente novamente" |

---

## 14. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Safari iOS: MediaRecorder limitado | Fallback `audio/mp4` (Whisper aceita ambos) |
| Whisper erra nomes brasileiros | GPT prompt: fuzzy match ("Ilaini" → "elaine") |
| GPT retorna JSON inválido | `response_format: { type: "json_object" }` + try/catch |
| Cold start da Edge Function (~1-2s) | UI "Processando..." cobre a espera |
| Usuário fala de módulo errado | GPT ignora ações fora do módulo do agente ativo |

---

## 15. Ordem de Implementação

### Fase 1 — Foundation
1. Criar `src/core/types/voice.ts` com todos os tipos
2. Criar a Edge Function `voice-process` no Supabase
3. Testar Edge Function com áudio de exemplo via curl

### Fase 2 — Audio Recording
4. Criar `src/core/hooks/useAudioRecorder.ts`
5. Integrar no AgentSheet (substituir toggleRecording dummy)
6. Testar gravação → base64 blob funcional

### Fase 3 — Integração
7. Criar `src/core/services/voiceService.ts`
8. Expandir `voiceAgentStore.ts` com estados de processing/confirmação
9. Wiring completo: gravar → processar → mostrar resultados

### Fase 4 — Confirmation UI
10. Criar `ConfirmationCard.tsx`
11. Atualizar AgentSheet com as 4 fases visuais
12. Criar `voiceActionExecutor.ts`
13. Integrar confirmar/rejeitar → executor → toast

### Fase 5 — Polish
14. "Confirmar todos" para multi-ações
15. Toasts contextuais por tipo de ação
16. Tratamento de todos os cenários de erro
17. Reply do agente com estilo da personalidade

---

## 16. Segurança

- **API keys** ficam apenas na Edge Function (variáveis de ambiente do Supabase)
- Frontend **nunca** acessa OpenAI diretamente
- Áudio é processado em memória na Edge Function e **não é armazenado**
- A Edge Function é chamada via `supabase.functions.invoke()` com auth headers automáticos
