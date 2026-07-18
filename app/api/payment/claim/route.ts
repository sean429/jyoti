import { NextRequest, NextResponse } from 'next/server';
import { redis, signToken, recordKey, Credits } from '@/lib/premium-server';

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

    const raw = await redis(['GET', recordKey(code)]);
    if (typeof raw !== 'string') {
      return NextResponse.json({ error: MESSAGES.notFound[lk] }, { status: 404 });
    }

    const rec = JSON.parse(raw) as { themes?: string[]; credits?: Partial<Credits> };
    const themes = Array.isArray(rec.themes) ? rec.themes : [];
    const credits: Credits = { std: rec.credits?.std ?? 0, prem: rec.credits?.prem ?? 0 };
    if (!themes.length && !credits.std && !credits.prem) {
      return NextResponse.json({ error: MESSAGES.notFound[lk] }, { status: 404 });
    }

    // code goes into the token so /api/payment/use-credit can find this record
    const exp = Date.now() + 86_400_000;
    const token = signToken({ themes, credits, code, exp });
    return NextResponse.json({ token, themes, credits, exp });
  } catch (err) {
    console.error('[payment/claim] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: MESSAGES.serverErr[lk] }, { status: 500 });
  }
}
