'use client';

import { useState } from 'react';

// 조티냥 — a floating mascot pinned bottom-right. Hover (or tap) shows a Vedic
// term explained in a cat voice; clicking cycles to the next tip.
const TIPS = [
  'D1(라시 차트)는 네 인생 전체의 기본 지도냥. 성격이랑 큰 흐름을 여기서 봐냥.',
  'D9(나밤샤)는 결혼이랑 인연, 삶이 속으로 무르익는 걸 보는 차트냥.',
  'D10(다샴샤)는 직업이랑 사회에서의 네 자리를 보는 차트냥.',
  '라그나(상승궁)는 태어난 순간 동쪽에 떠오른 별자리냥. 너의 겉모습이자 출발점이냥.',
  '나크샤트라는 달이 지나는 27개의 별자리냥. 네 속마음 성향을 알려주냥.',
  '다샤(빔쇼타리)는 120년짜리 행성 시간표냥. 지금 네가 어떤 시기인지 보여주냥.',
  '라후·케투는 그림자 지점이냥. 집착하는 것과 놓아줘야 할 걸 가리키냥.',
  '아야남사는 별 기준으로 맞춘 보정값이냥. 우리는 라히리(Lahiri)를 써냥.',
];

export default function JyotiCatHelper() {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;

  return (
    <div className="jc-wrap no-print"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {open && (
        <div className="jc-bubble" role="status">
          <p className="jc-text">{TIPS[i]}</p>
          <span className="jc-next">톡 누르면 다음 ▸</span>
        </div>
      )}
      <button className="jc-cat" aria-label="조티냥에게 베딕 상식 물어보기"
        onClick={() => { setPinned(true); setI(v => (v + 1) % TIPS.length); }}>
        <img src="/jyoti-cat.png" alt="조티냥" />
        {!open && <span className="jc-hint">냥?</span>}
      </button>

      <style jsx>{`
        .jc-wrap { position: fixed; right: 14px; bottom: 12px; z-index: 70;
          display: flex; align-items: flex-end; gap: 8px; pointer-events: none; }
        .jc-cat { pointer-events: auto; border: none; background: transparent; cursor: pointer;
          padding: 0; width: 116px; filter: drop-shadow(0 8px 18px rgba(0,0,0,.55));
          transition: transform .18s; position: relative; }
        .jc-cat:hover { transform: translateY(-4px) scale(1.03); }
        .jc-cat img { width: 100%; display: block; }
        .jc-hint { position: absolute; top: 2px; right: 6px; font-size: 12px; font-weight: 700;
          color: #0b0818; background: #f2d98a; border-radius: 999px; padding: 1px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,.4); }
        .jc-bubble { pointer-events: auto; max-width: 240px; margin-bottom: 26px;
          background: rgba(20,16,38,.97); color: #efe9ff; border: 1px solid rgba(201,168,76,.4);
          border-radius: 14px; padding: 12px 14px; box-shadow: 0 10px 34px rgba(0,0,0,.5);
          animation: jcpop .18s ease; position: relative; }
        .jc-bubble::after { content: ''; position: absolute; right: -7px; bottom: 20px;
          border: 7px solid transparent; border-left-color: rgba(20,16,38,.97); }
        @keyframes jcpop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .jc-text { margin: 0; font-size: 13px; line-height: 1.62; }
        .jc-next { display: block; margin-top: 7px; font-size: 10.5px; color: #c4b5fd; letter-spacing: .02em; }
        @media (max-width: 560px) {
          .jc-cat { width: 84px; }
          .jc-bubble { max-width: 190px; margin-bottom: 18px; }
        }
      `}</style>
    </div>
  );
}
