import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { redis, PREMIUM_THEME_IDS } from '@/lib/premium-server';

const YEAR_SECONDS = 31_536_000; // purchase records live 1 year in Redis

// Maps Groble option/product names to theme ids (option names are free text
// set in the Groble dashboard, so match by keyword across ko/en/zh).
const THEME_KEYWORDS: [RegExp, string][] = [
  [/직업|재물|커리어|career|职业|财富/i, 'career'],
  [/연애|결혼|사랑|love|marriage|爱情|婚姻/i, 'love'],
  [/건강|health|健康/i, 'health'],
  [/올해|신년|yearly|今年|年运/i, 'yearly'],
  [/자녀|가족|family|children|子女|家庭/i, 'family'],
];

// Groble signs webhooks with HMAC-SHA256 (hex) in x-groble-signature.
// The exact message format is undocumented, so accept either of the two
// standard schemes: `${timestamp}.${body}` (Stripe-style) or the raw body.
function verifySignature(body: string, ts: string | null, sig: string | null): boolean {
  const secret = process.env.GROBLE_WEBHOOK_SECRET;
  if (!secret || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  for (const msg of [`${ts}.${body}`, body]) {
    const expected = crypto.createHmac('sha256', secret).update(msg).digest('hex');
    if (sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return true;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (process.env.GROBLE_WEBHOOK_SECRET) {
    const ok = verifySignature(body, req.headers.get('x-groble-timestamp'), req.headers.get('x-groble-signature'));
    if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  } else if (process.env.GROBLE_WEBHOOK_KEY) {
    // Fallback when no signing secret is available: the webhook URL itself
    // carries a long random key (?key=...) known only to Groble settings.
    const key = new URL(req.url).searchParams.get('key');
    if (key !== process.env.GROBLE_WEBHOOK_KEY) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 });
  }

  let event: any;
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (event?.type !== 'payment.completed') {
    return NextResponse.json({ received: true });
  }

  const o = event.data?.object ?? {};
  const contentId: string = o.content?.id ?? '';
  const optionText: string = [o.content?.title ?? '', ...(Array.isArray(o.options) ? o.options.map((op: any) => op?.name ?? '') : [])].join(' ');
  const amount: number = o.pricing?.finalAmount ?? 0;

  // ALL and TRIO both unlock everything (TRIO costs the same as ALL — it
  // exists as a decoy offer, so granting all themes can never short-change a buyer).
  let themes: string[];
  if (contentId && (contentId === process.env.GROBLE_PRODUCT_ALL || contentId === process.env.GROBLE_PRODUCT_TRIO)) {
    themes = [...PREMIUM_THEME_IDS];
  } else {
    themes = THEME_KEYWORDS.filter(([re]) => re.test(optionText)).map(([, id]) => id);
    if (!themes.length && amount >= 10000) themes = [...PREMIUM_THEME_IDS];
  }
  if (!themes.length) {
    console.error('[groble-webhook] no theme matched:', contentId, optionText);
    return NextResponse.json({ received: true, matched: false });
  }

  try {
    const orderId = String(o.merchantUid ?? '').trim().toLowerCase();
    const email = String(o.buyer?.email ?? '').trim().toLowerCase();
    const at = o.payment?.purchasedAt ?? new Date().toISOString();

    if (orderId) {
      await redis(['SET', `order:${orderId}`, JSON.stringify({ themes, email, at }), 'EX', YEAR_SECONDS]);
    }
    if (email) {
      // Merge with earlier purchases so repeat buyers accumulate themes.
      let merged = themes;
      const prev = await redis(['GET', `email:${email}`]);
      if (typeof prev === 'string') {
        try { merged = [...new Set([...JSON.parse(prev).themes, ...themes])]; } catch {}
      }
      await redis(['SET', `email:${email}`, JSON.stringify({ themes: merged, at }), 'EX', YEAR_SECONDS]);
    }
  } catch (err) {
    console.error('[groble-webhook] store error:', err instanceof Error ? err.message : err);
    // Non-2xx so Groble retries the delivery if it supports retry.
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
