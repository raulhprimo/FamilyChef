import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

/* ─── Types ─── */

export type FamilyMember = {
  id: string;        // uuid from DB
  slug: string;      // short id like 'felipe'
  name: string;
  emoji: string;
  color: string;
  role: 'admin' | 'member';
  excludeFin: boolean;
};

export type Family = {
  id: string;
  name: string;
  plan: 'free' | 'family' | 'family_plus';
};

type FamilyState = {
  family: Family | null;
  members: FamilyMember[];
  loading: boolean;

  // Active session
  activeMemberId: string | null;  // family_member uuid
  familyId: string | null;

  // Actions
  setActiveSession: (familyId: string, memberId: string) => void;
  clearSession: () => void;

  // Data fetching
  fetchFamily: (familyId: string) => Promise<void>;
  fetchMembers: (familyId: string) => Promise<void>;

  // Family management
  createFamily: (name: string, password: string) => Promise<string | null>;
  joinFamily: (inviteCode: string) => Promise<string | null>;
  addMember: (data: { name: string; emoji: string; color: string; excludeFin?: boolean }) => Promise<FamilyMember | null>;
  removeMember: (memberId: string) => Promise<void>;
  updateMember: (memberId: string, data: Partial<Pick<FamilyMember, 'name' | 'emoji' | 'color' | 'excludeFin'>>) => Promise<void>;

  // Invite
  createInvite: () => Promise<string | null>;

  // Helpers
  getMember: (id: string) => FamilyMember | undefined;
  getMemberBySlug: (slug: string) => FamilyMember | undefined;
  getFinMembers: () => FamilyMember[];
};

const STORAGE_KEY = '4family_session';

function loadSession(): { familyId: string; memberId: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.familyId && data.memberId) return data;
    return null;
  } catch {
    return null;
  }
}

function saveSession(familyId: string, memberId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ familyId, memberId }));
  // Keep old key for backward compat during migration
  const member = useFamilyStore.getState().members.find((m) => m.id === memberId);
  if (member) {
    localStorage.setItem('4family_active_member', JSON.stringify({ memberId: member.slug, memberName: member.name }));
  }
}

function clearSessionStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('4family_active_member');
}

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function rowToMember(row: Record<string, unknown>): FamilyMember {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    emoji: row.emoji as string,
    color: row.color as string,
    role: row.role as 'admin' | 'member',
    excludeFin: (row.exclude_fin as boolean) ?? false,
  };
}

export const useFamilyStore = create<FamilyState>((set, get) => {
  const saved = loadSession();

  return {
    family: null,
    members: [],
    loading: true,
    activeMemberId: saved?.memberId ?? null,
    familyId: saved?.familyId ?? null,

    setActiveSession: (familyId, memberId) => {
      set({ familyId, activeMemberId: memberId });
      saveSession(familyId, memberId);
    },

    clearSession: () => {
      set({ family: null, members: [], activeMemberId: null, familyId: null });
      clearSessionStorage();
    },

    fetchFamily: async (familyId) => {
      const { data } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (data) {
        set({
          family: {
            id: data.id,
            name: data.name,
            plan: data.plan as Family['plan'],
          },
        });
      }
    },

    fetchMembers: async (familyId) => {
      const { data } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at');

      if (data) {
        set({ members: data.map(rowToMember), loading: false });
      } else {
        set({ loading: false });
      }
    },

    createFamily: async (name, password) => {
      const { data: family, error } = await supabase
        .from('families')
        .insert({ name, password })
        .select()
        .single();

      if (error || !family) return null;

      set({
        family: { id: family.id, name: family.name, plan: 'free' },
        familyId: family.id,
      });

      return family.id;
    },

    joinFamily: async (inviteCode) => {
      const { data: invite } = await supabase
        .from('family_invites')
        .select('*')
        .eq('code', inviteCode.toUpperCase())
        .single();

      if (!invite) return null;

      // Check expiry and usage
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) return null;
      if (invite.max_uses && invite.uses >= invite.max_uses) return null;

      // Increment usage
      await supabase
        .from('family_invites')
        .update({ uses: invite.uses + 1 })
        .eq('id', invite.id);

      return invite.family_id;
    },

    addMember: async (data) => {
      const { familyId } = get();
      if (!familyId) return null;

      const slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

      const { data: row, error } = await supabase
        .from('family_members')
        .insert({
          family_id: familyId,
          slug,
          name: data.name,
          emoji: data.emoji,
          color: data.color,
          exclude_fin: data.excludeFin ?? false,
          role: 'member',
        })
        .select()
        .single();

      if (error || !row) return null;

      const member = rowToMember(row);
      set((s) => ({ members: [...s.members, member] }));
      return member;
    },

    removeMember: async (memberId) => {
      await supabase.from('family_members').delete().eq('id', memberId);
      set((s) => ({ members: s.members.filter((m) => m.id !== memberId) }));
    },

    updateMember: async (memberId, data) => {
      const updates: Record<string, unknown> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.emoji !== undefined) updates.emoji = data.emoji;
      if (data.color !== undefined) updates.color = data.color;
      if (data.excludeFin !== undefined) updates.exclude_fin = data.excludeFin;

      await supabase.from('family_members').update(updates).eq('id', memberId);

      set((s) => ({
        members: s.members.map((m) =>
          m.id === memberId ? { ...m, ...data } : m,
        ),
      }));
    },

    createInvite: async () => {
      const { familyId } = get();
      if (!familyId) return null;

      const code = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('family_invites')
        .insert({
          family_id: familyId,
          code,
          max_uses: 10,
          expires_at: expiresAt.toISOString(),
        });

      if (error) return null;
      return code;
    },

    getMember: (id) => get().members.find((m) => m.id === id),
    getMemberBySlug: (slug) => get().members.find((m) => m.slug === slug),
    getFinMembers: () => get().members.filter((m) => !m.excludeFin),
  };
});
