'use client';

import { useState } from 'react';
import { ChartData } from '@/lib/vedic-calculations';

interface Props {
  chart: ChartData;
  birthInfo: { name: string; date: string; time: string; place: string; };
}

export default function AIInterpretationKo({ chart, birthInfo }: Props) {
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setInterpretation('');
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, birthInfo, lang: 'ko' }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setInterpretation(data.interpretation); setGenerated(true); }
    } catch { setError('연결 오류가 발생했습니다. 다시 시도해주세요.'); }
    setLoading(false);
  }

  function formatInterpretation(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;
    for (const line of lines) {
      if (!line.trim()) { elements.push(<div key={key++} className="h-2" />); continue; }
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        elements.push(
          <h2 key={key++} className="font-cinzel text-base mt-5 mb-2 pb-1"
            style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            {line.slice(2, -2)}
          </h2>
        );
        continue;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/);
      if (parts.length > 1) {
        elements.push(
          <p key={key++} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text)' }}>
            {parts.map((part, i) => part.startsWith('**') && part.endsWith('**')
              ? <strong key={i} style={{ color: 'var(--gold-light)' }}>{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>)}
          </p>
        );
        continue;
      }
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        if (content.startsWith('**')) {
          elements.push(
            <h2 key={key++} className="font-cinzel text-base mt-5 mb-2 pb-1"
              style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
              {content.replace(/\*\*/g, '')}
            </h2>
          );
          continue;
        }
      }
      elements.push(<p key={key++} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text)' }}>{line}</p>);
    }
    return elements;
  }

  return (
    <div>
      {!generated && !loading && (
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="text-4xl mb-3">✦</div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Claude AI 기반 한국어 운세 해석</p>
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
              성격, 재물, 건강, 인간관계, 현재 대운을 상세히 분석해드립니다
            </p>
          </div>
          <button className="btn-gold" onClick={generate}>✦ AI 운세 해석 받기 ✦</button>
        </div>
      )}
      {loading && (
        <div className="text-center py-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <svg viewBox="0 0 80 80" className="spin-slow absolute inset-0 w-full h-full">
              <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <svg viewBox="0 0 80 80" className="spin-reverse absolute inset-0 w-full h-full">
              <circle cx="40" cy="40" r="25" fill="none" stroke="rgba(107,33,168,0.4)" strokeWidth="1" strokeDasharray="8 4" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">ॐ</div>
          </div>
          <p className="font-cinzel text-sm" style={{ color: 'var(--gold)' }}>우주의 기록을 열람하는 중...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{birthInfo.name}님의 행성 기운을 분석 중입니다</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          <p className="font-semibold mb-1">해석을 불러올 수 없습니다</p>
          <p style={{ color: 'rgba(252,165,165,0.7)' }}>{error}</p>
          {error.includes('API key') && (
            <p className="mt-2 text-xs" style={{ color: 'rgba(252,165,165,0.6)' }}>.env.local 파일에 ANTHROPIC_API_KEY를 추가해주세요</p>
          )}
          <button className="mt-3 px-4 py-1.5 rounded text-xs font-cinzel"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            onClick={generate}>다시 시도</button>
        </div>
      )}
      {interpretation && (
        <div>
          <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-cinzel" style={{ color: 'var(--gold-dim)' }}>AI 베딕 운세 해석</p>
            <p className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold-light)' }}>{birthInfo.name}님</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{birthInfo.date} · {birthInfo.place}</p>
          </div>
          <div className="ai-prose">{formatInterpretation(interpretation)}</div>
          <div className="mt-6 pt-4 flex justify-center" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <button className="text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80"
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={generate} disabled={loading}>↺ 다시 해석받기</button>
          </div>
        </div>
      )}
    </div>
  );
}
