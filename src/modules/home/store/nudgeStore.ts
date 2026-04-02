import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import { getFamilyId } from '../../../core/hooks/useFamilyId';
import { sendPushToMember } from '../../../core/services/pushNotifications';
import { FAMILY_MEMBERS, type MemberId } from '../../../core/constants/members';

export type Nudge = {
  id: string;
  fromMember: MemberId;
  toMember: MemberId;
  taskId: string;
  taskName: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function rowToNudge(row: Record<string, unknown>): Nudge {
  return {
    id: row.id as string,
    fromMember: row.from_member as MemberId,
    toMember: row.to_member as MemberId,
    taskId: row.task_id as string,
    taskName: row.task_name as string,
    message: (row.message as string) ?? '',
    read: row.read as boolean,
    createdAt: row.created_at as string,
  };
}

type NudgeState = {
  nudges: Nudge[];
  loading: boolean;
  fetchNudges: () => Promise<void>;
  sendNudge: (
    fromMember: MemberId,
    toMember: MemberId,
    taskId: string,
    taskName: string,
    message?: string,
  ) => Promise<boolean>;
  markAsRead: (nudgeId: string) => Promise<void>;
  markAllAsRead: (memberId: MemberId) => Promise<void>;
  getNudgesForTask: (taskId: string) => Nudge[];
  getUnreadCount: (memberId: MemberId) => number;
  canSendNudge: (taskId: string, fromMember: MemberId) => boolean;
};

// Rate limit: track last nudge sent per task to prevent spam
const lastNudgeSent: Record<string, number> = {};
const NUDGE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export const useNudgeStore = create<NudgeState>((set, get) => ({
  nudges: [],
  loading: true,

  fetchNudges: async () => {
    const familyId = getFamilyId();
    let query = supabase.from('nudges').select('*');
    if (familyId) query = query.eq('family_id', familyId);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(200);

    if (!error && data) {
      set({ nudges: data.map(rowToNudge), loading: false });
    } else {
      set({ loading: false });
    }
  },

  sendNudge: async (fromMember, toMember, taskId, taskName, message) => {
    // Rate limit check
    const key = `${taskId}-${fromMember}`;
    const lastSent = lastNudgeSent[key] ?? 0;
    if (Date.now() - lastSent < NUDGE_COOLDOWN_MS) return false;

    const senderName = FAMILY_MEMBERS.find((m) => m.id === fromMember)?.name ?? fromMember;
    const defaultMsg = `${senderName} te lembrou: ${taskName}`;
    const finalMsg = message || defaultMsg;

    // Optimistic add
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const nudge: Nudge = {
      id: tempId,
      fromMember,
      toMember,
      taskId,
      taskName,
      message: finalMsg,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ nudges: [nudge, ...s.nudges] }));
    lastNudgeSent[key] = Date.now();

    // Save to DB
    const { data } = await supabase
      .from('nudges')
      .insert({
        family_id: getFamilyId(),
        from_member: fromMember,
        to_member: toMember,
        task_id: taskId,
        task_name: taskName,
        message: finalMsg,
      })
      .select('id')
      .single();

    // Update temp id with real id
    if (data) {
      set((s) => ({
        nudges: s.nudges.map((n) => (n.id === tempId ? { ...n, id: data.id as string } : n)),
      }));
    }

    // Send push notification
    sendPushToMember(toMember, {
      title: 'Lembrete de tarefa',
      body: finalMsg,
      url: '/home-tasks',
      tag: `nudge-${taskId}`,
    });

    return true;
  },

  markAsRead: async (nudgeId) => {
    set((s) => ({
      nudges: s.nudges.map((n) => (n.id === nudgeId ? { ...n, read: true } : n)),
    }));
    await supabase.from('nudges').update({ read: true }).eq('id', nudgeId);
  },

  markAllAsRead: async (memberId) => {
    set((s) => ({
      nudges: s.nudges.map((n) =>
        n.toMember === memberId && !n.read ? { ...n, read: true } : n,
      ),
    }));
    await supabase
      .from('nudges')
      .update({ read: true })
      .eq('to_member', memberId)
      .eq('read', false);
  },

  getNudgesForTask: (taskId) => {
    return get().nudges.filter((n) => n.taskId === taskId);
  },

  getUnreadCount: (memberId) => {
    return get().nudges.filter((n) => n.toMember === memberId && !n.read).length;
  },

  canSendNudge: (taskId, fromMember) => {
    const key = `${taskId}-${fromMember}`;
    const lastSent = lastNudgeSent[key] ?? 0;
    return Date.now() - lastSent >= NUDGE_COOLDOWN_MS;
  },
}));
