'use client';

import { useState } from 'react';
import Link from 'next/link';
import BirthChartFormKo, { BirthInfo } from '@/components/BirthChartFormKo';
import KundaliChart from '@/components/KundaliChart';
import PlanetTable from '@/components/PlanetTable';
import DashaTable from '@/components/DashaTable';
import AIInterpretationKo from '@/components/AIInterpretationKo';
import { ChartData } from '@/lib/vedic-calculations';

const SIGN_NAMES_KO = [
  '메샤 (양자리)', '브리샤바 (황소자리)', '미투나 (쌍둥이자리)', '카르카 (게자리)',
  '심하 (사자자리)', '칸야 (처녀자리)', '툴라 (천칭자리)', '브리시치카 (전갈자리)',
  '다누 (사수자리)', '마카라 (염소자리)', '쿰바 (물병자리)', '미나 (물고기자리)',
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_NAMES_KO: Record<string, string> = {
  sun:'태양(수리야)', moon:'달(찬드라)', mars:'화성(망갈라)', mercury:'수성(부다)',
  jupiter:'목성(구루)', venus:'금성(슈크라)', saturn:'토성(샤니)', rahu:'라후', ketu:'케투',
};

export default function KoKundaliPage() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart'|'planets'|'dasha'|'ai'>('chart');

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
        setActiveTab('chart');
        setTimeout(() => document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch { setError('차트 계산에 실패했습니다. 다시 시도해주세요.'); }
    setLoading(false);
  }

  const moonPlanet = chart?.planets.find(p => p.id === 'moon');
  const sunPlanet = chart?.planets.find(p => p.id === 'sun');

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/ko" className="font-cinzel-deco text-base font-bold text-gold hover:opacity-80">
                ← Jyoti
              </Link>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>|</span>
              <span className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>쿤달리 차트</span>
            </div>
            <Link href="/en/kundali" className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🌐 English
            </Link>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="text-center mb-10">
            <p className="text-2xl mb-2">✦</p>
            <h1 className="font-cinzel-deco text-2xl md:text-4xl font-bold text-gold mb-3">나의 쿤달리 차트</h1>
            <p className="font-cormorant text-lg" style={{ color: 'rgba(240,235,224,0.6)', fontStyle: 'italic' }}>
              생년월일을 입력하면 인도 베딕 점성술 차트를 바로 확인할 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            <div className="lg:col-span-2" id="chart-section">
              {!chart && !loading && (
                <div className="card p-12 text-center h-64 flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4 pulse-gold" style={{ color: 'rgba(201,168,76,0.3)' }}>ॐ</div>
                  <p className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>출생 정보를 기다리는 중</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(156,163,175,0.5)' }}>
                    왼쪽에 생년월일을 입력하면 쿤달리 차트가 나타납니다
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
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">ॐ</div>
                  </div>
                  <p className="font-cinzel font-bold text-base text-gold">차트 계산 중</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>천문 데이터를 계산하는 중입니다...</p>
                </div>
              )}

              {chart && birthInfo && (
                <div className="space-y-4">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '라그나', sublabel: '상승궁', value: SIGN_NAMES_KO[chart.lagnaSign]?.split(' ')[0] || '—', symbol: SIGN_SYMBOLS[chart.lagnaSign], color: '#22d3ee' },
                      { label: '라시', sublabel: '달 별자리', value: moonPlanet?.sign || '—', symbol: SIGN_SYMBOLS[moonPlanet?.signIndex ?? 0], color: '#c0c0c0' },
                      { label: '수리야', sublabel: '태양 별자리', value: sunPlanet?.sign || '—', symbol: SIGN_SYMBOLS[sunPlanet?.signIndex ?? 0], color: '#f59e0b' },
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
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>탄생 나크샤트라</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{moonPlanet.nakshatra}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>파다 {moonPlanet.pada} · 주인: {moonPlanet.nakshatraLord}</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>아야남사</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{chart.ayanamsa?.toFixed(4)}°</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>라히리 (치트라팍샤)</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>출생지</p>
                          <p className="font-cinzel text-sm" style={{ color: 'var(--text)' }}>{birthInfo.place.split(',').slice(0,2).join(',')}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{birthInfo.latitude.toFixed(2)}°N, {birthInfo.longitude.toFixed(2)}°E</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    {([
                      { id: 'chart', label: '🗺 차트' },
                      { id: 'planets', label: '🪐 행성 위치' },
                      { id: 'dasha', label: '⏳ 대운 (다샤)' },
                      { id: 'ai', label: '✨ AI 운세' },
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
                    {activeTab === 'chart' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">북인도식 쿤달리 차트</span>
                        </h3>
                        <div className="flex flex-col md:flex-row items-start gap-6">
                          <div className="flex-shrink-0 mx-auto md:mx-0">
                            <KundaliChart chart={chart} size={320} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-cinzel mb-3" style={{ color: 'var(--gold-dim)' }}>차트 내 행성</p>
                            <div className="space-y-1.5">
                              {chart.planets.map(p => {
                                const COLORS: Record<string,string> = { sun:'#f59e0b', moon:'#c0c0c0', mars:'#ef4444', mercury:'#10b981', jupiter:'#fbbf24', venus:'#ec4899', saturn:'#a78bfa', rahu:'#94a3b8', ketu:'#9ca3af' };
                                return (
                                  <div key={p.id} className="flex items-center gap-2 text-xs">
                                    <span className="w-28 font-cinzel" style={{ color: COLORS[p.id] }}>{PLANET_NAMES_KO[p.id] || p.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{p.sign}</span>
                                    <span style={{ color: 'rgba(156,163,175,0.5)' }}>H{p.house}</span>
                                    {p.isRetrograde && <span style={{ color: '#a78bfa', fontSize:'10px' }}>역행</span>}
                                  </div>
                                );
                              })}
                              <div className="flex items-center gap-2 text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                                <span className="w-28 font-cinzel" style={{ color: '#22d3ee' }}>라그나 (상승궁)</span>
                                <span style={{ color: 'var(--text-muted)' }}>{SIGN_NAMES_KO[chart.lagnaSign]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'planets' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">행성 위치 분석</span>
                        </h3>
                        <PlanetTable chart={chart} />
                      </div>
                    )}

                    {activeTab === 'dasha' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">빔쇼타리 대운 (다샤)</span>
                        </h3>
                        <DashaTable dashas={chart.dashas} />
                      </div>
                    )}

                    {activeTab === 'ai' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">AI 베딕 운세 해석</span>
                        </h3>
                        <AIInterpretationKo
                          chart={chart}
                          birthInfo={{
                            name: birthInfo.name,
                            date: `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일`,
                            time: `${String(birthInfo.hour).padStart(2,'0')}:${String(birthInfo.minute).padStart(2,'0')}`,
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

        <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,8,24,0.8)', marginTop: '4rem' }}>
          <div className="max-w-6xl mx-auto px-6 py-6 text-center">
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.4)' }}>
              Jyoti · 라히리 아야남사 기반 계산 · 오락 및 자기 성찰 목적
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
