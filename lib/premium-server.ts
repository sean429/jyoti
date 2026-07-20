// Server-only helpers for the Groble-based premium unlock flow.
// Payments happen on Groble product pages; Groble notifies us via webhook
// (payment.completed), we record the purchase in Upstash Redis, and the buyer
// claims access on our site with their order number or email.
import crypto from 'crypto';

export const PREMIUM_THEME_IDS = ['career', 'love', 'health', 'yearly', 'family'] as const;

// Chapters of the love-focused PDF report, sold as one product.
export const LOVE_THEME_IDS = ['love1', 'love2', 'love3', 'love4', 'love5'] as const;

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

// One purchase writes three identity keys (order number, email, phone). Only
// one of them holds the wallet; the others store { alias } pointing at it, so
// the same credits are seen and spent no matter which one the buyer types.
export type Record_ = { themes?: string[]; credits?: Partial<Credits>; [k: string]: unknown };

export async function resolveRecord(key: string): Promise<{ key: string; rec: Record_ } | null> {
  const raw = await redis(['GET', key]);
  if (typeof raw !== 'string') return null;
  let rec: Record_;
  try { rec = JSON.parse(raw) as Record_; } catch { return null; }
  if (typeof rec.alias !== 'string') return { key, rec };
  // Pointers are only ever written one hop deep.
  const target = await redis(['GET', rec.alias]);
  if (typeof target !== 'string') return null;
  try { return { key: rec.alias, rec: JSON.parse(target) as Record_ }; } catch { return null; }
}

// Referral codes are derived from the buyer's record key, so nothing has to be
// generated or stored up front — only the reverse index ref:{CODE} -> recordKey,
// written when the buyer claims. Lookalike characters (0/O, 1/I) are left out.
const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const REF_LENGTH = 6;

export function refCode(key: string): string {
  const h = crypto.createHmac('sha256', process.env.JWT_SECRET!).update(`ref:${key}`).digest();
  let out = '';
  for (let i = 0; i < REF_LENGTH; i++) out += REF_ALPHABET[h[i] % REF_ALPHABET.length];
  return out;
}

// Accepts what people actually paste: 'jyoti-3f9k', ' 3F9K ', with or without prefix.
export function normalizeRef(input: string): string {
  const s = input.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^JYOTI/, '');
  return s.length === REF_LENGTH ? s : '';
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
