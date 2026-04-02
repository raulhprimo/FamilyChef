import { useFamilyStore } from '../store/familyStore';

/**
 * Returns the current family ID from the session.
 * Use in React components for reactive updates.
 */
export function useFamilyId(): string | null {
  return useFamilyStore((s) => s.familyId);
}

/**
 * Non-reactive getter for use in stores and non-React code.
 */
export function getFamilyId(): string | null {
  return useFamilyStore.getState().familyId;
}
