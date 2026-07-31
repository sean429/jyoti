'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Landing-page character select. The choice is stored in localStorage under
// jyoti_persona, the same key the reading page reads, so a pick here carries
// through and can still be changed there.
const PERSONAS = [
  { id: 'tara',   name: '타라',   line: '"야, 딱 나오네."',           hue: '#b47bff' },
  { id: 'mira',   name: '미라',   line: '"내가 다 챙겨줄게!"',        hue: '#f2a6cf' },
  { id: 'rahu',   name: '라후',   line: '"이런 걸 숨기고 있었어?"',   hue: '#e0554e' },
  { id: 'arka',   name: '아르카', line: '"쓸데없는 말은 안 한다."',   hue: '#7aa2f0' },
  { id: 'nanima', name: '나니마', line: '"다 지나간단다."',           hue: '#e0d29a' },
];

export default function PersonaSelectHero() {
  const [persona, setPersona] = useState('tara');

  useEffect(() => {
    try {
      const p = localStorage.getItem('jyoti_persona');
      if (p && PERSONAS.some(x => x.id === p)) setPersona(p);
    } catch {}
  }, []);

  function pick(id: string) {
    setPersona(id);
    try { localStorage.setItem('jyoti_persona', id); } catch {}
  }

  const sel = PERSONAS.find(p => p.id === persona) ?? PERSONAS[0];

  return (
    <div className="mt-4 mb-2">
      <p className="text-sm font-cinzel mb-4" style={{ color: '#c4b5fd', letterSpacing: '0.18em' }}>
        ✦ 당신의 점성술사를 고르세요 ✦
      </p>

      <div className="mx-auto" style={{ maxWidth: '880px' }}>
        <div className="pgrid">
          {PERSONAS.map(p => {
            const on = persona === p.id;
            return (
              <button key={p.id} onClick={() => pick(p.id)}
                className="persona-card group relative rounded-xl overflow-hidden transition-all"
                style={{
                  border: on ? `1.5px solid ${p.hue}` : '1px solid rgba(167,139,250,0.18)',
                  boxShadow: on ? `0 6px 26px -6px ${p.hue}` : 'none',
                  transform: on ? 'translateY(-3px)' : 'none',
                }}>
                <div className="relative" style={{ aspectRatio: '5 / 7', background: '#0d0a1c' }}>
                  <img src={`/personas/${p.id}.jpg`} alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ objectPosition: '50% 10%', filter: on ? 'none' : 'saturate(.9) brightness(.82)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 52%, rgba(11,8,24,.88) 100%)' }} />
                  {on && (
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: '#f2d98a', color: '#0b0818', letterSpacing: '.12em' }}>선택됨</div>
                  )}
                </div>
                <div className="px-1 py-2" style={{ background: on ? `color-mix(in srgb, ${p.hue} 22%, #141026)` : '#12102a' }}>
                  <div className="font-cinzel font-bold text-sm" style={{ color: on ? '#fff' : '#e9d5ff' }}>{p.name}</div>
                  <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.line}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-7">
        <Link href="/ko/kundali">
          <span className="btn-gold text-base" style={{ display: 'inline-block', padding: '0.875rem 2.4rem', fontSize: '1rem' }}>
            ✦ {sel.name}와 함께 내 별 읽기 ✦
          </span>
        </Link>
      </div>

      <style jsx>{`
        .pgrid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        @media (max-width: 780px) { .pgrid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px) { .pgrid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
