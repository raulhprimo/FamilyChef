import { useSyncExternalStore } from 'react';
import { FAMILY_MEMBERS } from '../constants/members';

const STORAGE_KEY = 'familychef_active_member';

type ActiveMember = typeof FAMILY_MEMBERS[number] | null;

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useActiveMember(): ActiveMember {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  if (!raw) return null;
  try {
    const { memberId } = JSON.parse(raw) as { memberId: string };
    return FAMILY_MEMBERS.find((m) => m.id === memberId) ?? null;
  } catch {
    return null;
  }
}
