import { create } from 'zustand';

type Toast = {
  id: number;
  message: string;
  leaving: boolean;
};

type ToastState = {
  toasts: Toast[];
  showToast: (message: string) => void;
  dismissToast: (id: number) => void;
};

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, leaving: false }] }));

    // Start leave animation after 2.5s
    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      }));
    }, 2500);

    // Remove after leave animation (0.3s)
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2800);
  },

  dismissToast: (id) => {
    set((s) => ({
      toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 300);
  },
}));
