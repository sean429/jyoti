'use client';

import { useState, useEffect } from 'react';
import { ChartData } from '@/lib/vedic-calculations';

interface Theme { name: string; desc: string; d2: number; premiumId?: string; }

interface Props {
  chart: ChartData;
  birthInfo: { name: string; date: string; time: string; place: string };
  theme?: Theme;
  premiumToken?: string;
}

// Staged loading theater — real steps happen server-side in one call, but
// walking through them builds anticipation while Gemini generates.
const LOADING_STAGES = [
  '🔭 正在计算行星位置...',
  '🏠 正在分析宫位布局...',
  '🌙 正在确认大运流转...',
  '📜 正在解读纳克沙特拉...',
  '✍️ 纳尼玛正在书写解读...',
];

export default function AIInterpretationZh({ chart, birthInfo, theme, premiumToken }: Props) {
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [lastThemeId, setLastThemeId] = useState<string>('');
  const [stage, setStage] = useState(0);
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const t = setInterval(() => setStage(s => Math.min(s + 1, LOADING_STAGES.length - 1)), 2400);
    return () => clearInterval(t);
  }, [loading]);

  async function share() {
    const url = `${location.origin}/zh/kundali`;
    const text = '我在 Jyoti 用吠陀占星看了免费综合运势 — 想知道你出生那一刻的星空吗';
    try {
      if (navigator.share) { await navigator.share({ title: 'Jyoti 吠陀占星', text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg('链接已复制！');
      setTimeout(() => setShareMsg(''), 2500);
    } catch {}
  }

  const themeKey = theme ? theme.name + '-' + theme.d2 : 'general';
  // Session cache: switching themes restores past readings for the same chart
  // instead of burning another API call.
  const cacheKey = `jyoti_interp_zh|${birthInfo.name}|${birthInfo.date}|${birthInfo.time}|${birthInfo.place}|${themeKey}`;

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { text, preview } = JSON.parse(cached);
        setInterpretation(text); setIsPreview(!!preview); setGenerated(true); setLastThemeId(themeKey);
        return;
      }
    } catch {}
    if (themeKey !== lastThemeId && generated) { setGenerated(false); setInterpretation(''); }
  }, [cacheKey]);

  async function generate() {
    setLoading(true); setError(''); setInterpretation(''); setLastThemeId(themeKey);
    // Silently retry transient throttles behind the loading animation.
    const RETRY_DELAYS = [1500, 3500];
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch('/api/interpret', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chart, birthInfo, lang: 'zh', theme, premiumToken }),
        });
        const data = await res.json();
        if (res.ok && data.interpretation) {
          setInterpretation(data.interpretation); setIsPreview(!!data.preview); setGenerated(true);
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ text: data.interpretation, preview: !!data.preview })); } catch {}
          break;
        }
        if ((res.status === 429 || res.status >= 500) && attempt < RETRY_DELAYS.length) {
          await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt])); continue;
        }
        setError(data.error ?? '连接失败，请重试。'); break;
      } catch {
        if (attempt < RETRY_DELAYS.length) { await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt])); continue; }
        setError('连接失败，请重试。'); break;
      }
    }
    setLoading(false);
  }

  function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} style={{ color: 'var(--gold-light)' }}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  }

  function formatInterpretation(text: string): React.ReactNode[] {
    const lines2 = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;
    for (const line of lines2) {
      const trimmed = line.trim();
      if (!trimmed) { elements.push(<div key={key++} className='h-3' />); continue; }
      const hMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (hMatch) {
        elements.push(<h2 key={key++} className='font-cinzel font-bold text-base mt-6 mb-2 pb-1'
          style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {hMatch[2].replace(/\*\*/g, '')}
        </h2>); continue;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        elements.push(<h2 key={key++} className='font-cinzel font-bold text-base mt-6 mb-2 pb-1'
          style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {trimmed.slice(2, -2)}
        </h2>); continue;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<p key={key++} className='text-sm leading-relaxed mb-1.5 pl-3' style={{ color: 'var(--text)' }}>
          <span style={{ color: 'var(--gold-light)', marginRight: '6px' }}>·</span>
          {renderInline(trimmed.slice(2))}
        </p>); continue;
      }
      const numBold = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*/);
      if (numBold) {
        elements.push(<h2 key={key++} className='font-cinzel font-bold text-base mt-6 mb-2 pb-1'
          style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          {numBold[1]}
        </h2>); continue;
      }
      elements.push(<p key={key++} className='text-sm leading-relaxed mb-2' style={{ color: 'var(--text)' }}>
        {renderInline(trimmed)}
      </p>);
    }
    return elements;
  }

  const isLockedPremium = !!theme?.premiumId && !premiumToken;
  const themeBtn = isLockedPremium
    ? '✨ ' + theme!.name + ' 免费预览'
    : theme ? '✨ ' + theme.name + ' AI解读' : '✨ AI综合命盘解读';

  return (
    <div>
      {!generated && !loading && (
        <div className='text-center py-6'>
          <div className='mb-4'>
            <div className='text-4xl mb-3'>✨</div>
            {theme ? (
              <>
                <p className='text-sm font-cinzel mb-1' style={{ color: 'var(--gold-light)' }}>{theme.name}</p>
                <p className='text-xs mb-3' style={{ color: 'var(--text-muted)' }}>{theme.desc}</p>
                <p className='text-xs' style={{ color: 'rgba(156,163,175,0.6)' }}>
                  {theme.d2 > 0 ? `结合D1命盘与D${theme.d2}星盘进行分析` : '基于D1命盘进行分析'}
                </p>
                {isLockedPremium && (
                  <p className='text-xs mt-1' style={{ color: '#c4b5fd' }}>
                    可免费预览开篇解读 — 完整报告需付费解锁
                  </p>
                )}
              </>
            ) : (
              <>
                <p className='text-sm mb-1' style={{ color: 'var(--text-muted)' }}>AI将为您解读吠陀命盘</p>
                <p className='text-xs' style={{ color: 'rgba(156,163,175,0.6)' }}>
                  基于性格、命运、大运与Nakshatra进行综合分析
                </p>
              </>
            )}
          </div>
          <button className='btn-gold' onClick={generate}>{themeBtn}</button>
        </div>
      )}
      {loading && (
        <div className='text-center py-8'>
          <div className='relative w-20 h-20 mx-auto mb-4'>
            <svg viewBox='0 0 80 80' className='spin-slow absolute inset-0 w-full h-full'>
              <circle cx='40' cy='40' r='35' fill='none' stroke='rgba(201,168,76,0.3)' strokeWidth='1' strokeDasharray='4 4' />
            </svg>
            <svg viewBox='0 0 80 80' className='spin-reverse absolute inset-0 w-full h-full'>
              <circle cx='40' cy='40' r='25' fill='none' stroke='rgba(107,33,168,0.4)' strokeWidth='1' strokeDasharray='8 4' />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center text-2xl'>🔮</div>
          </div>
          <p className='font-cinzel text-sm' style={{ color: 'var(--gold)' }}>{LOADING_STAGES[stage]}</p>
          <p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>正在解析{birthInfo.name}的宇宙蓝图</p>
          <div className='flex justify-center gap-1.5 mt-3'>
            {LOADING_STAGES.map((_, i) => (
              <div key={i} className='w-1.5 h-1.5 rounded-full transition-all'
                style={{ background: i <= stage ? 'var(--gold)' : 'rgba(201,168,76,0.2)' }} />
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className='p-4 rounded-xl text-sm text-center'
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          <p className='font-semibold mb-1'>无法获取解读</p>
          <p style={{ color: 'rgba(252,165,165,0.7)' }}>{error}</p>
          <button className='mt-3 px-4 py-1.5 rounded text-xs font-cinzel'
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            onClick={generate}>重新尝试</button>
        </div>
      )}
      {interpretation && (
        <div className='print-report'>
          <div className='mb-4 pb-3' style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <p className='text-xs font-cinzel' style={{ color: 'var(--gold-dim)' }}>
              AI吠陀命盘解读 {theme ? '— ' + theme.name : ''}{isPreview ? '（免费预览）' : ''}
            </p>
            <p className='font-cinzel font-bold text-lg' style={{ color: 'var(--gold-light)' }}>{birthInfo.name}</p>
            <p className='text-xs mt-0.5' style={{ color: 'var(--text-muted)' }}>{birthInfo.date} · {birthInfo.place}</p>
          </div>
          <div className='ai-prose'>{formatInterpretation(interpretation)}</div>
          {isPreview && (
            <div className='relative mt-6 no-print' aria-hidden='true'>
              <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
                {[0, 1, 2].map(s => (
                  <div key={s} className='mb-6'>
                    <div className='h-4 mb-3 rounded' style={{ background: 'rgba(201,168,76,0.35)', width: '38%' }} />
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className='h-3 mb-2 rounded'
                        style={{ background: 'rgba(240,235,224,0.16)', width: `${92 - ((s * 5 + i) * 9) % 28}%` }} />
                    ))}
                  </div>
                ))}
              </div>
              <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-6'
                style={{ background: 'linear-gradient(180deg, rgba(8,8,24,0) 0%, rgba(8,8,24,0.9) 45%)' }}>
                <p className='font-cinzel text-sm mb-2' style={{ color: '#e9d5ff' }}>🔒 免费预览到此为止</p>
                <p className='text-xs' style={{ color: 'var(--text-muted)', maxWidth: '380px' }}>
                  完整报告包含天赋、适合领域、时机分析等8个部分的深度解读。请在上方 💎 高级深度解读 中解锁。
                </p>
              </div>
            </div>
          )}
          <div className='mt-6 pt-4 flex justify-center gap-2 no-print' style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={generate} disabled={loading}>🔄 重新解读</button>
            {!isPreview && (
              <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
                style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
                onClick={() => window.print()}>📄 保存为PDF</button>
            )}
            <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={share}>{shareMsg || '🔗 分享'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
