import { NextRequest, NextResponse } from 'next/server';
import { redis, signToken, recordKey, refCode, normalizeRef, Credits, PREMIUM_THEME_IDS, LOVE_THEME_IDS } from '@/lib/premium-server';

const YEAR_SECONDS = 31_536_000;
// Caps what one referrer can earn, so a shared code can't drain us.
const REFERRAL_REWARD_CAP = 10;

type ReferralResult = 'applied' | 'invalid' | 'self' | 'used';

const MESSAGES = {
  notFound: {
    ko: '결제 내역을 찾지 못했습니다. 결제 직후라면 1~2분 뒤 다시 시도해주세요.',
    en: 'No payment found. If you just paid, please try again in a minute or two.',
    zh: '未找到付款记录。如果您刚完成付款，请等待1~2分钟后重试。',
  },
  serverErr: {
    ko: '확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'Something went wrong. Please try again shortly.',
    zh: '验证时出错，请稍后重试。',
  },
};

function pickLang(lang: unknown): 'ko' | 'en' | 'zh' {
  return lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'ko';
}

// Redeems a friend's referral code, giving one std credit to each side. Only a
// buyer with a real purchase record gets here, so every payout follows a sale.
// `credits` and `rec` are the claimer's, mutated in place when the code applies.
async function applyReferral(
  ref: string,
  key: string,
  rec: Record<string, unknown>,
  credits: Credits,
): Promise<ReferralResult> {
  const refKey = await redis(['GET', `ref:${ref}`]);
  if (typeof refKey !== 'string') return 'invalid';
  if (refKey === key) return 'self';
  // NX: one redemption per buyer, and a retried request can't pay out twice.
  const first = await redis(['SET', `refused:${key}`, refKey, 'NX', 'EX', YEAR_SECONDS]);
  if (first === null) return 'used';

  const rawRef = await redis(['GET', refKey]);
  if (typeof rawRef === 'string') {
    const count = Number(await redis(['INCR', `refcnt:${refKey}`]));
    await redis(['EXPIRE', `refcnt:${refKey}`, YEAR_SECONDS]);
    if (count <= REFERRAL_REWARD_CAP) {
      const r = JSON.parse(rawRef) as { credits?: Partial<Credits> };
      const rc: Credits = { std: (r.credits?.std ?? 0) + 1, prem: r.credits?.prem ?? 0 };
      await redis(['SET', refKey, JSON.stringify({ ...r, credits: rc }), 'EX', YEAR_SECONDS]);
    }
  }

  credits.std += 1;
  await redis(['SET', key, JSON.stringify({ ...rec, credits }), 'EX', YEAR_SECONDS]);
  return 'applied';
}

// Exchanges a Groble order number or buyer email for a 24h premium token.
export async function POST(req: NextRequest) {
  let lk: 'ko' | 'en' | 'zh' = 'ko';
  try {
    const body = await req.json();
    lk = pickLang(body.lang);
    const code = String(body.code ?? '').trim().toLowerCase();
    if (!code || code.length > 200) {
      return NextResponse.json({ error: MESSAGES.notFound[lk] }, { status: 400 });
    }

    // Master/tester code (env MASTER_CODE): refreshes a record with every
    // theme unlocked plus 999/999 credits — for debugging and marketing
    // demos, never runs dry, rotatable by changing the env var.
    const key = recordKey(code);
    const isMaster = !!process.env.MASTER_CODE && code === process.env.MASTER_CODE.trim().toLowerCase();
    if (isMaster) {
      await redis(['SET', key, JSON.stringify({
        themes: [...PREMIUM_THEME_IDS, ...LOVE_THEME_IDS, 'question', ...Array.from({ length: 15 }, (_, i) => 'std' + (i + 1))],
        credits: { std: 999, prem: 999 },
        at: new Date().toISOString(),
      }), 'EX', YEAR_SECONDS]);
    }

    const raw = await redis(['GET', key]);
    if (typeof raw !== 'string') {
      return NextResponse.json({ error: MESSAGES.notFound[lk] }, { status: 404 });
    }

    const rec = JSON.parse(raw) as { themes?: string[]; credits?: Partial<Credits>; [k: string]: unknown };
    const themes = Array.isArray(rec.themes) ? rec.themes : [];
    const credits: Credits = { std: rec.credits?.std ?? 0, prem: rec.credits?.prem ?? 0 };
    if (!themes.length && !credits.std && !credits.prem) {
      return NextResponse.json({ error: MESSAGES.notFound[lk] }, { status: 404 });
    }

    // A friend's code, if the visitor arrived through one. Never blocks the
    // claim: a bad code just comes back as a status the UI explains.
    const ref = normalizeRef(String(body.ref ?? ''));
    let referral: ReferralResult | null = null;
    if (ref && !isMaster) {
      try { referral = await applyReferral(ref, key, rec, credits); }
      catch (e) { console.error('[payment/claim] referral:', e instanceof Error ? e.message : e); }
    }

    // The buyer's own code to share, indexed so friends can redeem it.
    const myRef = refCode(key);
    await redis(['SET', `ref:${myRef}`, key, 'EX', YEAR_SECONDS]);

    // code goes into the token so /api/payment/use-credit can find this record
    const exp = Date.now() + 86_400_000;
    const token = signToken({ themes, credits, code, exp });
    return NextResponse.json({ token, themes, credits, exp, ref: myRef, referral });
  } catch (err) {
    console.error('[payment/claim] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: MESSAGES.serverErr[lk] }, { status: 500 });
  }
}
