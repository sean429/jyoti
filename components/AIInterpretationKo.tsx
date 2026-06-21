'use client';

import { useState, useEffect } from 'react';
import { ChartData } from '@/lib/vedic-calculations';

interface Theme { name: string; desc: string; d2: number; }

interface Props {
  chart: ChartData;
  birthInfo: { name: string; date: string; time: string; place: string };
  theme?: Theme;
}

export default function AIInterpretationKo({ chart, birthInfo, theme }: Props) {
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [lastThemeId, setLastThemeId] = useState<string>('');

  const themeKey = theme ? theme.name + '-' + theme.d2 : 'general';
  useEffect(() => {
    if (themeKey !== lastThemeId && generated) { setGenerated(false); setInterpretation(''); }
  }, [themeKey]);

  async function generate() {
    setLoading(true); setError(''); setInterpretation(''); setLastThemeId(themeKey);
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, birthInfo, lang: 'ko', theme }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setInterpretation(data.interpretation); setGenerated(true); }
    } catch { setError('AI 해석 요청에 실패했습니다. 다시 시도해주세요.'); }
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

  const themeBtn = theme ? '✨ ' + theme.name + ' AI 해석 받기' : '✨ AI 종합 운세 해석 받기';

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
                  D1 라시 차트와 D{theme.d2} 차트를 결합 분석합니다
                </p>
              </>
            ) : (
              <>
                <p className='text-sm mb-1' style={{ color: 'var(--text-muted)' }}>Gemini AI가 베딕 차트를 해석합니다</p>
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
          <p className='font-cinzel text-sm' style={{ color: 'var(--gold)' }}>별자리의 언어를 해석하는 중...</p>
          <p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>{birthInfo.name}님의 우주적 청사진을 풀어냅니다</p>
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
        <div>
          <div className='mb-4 pb-3' style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <p className='text-xs font-cinzel' style={{ color: 'var(--gold-dim)' }}>
              AI 베딕 운세 해석 {theme ? '— ' + theme.name : ''}
            </p>
            <p className='font-cinzel font-bold text-lg' style={{ color: 'var(--gold-light)' }}>{birthInfo.name}님</p>
            <p className='text-xs mt-0.5' style={{ color: 'var(--text-muted)' }}>{birthInfo.date} · {birthInfo.place}</p>
          </div>
          <div className='ai-prose'>{formatInterpretation(interpretation)}</div>
          <div className='mt-6 pt-4 flex justify-center' style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <button className='text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80'
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={generate} disabled={loading}>🔄 다시 해석받기</button>
          </div>
        </div>
      )}
    </div>
  );
}