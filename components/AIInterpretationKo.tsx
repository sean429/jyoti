'use client';

import { useState, useEffect } from 'react';
import { ChartData } from '@/lib/vedic-calculations';

interface Theme { name: string; desc: string; d2: number; premiumId?: string; }

interface Props {
  chart: ChartData;
  birthInfo: { name: string; date: string; time: string; place: string; gender?: string };
  theme?: Theme;
  premiumToken?: string;
  persona?: string;
  personaName?: string;
}

// Staged loading theater — real steps happen server-side in one call, but
// walking through them builds anticipation while Gemini generates.
const LOADING_STAGES = [
  '🔭 행성 위치를 계산하는 중...',
  '🏠 하우스 배치를 분석하는 중...',
  '🌙 다샤의 흐름을 확인하는 중...',
  '📜 나크샤트라를 읽는 중...',
  '✍️ 타라가 별을 읽는 중...',
];

export default function AIInterpretationKo({ chart, birthInfo, theme, premiumToken, persona = 'tara', personaName = '타라' }: Props) {
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [lastThemeId, setLastThemeId] = useState<string>('');
  const [stage, setStage] = useState(0);
  const [shareMsg, setShareMsg] = useState('');
  // Real daily read count (from /api/stats) shown while generating — honest
  // social proof, hidden until the day has a few reads so it never looks sad.
  const [todayCount, setTodayCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const t = setInterval(() => setStage(s => Math.min(s + 1, LOADING_STAGES.length - 1)), 2400);
    return () => clearInterval(t);
  }, [loading]);

  async function share() {
    const url = `${location.origin}/ko/kundali`;
    const text = 'Jyoti에서 베딕 점성술로 무료 종합 운세를 봤어요 — 태어난 순간의 하늘이 궁금하다면';
    try {
      if (navigator.share) { await navigator.share({ title: 'Jyoti 베딕 운세', text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg('링크를 복사했어요!');
      setTimeout(() => setShareMsg(''), 2500);
    } catch {}
  }

  const themeKey = theme ? theme.name + '-' + theme.d2 : 'general';
  // Session cache: switching themes (or tabs) restores past readings for the
  // same chart instead of burning another API call. Cleared naturally when the
  // birth data changes (key includes it) or the browser session ends.
  const cacheKey = `jyoti_interp_ko|${birthInfo.name}|${birthInfo.date}|${birthInfo.time}|${birthInfo.place}|${birthInfo.gender ?? ''}|${persona}|${themeKey}`;

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
    void fetch('/api/stats').then(r => r.json()).then(d => setTodayCount(typeof d.today === 'number' ? d.today : null)).catch(() => {});
    // Silently retry transient throttles (429/5xx/network) behind the loading
    // animation so a busy free-tier moment never surfaces as an error.
    const RETRY_DELAYS = [1500, 3500];
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch('/api/interpret', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chart, birthInfo, lang: 'ko', theme, premiumToken, persona }),
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
        setError(data.error ?? 'AI 해석 요청에 실패했습니다. 다시 시도해주세요.'); break;
      } catch {
        if (attempt < RETRY_DELAYS.length) { await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt])); continue; }
        setError('AI 해석 요청에 실패했습니다. 다시 시도해주세요.'); break;
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
    ? '✨ ' + theme!.name + ' 무료 미리보기'
    : theme ? '✨ ' + theme.name + ' AI 해석 받기' : '✨ AI 종합 운세 해석 받기';

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
                  {theme.d2 > 0 ? `D1 라시 차트와 D${theme.d2} 차트를 결합 분석합니다` : 'D1 라시 차트를 기반으로 분석합니다'}
                </p>
                {isLockedPremium && (
                  <p className='text-xs mt-1' style={{ color: '#c4b5fd' }}>
                    무료로 첫인상 섹션을 미리 볼 수 있어요 — 전체 보고서는 결제 후 열립니다
                  </p>
                )}
              </>
            ) : (
              <>
                <p className='text-sm mb-1' style={{ color: 'var(--text-muted)' }}>AI가 베딕 차트를 해석합니다</p>
                <p className='text-xs' style={{ color: 'rgba(156,163,175,0.6)' }}>
                  성격, 운명, 대운, 나크샤트라 기반으로 분석합니다
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
          <p className='font-cinzel text-sm' style={{ color: 'var(--gold)' }}>{stage === LOADING_STAGES.length - 1 ? `✍️ ${personaName}가 별을 읽는 중...` : LOADING_STAGES[stage]}</p>
          <p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>{birthInfo.name}님의 우주적 청사진을 풀어냅니다</p>
          {todayCount !== null && todayCount >= 3 && (
            <p className='text-xs mt-1.5' style={{ color: 'var(--gold-dim)' }}>✨ 오늘 {todayCount + 1}번째 별을 읽고 있어요</p>
          )}
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
          <p className='font-semibold mb-1'>해석을 불러올 수 없습니다</p>
          <p style={{ color: 'rgba(252,165,165,0.7)' }}>{error}</p>
          <button className='mt-3 px-4 py-1.5 rounded text-xs font-cinzel'
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            onClick={generate}>다시 시도</button>
        </div>
      )}
      {interpretation && (
        <div className='print-report'>
          <div className='mb-4 pb-3' style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <p className='text-xs font-cinzel' style={{ color: 'var(--gold-dim)' }}>
              AI 베딕 운세 해석 {theme ? '— ' + theme.name : ''}{isPreview ? ' (무료 미리보기)' : ''}
            </p>
            <p className='font-cinzel font-bold text-lg' style={{ color: 'var(--gold-light)' }}>{birthInfo.name}님</p>
            <p className='text-xs mt-0.5' style={{ color: 'var(--text-muted)' }}>{birthInfo.date} · {birthInfo.place}</p>
          </div>
          {(() => {
            // Free general reading for a non-paying visitor: show the first
            // paragraphs clear, then blur the real tail (this-period flow +
            // advice) as the upsell hook. Premium/master token → full, unblurred.
            const blurTail = !theme && !premiumToken;
            if (!blurTail) return <div className='ai-prose'>{formatInterpretation(interpretation)}</div>;
            const paras = interpretation.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
            const clearN = Math.min(paras.length - 1, Math.max(3, Math.ceil(paras.length * 0.55)));
            const clear = paras.slice(0, clearN).join('\n\n');
            const rest = paras.slice(clearN).join('\n\n');
            return (
              <>
                <div className='ai-prose'>{formatInterpretation(clear)}</div>
                {rest && (
                  <div className='relative mt-3 no-print'>
                    <p className='text-center text-[11px] font-cinzel mb-3' style={{ color: 'var(--gold-dim)', letterSpacing: '0.1em' }}>─── 여기까지 무료 ───</p>
                    <div className='ai-prose' aria-hidden='true' style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none', maxHeight: '260px', overflow: 'hidden' }}>
                      {formatInterpretation(rest)}
                    </div>
                    <div className='absolute inset-0 flex flex-col items-center justify-end text-center px-5 pb-3'
                      style={{ background: 'linear-gradient(180deg, rgba(8,8,24,0) 0%, rgba(8,8,24,0.88) 46%)' }}>
                      <p className='font-cinzel text-sm mb-1.5' style={{ color: '#e9d5ff' }}>🔮 여기서부터가 진짜야</p>
                      <p className='text-xs mb-4' style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
                        올해의 흐름과 <b style={{ color: '#e9d5ff' }}>결정적 시기</b>, {personaName} 언니의 <b style={{ color: '#e9d5ff' }}>구체적인 조언</b>은 프리미엄 심층 해석에서 전부 열려요.
                      </p>
                      <button
                        onClick={() => document.getElementById('jyoti-premium')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        className='px-5 py-2.5 rounded-lg text-sm font-cinzel font-bold'
                        style={{ background: 'linear-gradient(135deg, #a855f7, #6b21a8)', color: '#fff', boxShadow: '0 4px 18px rgba(107,33,168,0.5)' }}>
                        🔓 프리미엄으로 전체 보기
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
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
                <p className='font-cinzel text-sm mb-2' style={{ color: '#e9d5ff' }}>🔒 여기까지는 무료 미리보기입니다</p>
                <p className='text-xs' style={{ color: 'var(--text-muted)', maxWidth: '380px' }}>
                  전체 보고서에는 재능·어울리는 분야·시기 분석 등 8개 섹션의 심층 해석이 담깁니다.
                  위의 💎 프리미엄 심층 해석에서 잠금 해제하세요.
                </p>
              </div>
            </div>
          )}
          <div className='mt-6 pt-4 flex justify-center gap-2 no-print' style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={generate} disabled={loading}>🔄 다시 해석받기</button>
            {!isPreview && (
              <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
                style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
                onClick={() => window.print()}>📄 PDF로 저장</button>
            )}
            <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={share}>{shareMsg || '🔗 공유하기'}</button>
          </div>
        </div>
      )}
    </div>
  );
}