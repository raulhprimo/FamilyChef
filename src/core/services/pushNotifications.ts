import { supabase } from '../../lib/supabase';
import type { MemberId } from '../constants/members';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isPWAInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function getPushPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return Notification.requestPermission();
}

export async function subscribeToPush(memberId: MemberId): Promise<boolean> {
  try {
    if (!isPushSupported() || !VAPID_PUBLIC_KEY) return false;

    const permission = await requestPushPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();

    // If already subscribed, just make sure it's in the DB
    if (existing) {
      await savePushSubscription(memberId, existing);
      return true;
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
    });

    await savePushSubscription(memberId, subscription);
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(memberId: MemberId): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('member_id', memberId)
        .eq('endpoint', endpoint);
    }
  } catch {
    // silent
  }
}

async function savePushSubscription(memberId: MemberId, subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON();
  const endpoint = json.endpoint ?? '';
  const p256dh = json.keys?.p256dh ?? '';
  const auth = json.keys?.auth ?? '';

  await supabase.from('push_subscriptions').upsert(
    {
      member_id: memberId,
      endpoint,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );
}

// Send a push notification to a member via Supabase Edge Function
export async function sendPushToMember(
  toMember: MemberId,
  payload: { title: string; body: string; url?: string; tag?: string },
): Promise<void> {
  await supabase.functions.invoke('send-push', {
    body: { memberId: toMember, ...payload },
  });
}
