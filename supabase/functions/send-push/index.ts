// Supabase Edge Function: send-push
// Sends a Web Push notification to all subscriptions for a given member.
//
// Deploy: supabase functions deploy send-push
// Secrets needed:
//   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:noreply@4family.app';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Minimal Web Push implementation (no npm:web-push dependency) ──

function base64UrlEncode(data: Uint8Array): string {
  let str = '';
  for (const byte of data) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function importVapidKeys() {
  const privateKeyData = base64UrlDecode(VAPID_PRIVATE_KEY);
  const publicKeyData = base64UrlDecode(VAPID_PUBLIC_KEY);

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  return { privateKey, publicKeyData };
}

async function createVapidJwt(audience: string, privateKey: CryptoKey): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: VAPID_SUBJECT,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const input = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoder.encode(input),
  );

  // Convert DER signature to raw r||s (64 bytes)
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;

  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER format: 0x30 <len> 0x02 <rlen> <r> 0x02 <slen> <s>
    let offset = 2;
    offset += 1; // skip 0x02
    const rLen = sigBytes[offset++];
    const rStart = offset;
    offset += rLen;
    offset += 1; // skip 0x02
    const sLen = sigBytes[offset++];
    const sStart = offset;

    rawSig = new Uint8Array(64);
    const rPad = 32 - rLen;
    if (rPad >= 0) {
      rawSig.set(sigBytes.subarray(rStart, rStart + rLen), rPad);
    } else {
      rawSig.set(sigBytes.subarray(rStart - rPad, rStart - rPad + 32), 0);
    }
    const sPad = 32 - sLen;
    if (sPad >= 0) {
      rawSig.set(sigBytes.subarray(sStart, sStart + sLen), 32 + sPad);
    } else {
      rawSig.set(sigBytes.subarray(sStart - sPad, sStart - sPad + 32), 32);
    }
  }

  return `${input}.${base64UrlEncode(rawSig)}`;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
): Promise<{ success: boolean; status: number }> {
  try {
    const { privateKey, publicKeyData } = await importVapidKeys();
    const endpointUrl = new URL(subscription.endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

    const jwt = await createVapidJwt(audience, privateKey);

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        TTL: '86400',
        Authorization: `vapid t=${jwt}, k=${base64UrlEncode(publicKeyData)}`,
      },
      body: new TextEncoder().encode(payload),
    });

    return { success: response.ok, status: response.status };
  } catch {
    return { success: false, status: 0 };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { memberId, title, body, url, tag } = await req.json();

    if (!memberId || !title) {
      return new Response(JSON.stringify({ error: 'memberId and title required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get all push subscriptions for this member
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('member_id', memberId);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_subscriptions' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({ title, body: body ?? '', url: url ?? '/', tag: tag ?? 'default' });
    let sent = 0;
    const staleEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
      );

      if (result.success) {
        sent++;
      } else if (result.status === 404 || result.status === 410) {
        // Subscription expired or unsubscribed — clean up
        staleEndpoints.push(sub.endpoint);
      }
    }

    // Remove stale subscriptions
    if (staleEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, total: subscriptions.length, cleaned: staleEndpoints.length }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
