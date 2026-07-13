// Server-only helpers for the Groble-based premium unlock flow.
// Payments happen on Groble product pages; Groble notifies us via webhook
// (payment.completed), we record the purchase in Upstash Redis, and the buyer
// claims access on our site with their order number or email.
import crypto from 'crypto';

export const PREMIUM_THEME_IDS = ['career', 'love', 'health', 'yearly', 'family'] as const;

// Stateless HMAC-signed token: base64url(payload).base64url(signature)
// Verified in /api/interpret — payload shape must stay { themes: string[], exp: number }.
export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET!).update(data).digest('base64url');
  return `${data}.${sig}`;
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
