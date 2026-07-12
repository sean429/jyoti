'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BirthChartForm, { BirthInfo } from '@/components/BirthChartForm';
import KundaliChart from '@/components/KundaliChart';
import PlanetTable from '@/components/PlanetTable';
import DashaTable from '@/components/DashaTable';
import AIInterpretation from '@/components/AIInterpretation';
import { ChartData } from '@/lib/vedic-calculations';

const SIGN_NAMES = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

// Premium paid themes — purchased on Groble, unlocked via /api/payment/claim (HMAC token)
const PREMIUM_THEMES_EN = [
  { id: 'career', name: 'Career & Wealth', icon: '💼', d2: 10, desc: 'Deep-dive into career and wealth. Based on D1+D10, reveal my professional talents, success areas, wealth patterns, and money flow in my current dasha.' },
  { id: 'love',   name: 'Love & Marriage', icon: '💕', d2: 9,  desc: 'Deep-dive into love and marriage. Based on D1+D9, reveal my relationship patterns, partner qualities, recurring issues, and timing for good connections.' },
  { id: 'health', name: 'Health',          icon: '🌿', d2: 6,  desc: 'Deep-dive into health. Based on D1+D6, reveal my constitutional weaknesses, vulnerable periods, and practical advice for staying well.' },
  { id: 'yearly', name: "This Year's Fortune", icon: '🌟', d2: 0, desc: 'Focus on this year and my current dasha period. Centered on Mahadasha and Antardasha, what is the nature of this time, what choices are favored, what should I avoid?' },
  { id: 'family', name: 'Children & Family', icon: '🏠', d2: 7, desc: 'Deep-dive into children and family. Based on D1+D7, reveal child connections, relationship patterns with parents and siblings, and family influences.' },
] as const;

type PremiumTheme = typeof PREMIUM_THEMES_EN[number];

// Groble product page links (set in Vercel env, inlined at build time)
const GROBLE_URLS = {
  single: process.env.NEXT_PUBLIC_GROBLE_SINGLE_URL ?? '',
  trio: process.env.NEXT_PUBLIC_GROBLE_TRIO_URL ?? '',
  all: process.env.NEXT_PUBLIC_GROBLE_ALL_URL ?? '',
};

export default function EnKundaliPage() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart'|'planets'|'dasha'|'ai'>('chart');
  const [premiumToken, setPremiumToken] = useState('');
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [claimCode, setClaimCode] = useState('');
  const [activePremium, setActivePremium] = useState<PremiumTheme | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Restore premium token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jyoti_premium_token');
    const savedThemes = localStorage.getItem('jyoti_premium_themes');
    const savedExp = Number(localStorage.getItem('jyoti_premium_exp') ?? 0);
    if (saved && savedThemes && savedExp > Date.now()) {
      setPremiumToken(saved);
      setUnlockedThemes(savedThemes.split(','));
    } else if (saved) {
      localStorage.removeItem('jyoti_premium_token');
      localStorage.removeItem('jyoti_premium_themes');
      localStorage.removeItem('jyoti_premium_exp');
    }
  }, []);

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
        body: JSON.stringify({ code, lang: 'en' }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('jyoti_premium_token', data.token);
        localStorage.setItem('jyoti_premium_themes', data.themes.join(','));
        localStorage.setItem('jyoti_premium_exp', String(data.exp));
        setPremiumToken(data.token);
        setUnlockedThemes(data.themes);
        setJustUnlocked(true);
        setClaimCode('');
      } else setPaymentError(data.error ?? 'No payment found.');
    } catch { setPaymentError('Verification failed. Please try again.'); }
    setPaymentLoading(false);
  }

  async function handleSubmit(info: BirthInfo) {
    setLoading(true); setError(''); setChart(null); setBirthInfo(info);
    try {
      const res = await fetch('/api/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
      const data = await res.json();
      if (data.error) setError(data.error);
      else { setChart(data); setActiveTab('chart'); setTimeout(() => document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }
    } catch { setError('Failed to calculate chart.'); }
    setLoading(false);
  }

  const moonPlanet = chart?.planets.find(p => p.id === 'moon');
  const sunPlanet = chart?.planets.find(p => p.id === 'sun');

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }} className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/en" className="font-cinzel-deco text-base font-bold text-gold hover:opacity-80">← Jyoti</Link>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>|</span>
              <span className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>Kundali Chart</span>
            </div>
            <Link href="/ko/kundali" className="text-xs px-3 py-1.5 rounded-lg" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🌐 한국어
            </Link>
            <Link href="/zh/kundali" className="text-xs px-3 py-1.5 rounded-lg" style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🌐 中文
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="text-center mb-10">
            <h1 className="font-cinzel-deco text-2xl md:text-4xl font-bold text-gold mb-3">Your Birth Chart</h1>
            <p className="font-cormorant text-lg" style={{ color: 'rgba(240,235,224,0.6)', fontStyle: 'italic' }}>Enter your birth details to reveal your Vedic Kundali</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-cinzel font-bold text-base text-gold mb-5 pb-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>✦ Birth Details</h2>
                <BirthChartForm onSubmit={handleSubmit} loading={loading} />
                {error && <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{error}</div>}
              </div>
            </div>

            <div className="lg:col-span-2" id="chart-section">
              {!chart && !loading && (
                <div className="card p-12 text-center h-64 flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4 pulse-gold" style={{ color: 'rgba(201,168,76,0.3)' }}>ॐ</div>
                  <p className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>Awaiting your cosmic coordinates</p>
                </div>
              )}
              {loading && (
                <div className="card p-12 text-center flex flex-col items-center justify-center" style={{ minHeight: '16rem' }}>
                  <div className="relative w-24 h-24 mb-6">
                    <svg viewBox="0 0 96 96" className="spin-slow absolute inset-0 w-full h-full">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" strokeDasharray="6 6" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">ॐ</div>
                  </div>
                  <p className="font-cinzel font-bold text-base text-gold">Calculating Your Chart</p>
                </div>
              )}

              {chart && birthInfo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Lagna', sublabel: 'Ascendant', value: SIGN_NAMES[chart.lagnaSign] || '?', symbol: SIGN_SYMBOLS[chart.lagnaSign], color: '#22d3ee' },
                      { label: 'Rashi', sublabel: 'Moon Sign', value: moonPlanet?.sign || '?', symbol: SIGN_SYMBOLS[moonPlanet?.signIndex ?? 0], color: '#c0c0c0' },
                      { label: 'Surya', sublabel: 'Sun Sign', value: sunPlanet?.sign || '?', symbol: SIGN_SYMBOLS[sunPlanet?.signIndex ?? 0], color: '#f59e0b' },
                    ].map(card => (
                      <div key={card.label} className="card p-4 text-center">
                        <p className="text-xs font-cinzel mb-1" style={{ color: card.color }}>{card.label}</p>
                        <p className="text-xl font-bold" style={{ color: card.color }}>{card.symbol}</p>
                        <p className="font-cinzel text-xs mt-1" style={{ color: 'var(--text)' }}>{card.value}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sublabel}</p>
                      </div>
                    ))}
                  </div>

                  {moonPlanet && (
                    <div className="card p-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>JANMA NAKSHATRA</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{moonPlanet.nakshatra}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pada {moonPlanet.pada} · Lord: {moonPlanet.nakshatraLord}</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>AYANAMSA</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{chart.ayanamsa?.toFixed(4)}°</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Lahiri (Chitrapaksha)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    {([
                      { id: 'chart', label: 'Chart' },
                      { id: 'planets', label: 'Planets' },
                      { id: 'dasha', label: 'Dasha' },
                      { id: 'ai', label: 'AI Reading' },
                    ] as const).map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className="flex-1 py-2 px-2 rounded-lg text-sm font-cinzel transition-all"
                        style={{ background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent', color: activeTab === tab.id ? 'var(--gold-light)' : 'var(--text-muted)', border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent' }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="card p-6">
                    {activeTab === 'chart' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5"><span className="ornament">North Indian Kundali</span></h3>
                        <div className="flex flex-col md:flex-row items-start gap-6">
                          <div className="flex-shrink-0 mx-auto md:mx-0"><KundaliChart chart={chart} size={320} /></div>
                          <div className="flex-1">
                            {chart.planets.map(p => {
                              const C: Record<string,string> = { sun:'#f59e0b',moon:'#c0c0c0',mars:'#ef4444',mercury:'#10b981',jupiter:'#fbbf24',venus:'#ec4899',saturn:'#a78bfa',rahu:'#94a3b8',ketu:'#9ca3af' };
                              return (
                                <div key={p.id} className="flex items-center gap-2 text-xs mb-1">
                                  <span className="w-20 font-cinzel" style={{ color: C[p.id] }}>{p.name}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>{p.sign} H{p.house}</span>
                                  {p.isRetrograde && <span style={{ color: '#a78bfa' }}>R</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'planets' && <div><h3 className="font-cinzel font-bold text-sm text-gold mb-5"><span className="ornament">Planetary Positions</span></h3><PlanetTable chart={chart} /></div>}
                    {activeTab === 'dasha' && <div><h3 className="font-cinzel font-bold text-sm text-gold mb-5"><span className="ornament">Vimshottari Dasha</span></h3><DashaTable dashas={chart.dashas} /></div>}
                    {activeTab === 'ai' && (() => {
                      const question = customQuestion.trim();
                      const aiTheme = activePremium
                        ? { name: activePremium.name, desc: activePremium.desc + (question ? ' Additional question: ' + question : ''), d2: activePremium.d2, premiumId: activePremium.id }
                        : question
                          ? { name: 'My Question', desc: question, d2: 0 }
                          : undefined;
                      return (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5"><span className="ornament">AI Vedic Reading</span></h3>

                        {/* Premium themes */}
                        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(107,33,168,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                            <p className="text-xs font-cinzel" style={{ color: '#c4b5fd' }}>💎 Premium Deep Readings</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>₩3,900 each · all 5 for ₩10,000</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {PREMIUM_THEMES_EN.map(t => {
                              const unlocked = unlockedThemes.includes(t.id);
                              const active = activePremium?.id === t.id;
                              return (
                                <button key={t.id}
                                  onClick={() => {
                                    if (unlocked) {
                                      setActivePremium(active ? null : t);
                                    } else if (GROBLE_URLS.single) {
                                      window.open(GROBLE_URLS.single, '_blank');
                                    }
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
                          {unlockedThemes.length < PREMIUM_THEMES_EN.length && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {GROBLE_URLS.single && (
                                  <a href={GROBLE_URLS.single} target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-cinzel"
                                    style={{ background: 'transparent', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
                                    1 theme ₩3,900
                                  </a>
                                )}
                                {GROBLE_URLS.trio && (
                                  <a href={GROBLE_URLS.trio} target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-cinzel"
                                    style={{ background: 'transparent', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
                                    3 themes ₩10,000
                                  </a>
                                )}
                                {GROBLE_URLS.all && (
                                  <a href={GROBLE_URLS.all} target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold"
                                    style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.6)', color: '#e9d5ff' }}>
                                    ⭐ All 5 ₩10,000
                                  </a>
                                )}
                              </div>
                              <p className="text-[10px] mb-2" style={{ color: 'rgba(196,181,253,0.6)' }}>
                                After paying, enter the email or order number you used below to unlock instantly
                              </p>
                              <div className="flex gap-1.5 flex-wrap">
                                <input
                                  value={claimCode}
                                  onChange={e => setClaimCode(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleClaim(); }}
                                  placeholder="Payment email or order number"
                                  className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg text-xs"
                                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.25)', color: 'var(--text)' }}
                                />
                                <button onClick={handleClaim} disabled={paymentLoading || !claimCode.trim()}
                                  className="px-3 py-1.5 rounded-lg text-xs font-cinzel"
                                  style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.5)', color: '#e9d5ff' }}>
                                  {paymentLoading ? 'Checking...' : '🔓 Unlock'}
                                </button>
                              </div>
                            </div>
                          )}
                          {paymentError && (
                            <p className="text-xs mt-2" style={{ color: '#fca5a5' }}>{paymentError}</p>
                          )}
                          {justUnlocked && unlockedThemes.length > 0 && (
                            <p className="text-xs mt-2" style={{ color: '#86efac' }}>✨ Payment confirmed! Tap a theme to view its reading</p>
                          )}
                          {unlockedThemes.length > 0 && (
                            <p className="text-[10px] mt-2" style={{ color: 'rgba(196,181,253,0.6)' }}>
                              🔓 marked themes are paid — tap one to view its reading (24h per unlock; re-enter your email anytime to unlock again)
                            </p>
                          )}
                        </div>

                        {/* Custom question (free) */}
                        <div className="mb-4">
                          <p className="text-xs font-cinzel mb-2" style={{ color: 'var(--gold-dim)' }}>Ask Nani Ma directly (optional)</p>
                          <textarea
                            value={customQuestion}
                            onChange={e => setCustomQuestion(e.target.value)}
                            maxLength={500}
                            rows={2}
                            placeholder="e.g. Is next year a good time to change jobs? Should I keep pursuing my current studies?"
                            className="w-full p-3 rounded-lg text-sm resize-none"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--text)' }}
                          />
                        </div>

                        <AIInterpretation
                          chart={chart}
                          birthInfo={{ name: birthInfo.name, date: birthInfo.day+'/'+birthInfo.month+'/'+birthInfo.year, time: String(birthInfo.hour).padStart(2,'0')+':'+String(birthInfo.minute).padStart(2,'0'), place: birthInfo.place }}
                          theme={aiTheme}
                          premiumToken={premiumToken || undefined}
                        />
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
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.4)' }}>Jyoti · Lahiri ayanamsa calculations · For entertainment</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
