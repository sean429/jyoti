'use client';

import { useState, useEffect } from 'react';

// Groble's return redirect carries no order info, so full auto-unlock is not
// possible. Instead, clicking any buy button stamps jyoti_pending_buy and this
// prompt greets the buyer when they land back, asking only for the phone
// number they just paid with. A ?paid=1 return URL also triggers it.

const STRINGS = {
  ko: {
    title: '💳 결제를 마치셨나요?',
    desc: '결제에 사용하신 전화번호(또는 이메일)를 입력하면 이용권이 바로 충전됩니다.',
    placeholder: '결제하신 전화번호',
    btn: '🔓 이용권 받기',
    busy: '확인 중...',
    later: '나중에 할게요',
    fail: '결제 내역을 찾지 못했습니다. 결제 직후라면 1~2분 뒤 다시 시도해주세요.',
  },
  zh: {
    title: '💳 已完成付款？',
    desc: '输入付款时使用的手机号（或邮箱），使用券立即到账。',
    placeholder: '付款手机号',
    btn: '🔓 领取使用券',
    busy: '验证中...',
    later: '稍后再说',
    fail: '未找到付款记录。如果您刚完成付款，请稍后重试。',
  },
  en: {
    title: '💳 Just finished paying?',
    desc: 'Enter the phone number (or email) you used at checkout and your credits arrive instantly.',
    placeholder: 'Payment phone number',
    btn: '🔓 Claim credits',
    busy: 'Checking...',
    later: 'Maybe later',
    fail: 'No payment found. If you just paid, please try again in a minute.',
  },
};

const PENDING_KEY = 'jyoti_pending_buy';
const PENDING_WINDOW_MS = 30 * 60 * 1000;

export default function PaymentReturnPrompt({ lang, onUnlocked }: {
  lang: 'ko' | 'zh' | 'en';
  onUnlocked: (data: { token: string; themes: string[]; credits?: { std?: number; prem?: number }; exp: number }) => void;
}) {
  const s = STRINGS[lang];
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    try {
      // If the Groble return URL carries an order id (set the redirect to
      // e.g. ...?order={merchantUid} and hope Groble substitutes it), claim it
      // with zero input. An unsubstituted literal like "{merchantUid}" is
      // filtered out and falls through to the manual prompt.
      const qs = new URLSearchParams(location.search);
      const order = ['order', 'merchantUid', 'merchant_uid', 'orderId', 'oid']
        .map(k => qs.get(k))
        .find(v => v && v.length >= 8 && !/[{}]/.test(v));
      if (order) {
        doClaim(order).then(ok => {
          if (ok) history.replaceState(null, '', location.pathname);
          else setVisible(true);
        });
        return;
      }
      const pending = Number(localStorage.getItem(PENDING_KEY) ?? 0);
      if (qs.has('paid') || (pending && Date.now() - pending < PENDING_WINDOW_MS)) setVisible(true);
    } catch {}
  }, []);

  async function doClaim(c: string): Promise<boolean> {
    setBusy(true);
    setErr('');
    let ok = false;
    try {
      const res = await fetch('/api/payment/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c, lang }),
      });
      const data = await res.json();
      if (data.token) {
        try { localStorage.removeItem(PENDING_KEY); } catch {}
        onUnlocked(data);
        setVisible(false);
        ok = true;
      } else setErr(data.error ?? s.fail);
    } catch { setErr(s.fail); }
    setBusy(false);
    return ok;
  }

  function submit() {
    const c = code.trim();
    if (!c || busy) return;
    void doClaim(c);
  }

  function dismiss() {
    try { localStorage.removeItem(PENDING_KEY); } catch {}
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="no-print" style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(4,4,14,0.72)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'rgba(16,13,38,0.97)', borderRadius: '14px',
        border: '1px solid rgba(201,168,76,0.45)', padding: '20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }}>
        <p className="font-cinzel font-bold text-base mb-1.5" style={{ color: 'var(--gold-light)' }}>{s.title}</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
        <input
          autoFocus
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder={s.placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm mb-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--text)' }}
        />
        {err && <p className="text-xs mb-2" style={{ color: '#fca5a5' }}>{err}</p>}
        <div className="flex gap-2">
          <button onClick={submit} disabled={busy || !code.trim()} className="btn-buy flex-1" style={{ justifyContent: 'center' }}>
            {busy ? s.busy : s.btn}
          </button>
          <button onClick={dismiss} className="text-xs font-cinzel px-3 py-2 rounded-lg"
            style={{ color: 'var(--text-muted)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}>
            {s.later}
          </button>
        </div>
      </div>
    </div>
  );
}
