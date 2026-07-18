import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { redis, PREMIUM_THEME_IDS, Credits } from '@/lib/premium-server';

const YEAR_SECONDS = 31_536_000; // purchase records live 1 year in Redis

// Maps Groble option/answer text to theme ids. Exact theme names (ko/zh) are
// checked first — they are what buyers pick in product options — and the
// looser premium keyword regexes only run when no exact name matched.
const STD_THEME_NAMES: [string[], string][] = [
  [['운명의 기본값', '命运基础'], 'std1'],
  [['배우자 인연', '伴侣缘分'], 'std2'],
  [['자녀와 창조성', '子女创造力'], 'std3'],
  [['돈의 그릇', '财富格局'], 'std4'],
  [['사업의 판', '事业舞台'], 'std5'],
  [['직업의 궤도', '职业轨道'], 'std6'],
  [['집과 뿌리', '家园根基'], 'std7'],
  [['부모와 가문', '父母家族'], 'std8'],
  [['이동과 소유', '出行财物'], 'std9'],
  [['공부와 전문성', '学业专长'], 'std10'],
  [['영적 방향', '灵性方向'], 'std11'],
  [['타고난 무기', '天赋才能'], 'std12'],
  [['반복되는 문제', '业力课题'], 'std13'],
  [['모계 흐름', '母系传承'], 'std14'],
  [['부계 흐름', '父系传承'], 'std15'],
];

const ALL_STD_IDS = STD_THEME_NAMES.map(([, id]) => id);

const PREMIUM_KEYWORDS: [RegExp, string][] = [
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
  // Buyer-visible text: product title + option names + question answers
  // (the 5-theme std bundle collects picks via a product question).
  const optionText: string = [
    o.content?.title ?? '',
    ...(Array.isArray(o.options) ? o.options.map((op: any) => op?.name ?? '') : []),
    ...(Array.isArray(o.questionAnswers) ? o.questionAnswers.map((qa: any) => `${qa?.question ?? ''} ${qa?.answer ?? ''}`) : []),
  ].join(' ');
  const amount: number = o.pricing?.finalAmount ?? 0;

  let themes: string[] = [];
  const credits: Credits = { std: 0, prem: 0 };
  if (contentId && (contentId === process.env.GROBLE_PRODUCT_ALL || contentId === process.env.GROBLE_PRODUCT_TRIO)) {
    themes = [...PREMIUM_THEME_IDS];
  } else {
    // 1) exact std theme names picked in options/answers. Compared with all
    //    whitespace stripped: picks arrive as free-text question answers, so
    //    '돈의그릇' (missing space) must still match '돈의 그릇'.
    const flatText = optionText.replace(/\s+/g, '');
    themes = STD_THEME_NAMES.filter(([names]) => names.some(n => flatText.includes(n.replace(/\s+/g, '')))).map(([, id]) => id);
    // 2) premium deep-dive keywords (only when nothing std matched, to avoid
    //    e.g. '돈의 그릇' accidentally granting the premium career theme)
    if (!themes.length) {
      themes = PREMIUM_KEYWORDS.filter(([re]) => re.test(optionText)).map(([, id]) => id);
    }
    // 3) product-name tokens
    if (!themes.length) {
      if (/통합|PDF|전체.*이용권|完整报告/i.test(optionText)) themes = [...PREMIUM_THEME_IDS];
      else if (/15개|15项/.test(optionText)) themes = [...ALL_STD_IDS];
    }
    // 4) amount tiers. All-pass amounts grant themes outright; the smaller
    //    products grant credits the buyer spends on themes of their choice on
    //    the site — Groble products need no options or question fields.
    //    14,900 = premium 5 (PDF report) · 12,900 = all 15 std
    //    9,900+ = premium 5 (pre-raise price + 10,000 trio decoy)
    //    4,900+ = 5 std credits · 3,500+ = 1 prem credit · 1,900+ = 1 std credit
    if (!themes.length) {
      if (amount >= 14900) themes = [...PREMIUM_THEME_IDS];
      else if (amount >= 12900) themes = [...ALL_STD_IDS];
      else if (amount >= 9900) themes = [...PREMIUM_THEME_IDS];
      else if (amount >= 4900) credits.std = 5;
      else if (amount >= 3500) credits.prem = 1;
      else if (amount >= 1900) credits.std = 1;
    }
  }
  if (!themes.length && !credits.std && !credits.prem) {
    console.error('[groble-webhook] no theme matched:', contentId, optionText);
    return NextResponse.json({ received: true, matched: false });
  }

  try {
    const orderId = String(o.merchantUid ?? '').trim().toLowerCase();
    const email = String(o.buyer?.email ?? '').trim().toLowerCase();
    const phone = String(o.buyer?.phoneNumber ?? '').replace(/[^0-9]/g, '');
    const at = o.payment?.purchasedAt ?? new Date().toISOString();

    // Observability for real-payment testing — identifies the payload shape
    // without logging full PII.
    console.log('[groble-webhook] payment:', JSON.stringify({
      uid: orderId, amount, title: o.content?.title ?? '',
      hasEmail: !!email, phoneTail: phone.slice(-4), themes, credits,
    }));

    if (orderId) {
      await redis(['SET', `order:${orderId}`, JSON.stringify({ themes, credits, email, at }), 'EX', YEAR_SECONDS]);
    }
    // Merge with earlier purchases on identity keys so repeat buyers accumulate
    // themes and credits. Phone is stored because Groble checkout always
    // collects it, while email exists only for Groble members.
    const mergeInto = async (key: string) => {
      let mergedThemes = themes;
      const mergedCredits: Credits = { ...credits };
      const prev = await redis(['GET', key]);
      if (typeof prev === 'string') {
        try {
          const p = JSON.parse(prev);
          mergedThemes = [...new Set([...(Array.isArray(p.themes) ? p.themes : []), ...themes])];
          mergedCredits.std += p.credits?.std ?? 0;
          mergedCredits.prem += p.credits?.prem ?? 0;
        } catch {}
      }
      await redis(['SET', key, JSON.stringify({ themes: mergedThemes, credits: mergedCredits, at }), 'EX', YEAR_SECONDS]);
    };
    if (email) await mergeInto(`email:${email}`);
    if (/^01[016789][0-9]{7,8}$/.test(phone)) await mergeInto(`phone:${phone}`);
  } catch (err) {
    console.error('[groble-webhook] store error:', err instanceof Error ? err.message : err);
    // Non-2xx so Groble retries the delivery if it supports retry.
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
