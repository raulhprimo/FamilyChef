import { create } from 'zustand';
import type { AgentId } from '../components/VoiceButton/constants';
import type { ConfirmationItem, VoiceAction } from '../types/voice';

type VoicePhase = 'idle' | 'recording' | 'processing' | 'confirmation';

type VoiceAgentState = {
  activeAgent: AgentId;
  isSheetOpen: boolean;
  phase: VoicePhase;
  transcript: string | null;
  confirmations: ConfirmationItem[];
  agentReply: string | null;
  error: string | null;
  duration: number;

  setActiveAgent: (id: AgentId) => void;
  openSheet: () => void;
  closeSheet: () => void;
  setPhase: (phase: VoicePhase) => void;
  setDuration: (d: number) => void;
  setResults: (transcript: string, items: ConfirmationItem[], reply?: string) => void;
  confirmAction: (id: string) => void;
  rejectAction: (id: string) => void;
  confirmAll: () => void;
  clearResults: () => void;
  setError: (msg: string) => void;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildConfirmationItems(
  actions: Array<{ action: VoiceAction; displayText: string }>,
): ConfirmationItem[] {
  return actions.map((a) => ({
    id: generateId(),
    action: a.action,
    status: 'pending',
    displayText: a.displayText,
  }));
}

export const useVoiceAgentStore = create<VoiceAgentState>((set) => ({
  activeAgent: 'chef',
  isSheetOpen: false,
  phase: 'idle',
  transcript: null,
  confirmations: [],
  agentReply: null,
  error: null,
  duration: 0,

  setActiveAgent: (id) => set({ activeAgent: id }),
  openSheet: () => set({ isSheetOpen: true, phase: 'idle', error: null }),
  closeSheet: () =>
    set({
      isSheetOpen: false,
      phase: 'idle',
      transcript: null,
      confirmations: [],
      agentReply: null,
      error: null,
      duration: 0,
    }),
  setPhase: (phase) => set({ phase, error: null }),
  setDuration: (duration) => set({ duration }),
  setResults: (transcript, confirmations, agentReply) =>
    set({ transcript, confirmations, agentReply, phase: 'confirmation' }),
  confirmAction: (id) =>
    set((s) => ({
      confirmations: s.confirmations.map((c) =>
        c.id === id ? { ...c, status: 'confirmed' } : c,
      ),
    })),
  rejectAction: (id) =>
    set((s) => ({
      confirmations: s.confirmations.map((c) =>
        c.id === id ? { ...c, status: 'rejected' } : c,
      ),
    })),
  confirmAll: () =>
    set((s) => ({
      confirmations: s.confirmations.map((c) =>
        c.status === 'pending' ? { ...c, status: 'confirmed' } : c,
      ),
    })),
  clearResults: () =>
    set({ phase: 'idle', transcript: null, confirmations: [], agentReply: null, error: null }),
  setError: (error) => set({ error, phase: 'idle' }),
}));
