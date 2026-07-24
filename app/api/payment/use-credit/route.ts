import { NextRequest, NextResponse } from 'next/server';
import { redis, signToken, verifyToken, recordKey, resolveRecord, Credits, PREMIUM_THEME_IDS } from '@/lib/premium-server';

const YEAR_SECONDS = 31_536_000;

const MESSAGES = {
  noCredit: {
    ko: '남은 이용권이 없습니다. 이용권을 구매하면 원하는 테마를 열 수 있어요.',
    en: 'No credits left. Purchase a credit to unlock a theme of your choice.',
    zh: '没有剩余使用券。购买使用券即可解锁您想要的主题。',
  },
  tokenErr: {
    ko: '이용권 확인이 만료되었습니다. 결제하신 이메일로 다시 열어주세요.',
    en: 'Your session expired. Please re-enter your purchase email.',
    zh: '验证已过期，请重新输入付款邮箱。',
  },
  serverErr: {
    ko: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'Something went wrong. Please try again shortly.',
    zh: '处理时出错，请稍后重试。',
  },
};

function pickLang(lang: unknown): 'ko' | 'en' | 'zh' {
  return lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'ko';
}

// Spends one credit to permanently unlock the requested theme on the buyer's
// purchase record, then re-issues the token with the updated themes/credits.
export async function POST(req: NextRequest) {
  let lk: 'ko' | 'en' | 'zh' = 'ko';
  try {
    const body = await req.json();
    lk = pickLang(body.lang);
    const theme = String(body.theme ?? '');
    // 'question' opens the paid custom-question feature — priced like a
    // premium single, so it spends a prem credit.
    const isPrem = (PREMIUM_THEME_IDS as readonly string[]).includes(theme) || theme === 'question';
    const isStd = /^std([1-9]|1[0-5])$/.test(theme);
    if (!isPrem && !isStd) {
      return NextResponse.json({ error: MESSAGES.serverErr[lk] }, { status: 400 });
    }

    let payload: { code?: string };
    try { payload = verifyToken(String(body.token ?? '')); } catch {
      return NextResponse.json({ error: MESSAGES.tokenErr[lk] }, { status: 403 });
    }
    const code = String(payload.code ?? '').trim().toLowerCase();
    if (!code) {
      return NextResponse.json({ error: MESSAGES.tokenErr[lk] }, { status: 403 });
    }

    // Spend from the wallet the identifier points at, not from a copy of it.
    const found = await resolveRecord(recordKey(code));
    if (!found) {
      return NextResponse.json({ error: MESSAGES.tokenErr[lk] }, { status: 404 });
    }
    const key = found.key;
    const rec = found.rec;
    const themes = Array.isArray(rec.themes) ? rec.themes : [];
    const credits: Credits = { std: rec.credits?.std ?? 0, prem: rec.credits?.prem ?? 0 };

    // Already unlocked (double click, retried request): don't charge again.
    if (!themes.includes(theme)) {
      const kind = isPrem ? 'prem' : 'std';
      if (credits[kind] < 1) {
        return NextResponse.json({ error: MESSAGES.noCredit[lk] }, { status: 400 });
      }
      credits[kind] -= 1;
      themes.push(theme);
      await redis(['SET', key, JSON.stringify({ ...rec, themes, credits }), 'EX', YEAR_SECONDS]);
    }

    const exp = Date.now() + 86_400_000;
    const token = signToken({ themes, credits, code, exp });
    return NextResponse.json({ token, themes, credits, exp });
  } catch (err) {
    console.error('[payment/use-credit] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: MESSAGES.serverErr[lk] }, { status: 500 });
  }
}
