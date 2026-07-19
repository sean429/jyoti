'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BirthChartFormKo, { BirthInfo } from '@/components/BirthChartFormKo';
import KundaliChart from '@/components/KundaliChart';
import PlanetTable from '@/components/PlanetTable';
import DashaTable from '@/components/DashaTable';
import AIInterpretationKo from '@/components/AIInterpretationKo';
import PremiumFullReport from '@/components/PremiumFullReport';
import CreditWallet from '@/components/CreditWallet';
import LiveCounter from '@/components/LiveCounter';
import PaymentReturnPrompt from '@/components/PaymentReturnPrompt';
import BrowserHint from '@/components/BrowserHint';
import { ChartData } from '@/lib/vedic-calculations';

const SIGN_NAMES_KO = [
  '메샤 (양자리)', '브리샤바 (황소자리)', '미투나 (쌍둥이자리)', '카르카 (게자리)',
  '심하 (사자자리)', '칸야 (처녀자리)', '툴라 (천칭자리)', '브리쉬치카 (전갈자리)',
  '다누 (궁수자리)', '마카라 (염소자리)', '쿰바 (물병자리)', '미나 (물고기자리)',
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_NAMES_KO: Record<string, string> = {
  sun:'태양(수리야)', moon:'달(찬드라)', mars:'화성(망갈라)', mercury:'수성(부다)',
  jupiter:'목성(구루)', venus:'금성(슈크라)', saturn:'토성(샤니)', rahu:'라후', ketu:'케투',
};

// 15 divisional chart combination themes
const THEMES = [
  { id: 1,  name: '운명의 기본값',  d1: 1, d2: 9,  label: 'D1 + D9',  desc: '이 생의 근본 목적과 영혼의 전생 업보 패턴' },
  { id: 2,  name: '배우자 인연',    d1: 1, d2: 9,  label: 'D1 + D9',  desc: '배우자가 될 사람의 기질, 인연의 깊이' },
  { id: 3,  name: '자녀와 창조성', d1: 1, d2: 7,  label: 'D1 + D7',  desc: '자녀와의 연결, 창조적 재능' },
  { id: 4,  name: '돈의 그릇',     d1: 1, d2: 2,  label: 'D1 + D2',  desc: '물질적 부와 자원의 흐름과 패턴' },
  { id: 5,  name: '사업의 판',     d1: 1, d2: 10, label: 'D1 + D10', desc: '사회 속의 위치와 직업의 방향성' },
  { id: 6,  name: '직업의 궤도',   d1: 1, d2: 10, label: 'D1 + D10', desc: '이 생의 업무적 역할과 직업의 깊은 방향' },
  { id: 7,  name: '집과 뿌리',     d1: 1, d2: 4,  label: 'D1 + D4',  desc: '부동산, 집, 어머니와의 연결' },
  { id: 8,  name: '부모와 가문',   d1: 1, d2: 12, label: 'D1 + D12', desc: '조상으로부터의 업, 부모의 영향' },
  { id: 9,  name: '이동과 소유',   d1: 1, d2: 16, label: 'D1 + D16', desc: '차량, 여행, 사치와 편의의 영역' },
  { id: 10, name: '공부와 전문성', d1: 1, d2: 24, label: 'D1 + D24', desc: '고등 교육, 전문 기술, 학문적 성취' },
  { id: 11, name: '영적 방향',     d1: 1, d2: 20, label: 'D1 + D20', desc: '영적 성장, 명상, 해탈의 길' },
  { id: 12, name: '타고난 무기',   d1: 1, d2: 27, label: 'D1 + D27', desc: '내면의 강점과 천부적인 재능과 특기' },
  { id: 13, name: '반복되는 문제', d1: 1, d2: 30, label: 'D1 + D30', desc: '삶에서 반복되는 도전과 카르마 패턴' },
  { id: 14, name: '모계 흐름',     d1: 1, d2: 40, label: 'D1 + D40', desc: '어머니 쪽 가계로부터 전해지는 업보' },
  { id: 15, name: '부계 흐름',     d1: 1, d2: 45, label: 'D1 + D45', desc: '아버지 쪽 가계로부터 전해지는 업보' },
] as const;

type Theme = typeof THEMES[number];

// Premium paid themes — purchased on Groble, unlocked via /api/payment/claim (HMAC token)
const PREMIUM_THEMES_KO = [
  { id: 'career', name: '직업·재물운', icon: '💼', d2: 10, desc: '직업과 재물운을 D1+D10 차트 기반으로 집중 분석합니다. 직업적 재능, 성공 분야, 재물 흐름, 현재 다샤의 재물운을 구체적으로 알려주세요.' },
  { id: 'love',   name: '연애·결혼운', icon: '💕', d2: 9,  desc: '연애와 결혼운을 D1+D9 차트 기반으로 집중 분석합니다. 인연 패턴, 배우자 기질, 관계 반복 문제, 좋은 인연이 오는 시기를 알려주세요.' },
  { id: 'health', name: '건강운',      icon: '🌿', d2: 6,  desc: '건강운을 D1+D6 차트 기반으로 집중 분석합니다. 선천적으로 약한 부분, 주의 시기, 건강 유지를 위한 현실적인 조언을 알려주세요.' },
  { id: 'yearly', name: '올해 운세',   icon: '🌟', d2: 0,  desc: '올해와 현재 다샤 기간의 운세를 집중 분석합니다. 이 시기의 성격, 유리한 선택, 피해야 할 것을 마하다샤와 안타르다샤 중심으로 알려주세요.' },
  { id: 'family', name: '자녀·가족운', icon: '🏠', d2: 7,  desc: '자녀운과 가족 관계를 D1+D7 차트 기반으로 집중 분석합니다. 자녀 인연, 부모·형제 관계 패턴, 가족의 영향을 알려주세요.' },
] as const;

// Chapters of the love-focused PDF report (ids love1..love5 gate server-side)
const LOVE_THEMES_KO = [
  { id: 'love1', name: '미래 배우자 몽타주', icon: '💘', d2: 9, desc: '미래 배우자의 첫인상, 분위기, 스타일과 기질을 스케치합니다. 어떤 사람인지 생생하게 그려주세요.' },
  { id: 'love2', name: '인연의 타이밍',     icon: '⏳', d2: 9, desc: '인연이 켜지는 시기와 결혼의 창을 다샤 흐름으로 읽습니다. 지금이 어떤 계절인지 알려주세요.' },
  { id: 'love3', name: '만남의 시나리오',   icon: '🗺️', d2: 9, desc: '어디서 어떻게 만나게 되는지, 첫 만남의 장면과 경로를 그려주세요.' },
  { id: 'love4', name: '나의 매력 설계도',  icon: '🌹', d2: 9, desc: '이성에게 작동하는 나의 매력이 무엇인지, 언제 켜지고 꺼지는지 알려주세요.' },
  { id: 'love5', name: '악연 감별법',       icon: '🕯️', d2: 9, desc: '반복되는 악연 패턴과 조기 신호, 그리고 오래가는 사랑의 조건을 알려주세요.' },
] as const;

// Both the 5 deep-dive themes and the love-report chapters flow through the
// same selection state.
type PremiumTheme = { id: string; name: string; icon: string; d2: number; desc: string };

// Groble product page links (set in Vercel env, inlined at build time)
const GROBLE_URLS = {
  single: process.env.NEXT_PUBLIC_GROBLE_SINGLE_URL ?? '',
  trio: process.env.NEXT_PUBLIC_GROBLE_TRIO_URL ?? '',
  all: process.env.NEXT_PUBLIC_GROBLE_ALL_URL ?? '',
  stdSingle: process.env.NEXT_PUBLIC_GROBLE_STD_SINGLE_URL ?? '',
  stdFive: process.env.NEXT_PUBLIC_GROBLE_STD_FIVE_URL ?? '',
  stdAll: process.env.NEXT_PUBLIC_GROBLE_STD_ALL_URL ?? '',
  love: process.env.NEXT_PUBLIC_GROBLE_LOVE_URL ?? '',
};

export default function KoKundaliPage() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart'|'planets'|'dasha'|'ai'>('chart');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [premiumToken, setPremiumToken] = useState('');
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [credits, setCredits] = useState<{ std: number; prem: number }>({ std: 0, prem: 0 });
  const [claimCode, setClaimCode] = useState('');
  const [activePremium, setActivePremium] = useState<PremiumTheme | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [fullReport, setFullReport] = useState(false);
  const [loveReport, setLoveReport] = useState(false);

  // Restore premium token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jyoti_premium_token');
    const savedThemes = localStorage.getItem('jyoti_premium_themes');
    const savedExp = Number(localStorage.getItem('jyoti_premium_exp') ?? 0);
    if (saved && savedExp > Date.now()) {
      setPremiumToken(saved);
      setUnlockedThemes((savedThemes ?? '').split(',').filter(Boolean));
      try { setCredits(JSON.parse(localStorage.getItem('jyoti_premium_credits') ?? '')); } catch {}
    } else if (saved) {
      localStorage.removeItem('jyoti_premium_token');
      localStorage.removeItem('jyoti_premium_themes');
      localStorage.removeItem('jyoti_premium_credits');
      localStorage.removeItem('jyoti_premium_exp');
    }
  }, []);

  // Persists a token grant (from claim or use-credit) to state + localStorage.
  function saveGrant(data: { token: string; themes: string[]; credits?: { std?: number; prem?: number }; exp: number }) {
    const c = { std: data.credits?.std ?? 0, prem: data.credits?.prem ?? 0 };
    localStorage.setItem('jyoti_premium_token', data.token);
    localStorage.setItem('jyoti_premium_themes', data.themes.join(','));
    localStorage.setItem('jyoti_premium_credits', JSON.stringify(c));
    localStorage.setItem('jyoti_premium_exp', String(data.exp));
    setPremiumToken(data.token);
    setUnlockedThemes(data.themes);
    setCredits(c);
    setJustUnlocked(true);
    if (PREMIUM_THEMES_KO.every(t => data.themes.includes(t.id))) setFullReport(true);
    else if (LOVE_THEMES_KO.every(t => data.themes.includes(t.id))) setLoveReport(true);
  }

  // After paying on Groble, the buyer enters their order number or email here;
  // the server matches it against webhook-recorded purchases and issues a token.
  async function handleClaim() {
    const code = claimCode.trim();
    if (!code) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await fetch('/api/payment/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, lang: 'ko' }),
      });
      const data = await res.json();
      if (data.token) {
        saveGrant(data);
        setClaimCode('');
      } else setPaymentError(data.error ?? '결제 내역을 찾지 못했습니다.');
    } catch { setPaymentError('확인에 실패했습니다. 잠시 후 다시 시도해주세요.'); }
    setPaymentLoading(false);
  }

  // Stamped when a buy button opens Groble, so the return-prompt greets the
  // buyer when they come back to this page after paying.
  function markPendingBuy() {
    try { localStorage.setItem('jyoti_pending_buy', String(Date.now())); } catch {}
  }

  // Spends one credit to permanently unlock the given theme id (stdN or premium).
  async function handleUseCredit(themeId: string) {
    if (!premiumToken) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await fetch('/api/payment/use-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: premiumToken, theme: themeId, lang: 'ko' }),
      });
      const data = await res.json();
      if (data.token) saveGrant(data);
      else setPaymentError(data.error ?? '이용권 사용에 실패했습니다.');
    } catch { setPaymentError('이용권 사용에 실패했습니다. 잠시 후 다시 시도해주세요.'); }
    setPaymentLoading(false);
  }

  async function handleSubmit(info: BirthInfo) {
    setLoading(true);
    setError('');
    setChart(null);
    setBirthInfo(info);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setChart(data);
        setSelectedTheme(null);
        setActiveTab('chart');
        setTimeout(() => document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch { setError('차트 계산에 실패했습니다. 다시 시도해주세요.'); }
    setLoading(false);
  }

  const moonPlanet = chart?.planets.find(p => p.id === 'moon');
  const sunPlanet  = chart?.planets.find(p => p.id === 'sun');

  const premiumAllUnlocked = PREMIUM_THEMES_KO.every(t => unlockedThemes.includes(t.id));
  const stdAllUnlocked = THEMES.every(t => unlockedThemes.includes('std' + t.id));
  const loveAllUnlocked = LOVE_THEMES_KO.every(t => unlockedThemes.includes(t.id));

  const COLORS: Record<string,string> = {
    sun:'#f59e0b', moon:'#c0c0c0', mars:'#ef4444', mercury:'#10b981',
    jupiter:'#fbbf24', venus:'#ec4899', saturn:'#a78bfa', rahu:'#94a3b8', ketu:'#9ca3af',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />
      <CreditWallet lang="ko" credits={credits} unlockedCount={unlockedThemes.length} />
      <PaymentReturnPrompt lang="ko" onUnlocked={saveGrant} />
      <BrowserHint lang="ko" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/ko" className="font-cinzel-deco text-base font-bold text-gold hover:opacity-80">
                ✦ Jyoti
              </Link>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>|</span>
              <span className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>베딕 차트</span>
            </div>
            <Link href="/en/kundali" className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🌐 English
            </Link>
            <Link href="/zh/kundali" className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🌐 中文
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="text-center mb-10">
            <p className="text-2xl mb-2">✦</p>
            <h1 className="font-cinzel-deco text-2xl md:text-4xl font-bold text-gold mb-3">내 별자리 차트</h1>
            <p className="font-cormorant text-lg" style={{ color: 'rgba(240,235,224,0.6)', fontStyle: 'italic' }}>
              태어난 순간 하늘의 지도가 당신의 이야기를 담고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-cinzel font-bold text-base text-gold mb-5 pb-3"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                  ✦ 출생 정보 입력
                </h2>
                <BirthChartFormKo onSubmit={handleSubmit} loading={loading} />
                {error && (
                  <div className="mt-4 p-3 rounded-lg text-sm text-center"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2" id="chart-section">
              {!chart && !loading && (
                <div className="card p-12 text-center h-64 flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4 pulse-gold" style={{ color: 'rgba(201,168,76,0.3)' }}>✦</div>
                  <p className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>출생 정보를 입력해 주세요</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(156,163,175,0.5)' }}>
                    좌측 폼에서 생년월일과 장소를 입력하시면 차트가 생성됩니다
                  </p>
                </div>
              )}

              {loading && (
                <div className="card p-12 text-center flex flex-col items-center justify-center" style={{ minHeight: '16rem' }}>
                  <div className="relative w-24 h-24 mb-6">
                    <svg viewBox="0 0 96 96" className="spin-slow absolute inset-0 w-full h-full">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" strokeDasharray="6 6" />
                    </svg>
                    <svg viewBox="0 0 96 96" className="spin-reverse absolute inset-0 w-full h-full">
                      <circle cx="48" cy="48" r="30" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1" strokeDasharray="10 5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🔮</div>
                  </div>
                  <p className="font-cinzel font-bold text-base text-gold">별자리 계산 중</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>당신만의 우주적 청사진을 그립니다...</p>
                </div>
              )}

              {chart && birthInfo && (
                <div className="space-y-4">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '라그나', sublabel: '어센던트', value: SIGN_NAMES_KO[chart.lagnaSign]?.split(' ')[0], symbol: SIGN_SYMBOLS[chart.lagnaSign], color: '#22d3ee' },
                      { label: '달',   sublabel: '달 별자리', value: moonPlanet?.sign, symbol: SIGN_SYMBOLS[moonPlanet?.signIndex ?? 0], color: '#c0c0c0' },
                      { label: '태양', sublabel: '태양 별자리', value: sunPlanet?.sign, symbol: SIGN_SYMBOLS[sunPlanet?.signIndex ?? 0], color: '#f59e0b' },
                    ].map(card => (
                      <div key={card.label} className="card p-4 text-center">
                        <p className="text-xs font-cinzel mb-1" style={{ color: card.color }}>{card.label}</p>
                        <p className="text-xl font-bold" style={{ color: card.color }}>{card.symbol}</p>
                        <p className="font-cinzel text-xs mt-1" style={{ color: 'var(--text)' }}>{card.value || '?'}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sublabel}</p>
                      </div>
                    ))}
                  </div>

                  {moonPlanet && (
                    <div className="card p-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>달의 나크샤트라</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{moonPlanet.nakshatra}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>파다 {moonPlanet.pada} / 절대주: {moonPlanet.nakshatraLord}</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>아야남사</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{chart.ayanamsa?.toFixed(4)}°</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>라히리 (시데레알)</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>장소</p>
                          <p className="font-cinzel text-sm" style={{ color: 'var(--text)' }}>{birthInfo.place.split(',').slice(0,2).join(',')}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{birthInfo.latitude.toFixed(2)}N, {birthInfo.longitude.toFixed(2)}E</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    {([
                      { id: 'chart',   label: '차트 보기' },
                      { id: 'planets', label: '행성 보기' },
                      { id: 'dasha',   label: '대 운세' },
                      { id: 'ai',      label: '✨ AI 해석' },
                    ] as const).map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="flex-1 py-2 px-2 rounded-lg text-sm font-cinzel transition-all"
                        style={{
                          background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                          color: activeTab === tab.id ? 'var(--gold-light)' : 'var(--text-muted)',
                          border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                        }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="card p-6">
                    {/* CHART TAB */}
                    {activeTab === 'chart' && (
                      <div>
                        {/* Theme selector */}
                        <div className="mb-6">
                          <p className="text-xs font-cinzel mb-3" style={{ color: 'var(--gold-dim)', letterSpacing: '1px' }}>
                            VARGA CHART ∘ 분할 차트 선택
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                            <button
                              onClick={() => setSelectedTheme(null)}
                              className="px-2 py-2 rounded-lg text-xs font-cinzel text-center transition-all"
                              style={{
                                background: !selectedTheme ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.03)',
                                border: !selectedTheme ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.12)',
                                color: !selectedTheme ? 'var(--gold-light)' : 'var(--text-muted)',
                              }}>
                              D1<br /><span style={{ fontSize: '9px' }}>라시 차트</span>
                            </button>
                            {THEMES.map(t => (
                              <button
                                key={t.id}
                                onClick={() => setSelectedTheme(t)}
                                className="px-2 py-2 rounded-lg text-xs font-cinzel text-center transition-all"
                                style={{
                                  background: selectedTheme?.id === t.id ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.03)',
                                  border: selectedTheme?.id === t.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.12)',
                                  color: selectedTheme?.id === t.id ? 'var(--gold-light)' : 'var(--text-muted)',
                                }}>
                                {t.label}<br /><span style={{ fontSize: '9px' }}>{t.name}</span>
                              </button>
                            ))}
                          </div>
                          {selectedTheme && (
                            <p className="mt-2 text-xs" style={{ color: 'rgba(201,168,76,0.6)' }}>
                              {selectedTheme.name} · {selectedTheme.desc}
                            </p>
                          )}
                        </div>

                        {/* Charts */}
                        {!selectedTheme ? (
                          <div>
                            <h3 className="font-cinzel font-bold text-sm text-gold mb-4">
                              <span className="ornament">D1 ∘ 라시 차트 (본명)</span>
                            </h3>
                            <div className="flex flex-col md:flex-row items-start gap-6">
                              <div className="flex-shrink-0 mx-auto md:mx-0">
                                <KundaliChart chart={chart} size={300} division={1} label="D1 RASHI" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-cinzel mb-3" style={{ color: 'var(--gold-dim)' }}>행성 위치 (D1)</p>
                                <div className="space-y-1.5">
                                  {chart.planets.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 text-xs">
                                      <span className="w-28 font-cinzel" style={{ color: COLORS[p.id] }}>{PLANET_NAMES_KO[p.id] || p.name}</span>
                                      <span style={{ color: 'var(--text-muted)' }}>{p.sign}</span>
                                      <span style={{ color: 'rgba(156,163,175,0.5)' }}>H{p.house}</span>
                                      {p.isRetrograde && <span style={{ color: '#a78bfa', fontSize:'10px' }}>역행</span>}
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-2 text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                                    <span className="w-28 font-cinzel" style={{ color: '#22d3ee' }}>라그나</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{SIGN_NAMES_KO[chart.lagnaSign]}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-cinzel font-bold text-sm text-gold mb-4">
                              <span className="ornament">{selectedTheme.name} · {selectedTheme.label}</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* D1 chart */}
                              <div>
                                <p className="text-xs font-cinzel mb-2 text-center" style={{ color: 'var(--gold-dim)' }}>D1 · 라시 (기본차트)</p>
                                <KundaliChart chart={chart} size={260} division={1} label="D1" />
                                <div className="mt-2 space-y-0.5">
                                  {chart.planets.slice(0,5).map(p => (
                                    <div key={p.id} className="flex gap-2 text-[10px]">
                                      <span className="w-14 font-cinzel" style={{ color: COLORS[p.id] }}>{p.name}</span>
                                      <span style={{ color: 'var(--text-muted)' }}>{p.sign.slice(0,3)} H{p.house}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Dx chart */}
                              <div>
                                <p className="text-xs font-cinzel mb-2 text-center" style={{ color: 'var(--gold-dim)' }}>
                                  D{selectedTheme.d2} · {
                                    ({2:'호라',3:'드레카나',4:'차투르탐샤',7:'삽타암샤',9:'나밤샤',10:'다샴샤',
                                      12:'드와다샴샤',16:'쇼다샴샤',20:'빔샴샤',24:'차투르빔샴샤',
                                      27:'삽타빔샴샤',30:'트림샴샤',40:'찰리샴샤',45:'악샤베담샤'} as Record<number,string>)[selectedTheme.d2] || `D${selectedTheme.d2}`
                                  }
                                </p>
                                <KundaliChart chart={chart} size={260} division={selectedTheme.d2} label={`D${selectedTheme.d2}`} />
                                <div className="mt-2 space-y-0.5">
                                  {chart.planets.slice(0,5).map(p => {
                                    const divData = (p as any).divisional?.[`D${selectedTheme.d2}`];
                                    return divData ? (
                                      <div key={p.id} className="flex gap-2 text-[10px]">
                                        <span className="w-14 font-cinzel" style={{ color: COLORS[p.id] }}>{p.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{divData.sign.slice(0,3)} H{divData.house}</span>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'planets' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">행성 상세 정보</span>
                        </h3>
                        <PlanetTable chart={chart} />
                      </div>
                    )}

                    {activeTab === 'dasha' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">빔쇼타리 대운 (마하다샤)</span>
                        </h3>
                        <DashaTable dashas={chart.dashas} />
                      </div>
                    )}

                    {activeTab === 'ai' && (() => {
                      const question = customQuestion.trim();
                      const aiTheme = activePremium
                        ? { name: activePremium.name, desc: activePremium.desc + (question ? ' 추가 질문: ' + question : ''), d2: activePremium.d2, premiumId: activePremium.id }
                        : selectedTheme
                          ? { name: selectedTheme.name, desc: selectedTheme.desc + (question ? ' 추가 질문: ' + question : ''), d2: selectedTheme.d2, premiumId: 'std' + selectedTheme.id }
                          : question
                            ? { name: '나의 질문', desc: question, d2: 0 }
                            : undefined;
                      return (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-4">
                          <span className="ornament">AI 운세 해석 보기</span>
                        </h3>
                        <LiveCounter lang="ko" />
                        {/* Theme picker for AI */}
                        {!fullReport && !loveReport && (
                        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                            <p className="text-xs font-cinzel" style={{ color: 'var(--gold-dim)' }}>해석 주제 선택 — 종합 운세는 무료</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>심층 테마 단품 ₩2,000 · 5개 ₩5,000 · 15개 ₩12,900</p>
                          </div>
                          <button
                            onClick={() => { setSelectedTheme(null); setActivePremium(null); }}
                            className="w-full px-2 py-1.5 mb-2 rounded text-xs font-cinzel transition-all"
                            style={{
                              background: !selectedTheme && !activePremium ? 'rgba(201,168,76,0.2)' : 'transparent',
                              border: '1px solid rgba(201,168,76,0.2)',
                              color: !selectedTheme && !activePremium ? 'var(--gold-light)' : 'var(--text-muted)',
                            }}>
                            ✦ 종합 운세 (무료)
                          </button>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: '6px' }}>
                            {THEMES.map(t => {
                              const unlocked = unlockedThemes.includes('std' + t.id);
                              return (
                              <button key={t.id}
                                onClick={() => { setSelectedTheme(t); setActivePremium(null); }}
                                className="px-2 py-1.5 rounded text-xs font-cinzel transition-all text-center"
                                style={{
                                  background: selectedTheme?.id === t.id ? 'rgba(201,168,76,0.2)' : 'transparent',
                                  border: '1px solid rgba(201,168,76,0.2)',
                                  color: selectedTheme?.id === t.id || unlocked ? 'var(--gold-light)' : 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                }}>
                                {t.name} {unlocked ? '🔓' : '🔒'}
                              </button>
                              );
                            })}
                          </div>
                          {selectedTheme && !unlockedThemes.includes('std' + selectedTheme.id) && credits.std > 0 && (
                            <button onClick={() => handleUseCredit('std' + selectedTheme.id)} disabled={paymentLoading}
                              className="btn-buy mt-3" style={{ display: 'inline-flex' }}>
                              {paymentLoading ? '여는 중...' : `🎟 이용권으로 '${selectedTheme.name}' 열기 · 남은 이용권 ${credits.std}장`}
                            </button>
                          )}
                          {!stdAllUnlocked && (
                            <div className="mt-3">
                              <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>
                                잠긴 테마는 무료 미리보기로 맛볼 수 있어요 — 구매 후 결제하신 전화번호를 입력하면 이용권이 충전되고, 원하는 테마를 골라 열 수 있어요
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {GROBLE_URLS.stdSingle && (
                                  <a href={GROBLE_URLS.stdSingle} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy">
                                    💳 테마 1개 ₩2,000
                                  </a>
                                )}
                                {GROBLE_URLS.stdFive && (
                                  <a href={GROBLE_URLS.stdFive} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy">
                                    💳 테마 5개 <s style={{ opacity: 0.55, fontWeight: 400 }}>₩10,000</s> ₩5,000 · 50%↓
                                  </a>
                                )}
                                {GROBLE_URLS.stdAll && (
                                  <a href={GROBLE_URLS.stdAll} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy btn-buy-best">
                                    💳 15개 전부 <s style={{ opacity: 0.55, fontWeight: 400 }}>₩30,000</s> ₩12,900 · 57%↓
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        )}

                        {/* Love-focused PDF report */}
                        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(190,24,93,0.08)', border: '1px solid rgba(244,114,182,0.3)' }}>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                            <p className="text-xs font-cinzel" style={{ color: '#f9a8d4' }}>💘 연애 집중 리포트</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>5챕터 PDF 한 권 · ₩11,900</p>
                          </div>
                          {!fullReport && !loveReport && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {LOVE_THEMES_KO.map(t => {
                              const unlocked = unlockedThemes.includes(t.id);
                              const active = activePremium?.id === t.id;
                              return (
                                <button key={t.id}
                                  onClick={() => {
                                    setActivePremium(active ? null : t);
                                    setSelectedTheme(null);
                                  }}
                                  className="px-2 py-1 rounded text-xs font-cinzel transition-all"
                                  style={{
                                    background: active ? 'rgba(244,114,182,0.22)' : 'transparent',
                                    border: active ? '1px solid rgba(244,114,182,0.55)' : '1px solid rgba(244,114,182,0.3)',
                                    color: active || unlocked ? '#f9a8d4' : 'var(--text-muted)',
                                  }}>
                                  {t.icon} {t.name} {unlocked ? (active ? '✓' : '🔓') : '🔒'}
                                </button>
                              );
                            })}
                          </div>
                          )}
                          {loveAllUnlocked ? (
                            <button onClick={() => { setLoveReport(!loveReport); setFullReport(false); }}
                              className="mb-2 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold"
                              style={{ background: loveReport ? 'rgba(201,168,76,0.25)' : 'rgba(244,114,182,0.2)', border: '1px solid rgba(244,114,182,0.5)', color: '#fbcfe8' }}>
                              {loveReport ? '↩ 개별 테마 보기' : '💘 연애 집중 리포트 (PDF 한 권)'}
                            </button>
                          ) : (
                            <div className="mb-1">
                              {GROBLE_URLS.love && (
                                <div className="mb-2">
                                  <a href={GROBLE_URLS.love} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy btn-buy-best">
                                    💘 연애 집중 리포트 PDF <s style={{ opacity: 0.55, fontWeight: 400 }}>₩19,900</s> ₩11,900 · 40%↓
                                  </a>
                                </div>
                              )}
                              <p className="text-[10px] mb-1" style={{ color: 'rgba(249,168,212,0.75)' }}>
                                미래 배우자의 인상·분위기 몽타주, 인연이 오는 시기, 만나는 장소와 첫 만남 시나리오, 나의 매력 설계도, 악연 감별까지 — 표지와 차례를 갖춘 PDF 한 권으로 드려요
                              </p>
                              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                잠긴 챕터를 누르면 무료 미리보기를 볼 수 있어요 · 결제 후 아래 입력칸에 결제하신 전화번호를 넣으면 열립니다
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Premium themes */}
                        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(107,33,168,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                            <p className="text-xs font-cinzel" style={{ color: '#c4b5fd' }}>💎 프리미엄 심층 해석</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>단품 ₩3,900 · 전체 ₩14,900</p>
                          </div>
                          {!fullReport && !loveReport && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {PREMIUM_THEMES_KO.map(t => {
                              const unlocked = unlockedThemes.includes(t.id);
                              const active = activePremium?.id === t.id;
                              return (
                                <button key={t.id}
                                  onClick={() => {
                                    setActivePremium(active ? null : t);
                                    setSelectedTheme(null);
                                  }}
                                  className="px-2 py-1 rounded text-xs font-cinzel transition-all"
                                  style={{
                                    background: active ? 'rgba(167,139,250,0.25)' : 'transparent',
                                    border: active ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(167,139,250,0.25)',
                                    color: active || unlocked ? '#c4b5fd' : 'var(--text-muted)',
                                  }}>
                                  {t.icon} {t.name} {unlocked ? (active ? '✓' : '🔓') : '🔒'}
                                </button>
                              );
                            })}
                          </div>
                          )}
                          {activePremium && PREMIUM_THEMES_KO.some(p => p.id === activePremium.id) && !unlockedThemes.includes(activePremium.id) && credits.prem > 0 && (
                            <button onClick={() => handleUseCredit(activePremium.id)} disabled={paymentLoading}
                              className="btn-buy mb-2" style={{ display: 'inline-flex' }}>
                              {paymentLoading ? '여는 중...' : `🎟 이용권으로 '${activePremium.name}' 열기 · 남은 프리미엄 이용권 ${credits.prem}장`}
                            </button>
                          )}
                          {premiumAllUnlocked && (
                            <button onClick={() => { setFullReport(!fullReport); setLoveReport(false); }}
                              className="mb-2 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold"
                              style={{ background: fullReport ? 'rgba(201,168,76,0.25)' : 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.5)', color: '#e9d5ff' }}>
                              {fullReport ? '↩ 개별 테마 보기' : '📕 5개 테마 통합 보고서 (PDF 한 권)'}
                            </button>
                          )}
                          {!premiumAllUnlocked && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-2 mb-2 items-center">
                                {GROBLE_URLS.single && (
                                  <a href={GROBLE_URLS.single} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy">
                                    💳 테마 1개 ₩3,900
                                  </a>
                                )}
                                {GROBLE_URLS.trio && (
                                  <a href={GROBLE_URLS.trio} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy">
                                    💳 테마 3개 ₩10,000
                                  </a>
                                )}
                                {GROBLE_URLS.all && (
                                  <a href={GROBLE_URLS.all} target="_blank" rel="noopener noreferrer" onClick={markPendingBuy} className="btn-buy btn-buy-best">
                                    🏆 추천 · 📕 통합 PDF 보고서 <s style={{ opacity: 0.55, fontWeight: 400 }}>₩38,900</s> ₩14,900 · ₩24,000 할인
                                  </a>
                                )}
                              </div>
                              <p className="text-[10px] mb-1" style={{ color: 'rgba(230,193,90,0.75)' }}>
                                📕 통합 PDF 보고서: 5개 테마를 한 번에 해석해 표지·챕터가 갖춰진 PDF 한 권으로 저장할 수 있어요
                              </p>
                              <p className="text-[10px] mb-2" style={{ color: 'rgba(196,181,253,0.6)' }}>
                                결제 완료 후, 결제하신 전화번호를 아래에 입력하면 이용권이 충전됩니다 — 원하는 테마를 골라 여세요
                              </p>
                              <div className="flex gap-1.5 flex-wrap">
                                <input
                                  value={claimCode}
                                  onChange={e => setClaimCode(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleClaim(); }}
                                  placeholder="결제하신 전화번호 (또는 이메일·주문번호)"
                                  className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg text-xs"
                                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.25)', color: 'var(--text)' }}
                                />
                                <button onClick={handleClaim} disabled={paymentLoading || !claimCode.trim()}
                                  className="px-3 py-1.5 rounded-lg text-xs font-cinzel"
                                  style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.5)', color: '#e9d5ff' }}>
                                  {paymentLoading ? '확인 중...' : '🔓 해석 열기'}
                                </button>
                              </div>
                            </div>
                          )}
                          {paymentError && (
                            <p className="text-xs mt-2" style={{ color: '#fca5a5' }}>{paymentError}</p>
                          )}
                          {justUnlocked && unlockedThemes.length > 0 && (
                            <p className="text-xs mt-2" style={{ color: '#86efac' }}>✨ 결제 확인 완료! 테마를 눌러 해석을 확인하세요</p>
                          )}
                          {unlockedThemes.length > 0 && (
                            <p className="text-[10px] mt-2" style={{ color: 'rgba(196,181,253,0.6)' }}>
                              🔓 표시된 테마는 결제 완료 — 눌러서 해석을 확인하세요 (열람 24시간, 이후 같은 이메일로 다시 열 수 있어요)
                            </p>
                          )}
                        </div>

                        {/* Custom question (free) */}
                        {!fullReport && !loveReport && (
                        <div className="mb-4">
                          <p className="text-xs font-cinzel mb-2" style={{ color: 'var(--gold-dim)' }}>나니마에게 직접 묻고 싶은 것 (선택)</p>
                          <textarea
                            value={customQuestion}
                            onChange={e => setCustomQuestion(e.target.value)}
                            maxLength={500}
                            rows={2}
                            placeholder="예: 내년에 이직해도 괜찮을까요? 지금 하는 공부를 계속하는 게 맞을까요?"
                            className="w-full p-3 rounded-lg text-sm resize-none"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--text)' }}
                          />
                        </div>
                        )}

                        {loveReport && premiumToken ? (
                          <PremiumFullReport
                            chart={chart}
                            birthInfo={{
                              name: birthInfo.name,
                              date: `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일`,
                              time: `${String(birthInfo.hour).padStart(2,'0')}:${String(birthInfo.minute).padStart(2,'0')}`,
                              place: birthInfo.place,
                            }}
                            themes={LOVE_THEMES_KO}
                            premiumToken={premiumToken}
                            lang='ko'
                            title='AI 베딕 연애 집중 리포트'
                          />
                        ) : fullReport && premiumToken ? (
                          <PremiumFullReport
                            chart={chart}
                            birthInfo={{
                              name: birthInfo.name,
                              date: `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일`,
                              time: `${String(birthInfo.hour).padStart(2,'0')}:${String(birthInfo.minute).padStart(2,'0')}`,
                              place: birthInfo.place,
                            }}
                            themes={PREMIUM_THEMES_KO}
                            premiumToken={premiumToken}
                            lang='ko'
                          />
                        ) : (
                        <AIInterpretationKo
                          chart={chart}
                          birthInfo={{
                            name: birthInfo.name,
                            date: `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일`,
                            time: `${String(birthInfo.hour).padStart(2,'0')}:${String(birthInfo.minute).padStart(2,'0')}`,
                            place: birthInfo.place,
                          }}
                          theme={aiTheme}
                          premiumToken={premiumToken || undefined}
                        />
                        )}
                      </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,8,24,0.8)', marginTop: '4rem' }}>
          <div className="max-w-6xl mx-auto px-6 py-6 text-center">
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.4)' }}>
              Jyoti · 베딕 점성술을 통한 별빛의 언어 · 이 해석은 영적인 탐색을 위한 것입니다
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
