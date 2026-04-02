import { useFamilyStore } from '../store/familyStore';
import type { FamilyMember } from '../store/familyStore';

/**
 * Dynamic family members from database.
 * This getter replaces the old hardcoded FAMILY_MEMBERS array.
 * Components should use `useFamilyMembers()` hook when possible,
 * but this getter works for non-React code (stores, utils).
 */
export function getFamilyMembers(): FamilyMember[] {
  return useFamilyStore.getState().members;
}

/**
 * For backward compatibility — components that import FAMILY_MEMBERS
 * now get the dynamic list. Since Zustand state is mutable, accessing
 * `.members` directly always gives the latest value.
 *
 * NOTE: This is a live reference. In React components, prefer the
 * `useFamilyMembers()` hook to get reactive updates.
 */
export const FAMILY_MEMBERS = new Proxy([] as FamilyMember[], {
  get(_, prop) {
    const members = useFamilyStore.getState().members;
    if (prop === Symbol.iterator) return members[Symbol.iterator].bind(members);
    if (prop === 'length') return members.length;
    if (prop === 'map') return members.map.bind(members);
    if (prop === 'filter') return members.filter.bind(members);
    if (prop === 'find') return members.find.bind(members);
    if (prop === 'some') return members.some.bind(members);
    if (prop === 'every') return members.every.bind(members);
    if (prop === 'forEach') return members.forEach.bind(members);
    if (prop === 'reduce') return members.reduce.bind(members);
    if (prop === 'includes') return members.includes.bind(members);
    if (prop === 'indexOf') return members.indexOf.bind(members);
    if (prop === 'flatMap') return members.flatMap.bind(members);
    if (prop === 'slice') return members.slice.bind(members);
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return members[Number(prop)];
    }
    return Reflect.get(members, prop);
  },
});

export type MemberId = string;

/**
 * React hook for reactive family members.
 * Use this in React components for automatic re-render on changes.
 */
export function useFamilyMembers(): FamilyMember[] {
  return useFamilyStore((s) => s.members);
}
