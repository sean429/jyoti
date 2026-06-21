'use client';

import { useState } from 'react';
import { ChartData } from '@/lib/vedic-calculations';

interface Props {
  chart: ChartData;
  birthInfo: { name: string; date: string; time: string; place: string; };
}

export default function AIInterpretation({ chart, birthInfo }: Props) {
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
        body: JSON.stringify({ chart, birthInfo, lang: 'en' }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setInterpretation(data.interpretation); setGenerated(true); }
    } catch { setError('Connection error. Please try again.'); }
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
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { elements.push(<div key={key++} className="h-3" />); continue; }

      const hMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
      if (hMatch) {
        elements.push(
          <h2 key={key++} className="font-cinzel font-bold text-base mt-6 mb-2 pb-1"
            style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            {hMatch[2].replace(/\*\*/g, '')}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        elements.push(
          <h2 key={key++} className="font-cinzel font-bold text-base mt-6 mb-2 pb-1"
            style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            {trimmed.slice(2, -2)}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <p key={key++} className="text-sm leading-relaxed mb-1.5 pl-3" style={{ color: 'var(--text)' }}>
            <span style={{ color: 'var(--gold-light)', marginRight: '6px' }}>?</span>
            {renderInline(trimmed.slice(2))}
          </p>
        );
        continue;
      }
      const numBold = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*/);
      if (numBold) {
        elements.push(
          <h2 key={key++} className="font-cinzel font-bold text-base mt-6 mb-2 pb-1"
            style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            {numBold[1]}
          </h2>
        );
        continue;
      }
      elements.push(
        <p key={key++} className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text)' }}>
          {renderInline(trimmed)}
        </p>
      );
    }
    return elements;
  }

  return (
    <div>
      {!generated && !loading && (
        <div className="text-center py-6">
          <div className="mb-4">
            <div className="text-4xl mb-3">?</div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Powered by Gemini AI</p>
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
              Get a detailed personalized reading based on your Kundali
            </p>
          </div>
          <button className="btn-gold" onClick={generate}>? Generate AI Reading ?</button>
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
            <div className="absolute inset-0 flex items-center justify-center text-2xl">?</div>
          </div>
          <p className="font-cinzel text-sm" style={{ color: 'var(--gold)' }}>Consulting the cosmic archives...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Analyzing planetary influences for {birthInfo.name}</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          <p className="font-semibold mb-1">Reading unavailable</p>
          <p style={{ color: 'rgba(252,165,165,0.7)' }}>{error}</p>
          <button className="mt-3 px-4 py-1.5 rounded text-xs font-cinzel"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            onClick={generate}>Try Again</button>
        </div>
      )}
      {interpretation && (
        <div>
          <div className="mb-4 pb-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-cinzel" style={{ color: 'var(--gold-dim)' }}>AI READING FOR</p>
            <p className="font-cinzel font-bold text-lg" style={{ color: 'var(--gold-light)' }}>{birthInfo.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{birthInfo.date} ? {birthInfo.place}</p>
          </div>
          <div className="ai-prose">{formatInterpretation(interpretation)}</div>
          <div className="mt-6 pt-4 flex justify-center" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            <button className="text-xs font-cinzel px-4 py-2 rounded-lg hover:opacity-80"
              style={{ color: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', background: 'transparent' }}
              onClick={generate} disabled={loading}>? Regenerate Reading</button>
          </div>
        </div>
      )}
    </div>
  );
}
