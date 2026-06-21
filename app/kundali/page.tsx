'use client';

import { useState } from 'react';
import Link from 'next/link';
import BirthChartForm, { BirthInfo } from '@/components/BirthChartForm';
import KundaliChart from '@/components/KundaliChart';
import PlanetTable from '@/components/PlanetTable';
import DashaTable from '@/components/DashaTable';
import AIInterpretation from '@/components/AIInterpretation';
import { ChartData } from '@/lib/vedic-calculations';

const SIGN_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export default function KundaliPage() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart' | 'planets' | 'dasha' | 'ai'>('chart');

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
      if (data.error) {
        setError(data.error);
      } else {
        setChart(data);
        setActiveTab('chart');
        setTimeout(() => {
          document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch {
      setError('Failed to calculate chart. Please try again.');
    }
    setLoading(false);
  }

  const moonPlanet = chart?.planets.find(p => p.id === 'moon');
  const sunPlanet = chart?.planets.find(p => p.id === 'sun');

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/" className="font-cinzel-deco text-base font-bold text-gold hover:opacity-80 transition-opacity">
              ← Jyoti
            </Link>
            <span style={{ color: 'rgba(201,168,76,0.3)' }}>|</span>
            <span className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>Kundali Chart</span>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          {/* Page header */}
          <div className="text-center mb-10">
            <p className="text-2xl mb-2">✦</p>
            <h1 className="font-cinzel-deco text-2xl md:text-4xl font-bold text-gold mb-3">
              Your Birth Chart
            </h1>
            <p className="font-cormorant text-lg" style={{ color: 'rgba(240,235,224,0.6)', fontStyle: 'italic' }}>
              Enter your birth details to reveal your Vedic Kundali
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-cinzel font-bold text-base text-gold mb-5 pb-3"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                  ✦ Birth Details
                </h2>
                <BirthChartForm onSubmit={handleSubmit} loading={loading} />
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
                  <div className="text-5xl mb-4 pulse-gold" style={{ color: 'rgba(201,168,76,0.3)' }}>ॐ</div>
                  <p className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>
                    Awaiting your cosmic coordinates
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(156,163,175,0.5)' }}>
                    Enter birth details on the left to generate your Kundali
                  </p>
                </div>
              )}

              {loading && (
                <div className="card p-12 text-center flex flex-col items-center justify-center" style={{ minHeight: '16rem' }}>
                  <div className="relative w-24 h-24 mb-6">
                    <svg viewBox="0 0 96 96" className="spin-slow absolute inset-0 w-full h-full">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" strokeDasharray="6 6" />
                      <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(107,33,168,0.2)" strokeWidth="1" strokeDasharray="3 9" />
                    </svg>
                    <svg viewBox="0 0 96 96" className="spin-reverse absolute inset-0 w-full h-full">
                      <circle cx="48" cy="48" r="30" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1" strokeDasharray="10 5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">ॐ</div>
                  </div>
                  <p className="font-cinzel font-bold text-base text-gold">Calculating Your Chart</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Consulting the cosmic ephemeris...
                  </p>
                </div>
              )}

              {chart && birthInfo && (
                <div className="space-y-4">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: 'Lagna', sublabel: 'Ascendant',
                        value: SIGN_NAMES[chart.lagnaSign]?.split(' ')[0] || '—',
                        symbol: SIGN_SYMBOLS[chart.lagnaSign] || '',
                        color: '#22d3ee',
                      },
                      {
                        label: 'Rashi', sublabel: 'Moon Sign',
                        value: moonPlanet?.sign || '—',
                        symbol: SIGN_SYMBOLS[moonPlanet?.signIndex ?? 0] || '',
                        color: '#c0c0c0',
                      },
                      {
                        label: 'Surya', sublabel: 'Sun Sign',
                        value: sunPlanet?.sign || '—',
                        symbol: SIGN_SYMBOLS[sunPlanet?.signIndex ?? 0] || '',
                        color: '#f59e0b',
                      },
                    ].map(card => (
                      <div key={card.label} className="card p-4 text-center">
                        <p className="text-xs font-cinzel mb-1" style={{ color: card.color }}>{card.label}</p>
                        <p className="text-xl font-bold" style={{ color: card.color }}>{card.symbol}</p>
                        <p className="font-cinzel text-xs mt-1" style={{ color: 'var(--text)' }}>{card.value}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sublabel}</p>
                      </div>
                    ))}
                  </div>

                  {/* Nakshatra summary */}
                  {moonPlanet && (
                    <div className="card p-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>JANMA NAKSHATRA</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>
                            {moonPlanet.nakshatra}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Pada {moonPlanet.pada} · Lord: {moonPlanet.nakshatraLord}
                          </p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>AYANAMSA</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>
                            {chart.ayanamsa?.toFixed(4)}°
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Lahiri (Chitrapaksha)</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>BIRTH PLACE</p>
                          <p className="font-cinzel text-sm" style={{ color: 'var(--text)' }}>
                            {birthInfo.place.split(',').slice(0, 2).join(',')}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {birthInfo.latitude.toFixed(2)}°N, {birthInfo.longitude.toFixed(2)}°E
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    {([
                      { id: 'chart', label: '🗺 Chart' },
                      { id: 'planets', label: '🪐 Planets' },
                      { id: 'dasha', label: '⏳ Dasha' },
                      { id: 'ai', label: '✨ AI Reading' },
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 py-2 px-2 rounded-lg text-sm font-cinzel transition-all"
                        style={{
                          background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                          color: activeTab === tab.id ? 'var(--gold-light)' : 'var(--text-muted)',
                          border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div className="card p-6">
                    {activeTab === 'chart' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">North Indian Kundali</span>
                        </h3>
                        <div className="flex flex-col md:flex-row items-start gap-6">
                          {/* Chart */}
                          <div className="flex-shrink-0 mx-auto md:mx-0">
                            <KundaliChart chart={chart} size={320} />
                          </div>

                          {/* Legend */}
                          <div className="flex-1">
                            <p className="text-xs font-cinzel mb-3" style={{ color: 'var(--gold-dim)' }}>PLANETS IN CHART</p>
                            <div className="space-y-1.5">
                              {chart.planets.map(p => {
                                const COLORS: Record<string, string> = {
                                  sun:'#f59e0b', moon:'#c0c0c0', mars:'#ef4444', mercury:'#10b981',
                                  jupiter:'#fbbf24', venus:'#ec4899', saturn:'#a78bfa', rahu:'#94a3b8', ketu:'#9ca3af',
                                };
                                return (
                                  <div key={p.id} className="flex items-center gap-2 text-xs">
                                    <span className="w-20 font-cinzel" style={{ color: COLORS[p.id] }}>{p.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{p.sign}</span>
                                    <span style={{ color: 'rgba(156,163,175,0.5)' }}>H{p.house}</span>
                                    {p.isRetrograde && <span style={{ color: '#a78bfa', fontSize: '10px' }}>®</span>}
                                  </div>
                                );
                              })}
                              <div className="flex items-center gap-2 text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                                <span className="w-20 font-cinzel" style={{ color: '#22d3ee' }}>Lagna</span>
                                <span style={{ color: 'var(--text-muted)' }}>{SIGN_NAMES[chart.lagnaSign]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'planets' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">Planetary Positions</span>
                        </h3>
                        <PlanetTable chart={chart} />
                      </div>
                    )}

                    {activeTab === 'dasha' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">Vimshottari Dasha</span>
                        </h3>
                        <DashaTable dashas={chart.dashas} />
                      </div>
                    )}

                    {activeTab === 'ai' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">AI Vedic Reading</span>
                        </h3>
                        <AIInterpretation
                          chart={chart}
                          birthInfo={{
                            name: birthInfo.name,
                            date: `${birthInfo.day}/${birthInfo.month}/${birthInfo.year}`,
                            time: `${String(birthInfo.hour).padStart(2, '0')}:${String(birthInfo.minute).padStart(2, '0')}`,
                            place: birthInfo.place,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,8,24,0.8)', marginTop: '4rem' }}>
          <div className="max-w-6xl mx-auto px-6 py-6 text-center">
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.4)' }}>
              Jyoti · Calculations use Lahiri ayanamsa · For entertainment and self-reflection
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
