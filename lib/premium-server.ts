// Server-only helpers for the Groble-based premium unlock flow.
// Payments happen on Groble product pages; Groble notifies us via webhook
// (payment.completed), we record the purchase in Upstash Redis, and the buyer
// claims access on our site with their order number or email.
import crypto from 'crypto';

export const PREMIUM_THEME_IDS = ['career', 'love', 'health', 'yearly', 'family'] as const;

// Purchases can grant themes directly (named options, amount tiers) or
// credits the buyer spends on themes of their choice via /api/payment/use-credit.
// std credits open the 15 divisional themes, prem credits the 5 deep-dive ones.
export type Credits = { std: number; prem: number };

// Claim codes can be an email, the phone number used at Groble checkout
// (always collected there, unlike email), or an order number. All three are
// written by the webhook; this maps a code to its Redis key.
export function recordKey(code: string): string {
  if (code.includes('@')) return `email:${code}`;
  const digits = code.replace(/[^0-9]/g, '');
  if (/^01[016789][0-9]{7,8}$/.test(digits)) return `phone:${digits}`;
  return `order:${code}`;
}

// Stateless HMAC-signed token: base64url(payload).base64url(signature)
// Verified in /api/interpret — payload shape must stay { themes: string[], exp: number };
// extra fields (credits, code) are ignored there and used by /api/payment/use-credit.
export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET!).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): { themes: string[]; credits?: Credits; code?: string; exp: number } {
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx < 0) throw new Error('malformed');
  const data = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET!).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig, 'base64url');
  const expBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) throw new Error('invalid');
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
  if (typeof payload.exp !== 'number' || payload.exp < Date.now()) throw new Error('expired');
  return payload;
}

// Upstash Redis over REST — one command per call, e.g. redis(['GET', 'order:x']).
// Vercel's Upstash integration names the vars KV_REST_API_*; standalone Upstash
// uses UPSTASH_REDIS_REST_* — accept either.
export async function redis(cmd: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Redis is not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis request failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}
