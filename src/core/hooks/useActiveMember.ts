import { useFamilyStore, type FamilyMember } from '../store/familyStore';

/**
 * Returns the currently active family member, or null if not logged in.
 * Reads from the familyStore (which persists session to localStorage).
 *
 * Backward compat: also checks the old localStorage key for member slug lookup.
 */
export function useActiveMember(): FamilyMember | null {
  const activeMemberId = useFamilyStore((s) => s.activeMemberId);
  const members = useFamilyStore((s) => s.members);

  if (!activeMemberId) {
    // Fallback: try old localStorage format
    try {
      const raw = localStorage.getItem('4family_active_member');
      if (!raw) return null;
      const { memberId } = JSON.parse(raw) as { memberId: string };
      // memberId here is a slug in old format
      return members.find((m) => m.slug === memberId || m.id === memberId) ?? null;
    } catch {
      return null;
    }
  }

  return members.find((m) => m.id === activeMemberId || m.slug === activeMemberId) ?? null;
}
