'use client';

import { useState, useEffect } from 'react';

// Honest social proof: shows real counts from /api/stats (incremented per
// generated reading). Hides itself while the numbers are still too small to
// impress — no fabricated figures.

const STRINGS = {
  ko: {
    today: (n: number) => `🔭 오늘 ${n.toLocaleString()}명이 별을 읽었어요`,
    total: (n: number) => `🔭 지금까지 ${n.toLocaleString()}번의 별 읽기가 있었어요`,
  },
  zh: {
    today: (n: number) => `🔭 今天已有 ${n.toLocaleString()} 人读了自己的星盘`,
    total: (n: number) => `🔭 累计已有 ${n.toLocaleString()} 次星盘解读`,
  },
  en: {
    today: (n: number) => `🔭 ${n.toLocaleString()} people read their stars today`,
    total: (n: number) => `🔭 ${n.toLocaleString()} readings and counting`,
  },
};

export default function LiveCounter({ lang }: { lang: 'ko' | 'zh' | 'en' }) {
  const [line, setLine] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/api/stats')
      .then(r => r.json())
      .then(({ today, total }) => {
        if (!alive) return;
        const s = STRINGS[lang];
        if (today >= 5) setLine(s.today(today));
        else if (total >= 50) setLine(s.total(total));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [lang]);

  if (!line) return null;
  return (
    <p className="text-xs mb-3 no-print" style={{ color: 'rgba(201,168,76,0.75)' }}>
      {line}
    </p>
  );
}
