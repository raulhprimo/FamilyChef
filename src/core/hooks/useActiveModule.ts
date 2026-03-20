import { useSyncExternalStore } from 'react';
import type { ModuleId } from '../constants/modules';

const STORAGE_KEY = '4family_active_module';

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function setActiveModule(moduleId: ModuleId) {
  localStorage.setItem(STORAGE_KEY, moduleId);
}

export function useActiveModule(): ModuleId | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  if (!raw) return null;
  return raw as ModuleId;
}
