'use client';

import { useState, useEffect } from 'react';

// Shown only to non-Chrome visitors (in-app browsers, Safari, etc.) — the
// print-to-PDF report flow is most reliable in Chrome. Dismissible per session.

const STRINGS = {
  ko: '💡 이 사이트는 크롬(Chrome) 브라우저에서 가장 잘 보여요 — PDF 저장도 크롬에서 안정적으로 동작합니다',
  zh: '💡 本站在 Chrome 浏览器中显示效果最佳 — PDF 保存功能在 Chrome 中最稳定',
  en: '💡 This site works best in Chrome — saving reports as PDF is most reliable there',
};

export default function BrowserHint({ lang }: { lang: 'ko' | 'zh' | 'en' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('jyoti_browser_hint_dismissed')) return;
      const ua = navigator.userAgent;
      const isRealChrome = /Chrome\/\d/.test(ua)
        && !/Edg|OPR|Whale|SamsungBrowser|KAKAOTALK|NAVER|Line\/|FBAV|Instagram|wv\)/i.test(ua);
      if (!isRealChrome) setVisible(true);
    } catch {}
  }, []);

  function dismiss() {
    try { sessionStorage.setItem('jyoti_browser_hint_dismissed', '1'); } catch {}
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="no-print" style={{
      position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 55,
      maxWidth: 'min(92vw, 560px)', display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(16,13,38,0.95)', border: '1px solid rgba(201,168,76,0.4)',
      borderRadius: '10px', padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
    }}>
      <p className="text-xs" style={{ color: 'var(--gold-dim)', lineHeight: 1.4 }}>{STRINGS[lang]}</p>
      <button onClick={dismiss} aria-label="close"
        style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>
        ✕
      </button>
    </div>
  );
}
