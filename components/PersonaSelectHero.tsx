'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Landing character select — a big featured portrait of the chosen astrologer
// with a strip of pickable thumbnails beneath. The choice is stored under
// jyoti_persona (the same key the reading page reads), so it carries through.
const PERSONAS = [
  { id: 'tara',   name: '타라',   line: '"야, 네 차트 보니까 딱 나오네."',   hue: '#b47bff' },
  { id: 'mira',   name: '미라',   line: '"내가 옆에서 다 챙겨줄게!"',        hue: '#f2a6cf' },
  { id: 'rahu',   name: '라후',   line: '"재밌네. 이런 걸 숨기고 있었어?"',  hue: '#e0554e' },
  { id: 'arka',   name: '아르카', line: '"쓸데없는 말은 안 한다. 이거다."',  hue: '#7aa2f0' },
  { id: 'nanima', name: '나니마', line: '"얘야, 이건 다 지나간단다."',       hue: '#e0d29a' },
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
    <div className="psel">
      <p className="psel-eyebrow">✦ 당신의 점성술사를 고르세요 ✦</p>

      {/* Big featured portrait of the chosen astrologer */}
      <div className="psel-stage" style={{ ['--hue' as string]: sel.hue }}>
        <img key={sel.id} src={`/personas/${sel.id}_full.jpg`} alt={sel.name} className="psel-hero-img" />
        <div className="psel-hero-grad" />
        <div className="psel-hero-cap">
          <div className="psel-hero-name">{sel.name}</div>
          <div className="psel-hero-line">{sel.line}</div>
        </div>
      </div>

      {/* Pick strip */}
      <div className="psel-thumbs">
        {PERSONAS.map(p => {
          const on = persona === p.id;
          return (
            <button key={p.id} onClick={() => pick(p.id)} aria-label={p.name}
              className={`psel-thumb${on ? ' on' : ''}`} style={{ ['--hue' as string]: p.hue }}>
              <img src={`/personas/${p.id}.jpg`} alt={p.name} />
              <span className="psel-thumb-name">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="psel-cta">
        <Link href="/ko/kundali">
          <span className="btn-gold" style={{ display: 'inline-block', padding: '0.95rem 2.6rem', fontSize: '1.05rem' }}>
            ✦ {sel.name}와 함께 내 별 읽기 ✦
          </span>
        </Link>
      </div>

      <style jsx>{`
        .psel { margin: 8px auto 0; }
        .psel-eyebrow { font-size: 14px; letter-spacing: 0.2em; color: #c4b5fd;
          font-family: var(--font-cinzel, serif); margin-bottom: 18px; }

        .psel-stage {
          position: relative; width: min(340px, 82vw); aspect-ratio: 4 / 5;
          margin: 0 auto; border-radius: 20px; overflow: hidden;
          border: 1.5px solid var(--hue);
          box-shadow: 0 18px 60px -18px var(--hue), 0 0 0 1px rgba(0,0,0,.3) inset;
          background: #0d0a1c;
        }
        .psel-hero-img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 8%;
          display: block; animation: pfade .45s ease; }
        @keyframes pfade { from { opacity: 0; transform: scale(1.03); } to { opacity: 1; transform: none; } }
        .psel-hero-grad { position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 45%, rgba(11,8,24,.92) 100%); }
        .psel-hero-cap { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; }
        .psel-hero-name { font-family: var(--font-cinzel, serif); font-weight: 700;
          font-size: 30px; color: #fff; text-shadow: 0 2px 16px var(--hue); }
        .psel-hero-line { font-size: 14px; color: #e9d5ff; margin-top: 4px; }

        .psel-thumbs { display: flex; justify-content: center; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
        .psel-thumb { position: relative; padding: 0; border: none; background: transparent; cursor: pointer;
          width: 76px; border-radius: 12px; overflow: hidden; transition: transform .18s;
          outline: 2px solid transparent; }
        .psel-thumb img { width: 100%; aspect-ratio: 5 / 7; object-fit: cover; object-position: 50% 8%;
          display: block; border-radius: 12px; filter: saturate(.85) brightness(.72); transition: filter .2s; }
        .psel-thumb-name { position: absolute; left: 0; right: 0; bottom: 4px; text-align: center;
          font-size: 11px; font-weight: 700; color: #efe9ff; text-shadow: 0 1px 4px #000; opacity: .85; }
        .psel-thumb:hover { transform: translateY(-3px); }
        .psel-thumb:hover img { filter: saturate(1) brightness(.95); }
        .psel-thumb.on { outline-color: var(--hue); box-shadow: 0 6px 20px -6px var(--hue); }
        .psel-thumb.on img { filter: none; }

        .psel-cta { margin-top: 24px; }

        @media (max-width: 480px) {
          .psel-thumb { width: 58px; }
          .psel-hero-name { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}
