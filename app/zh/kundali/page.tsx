'use client';

import { useState } from 'react';
import Link from 'next/link';
import BirthChartFormZh, { BirthInfo } from '@/components/BirthChartFormZh';
import KundaliChart from '@/components/KundaliChart';
import PlanetTable from '@/components/PlanetTable';
import DashaTable from '@/components/DashaTable';
import AIInterpretationZh from '@/components/AIInterpretationZh';
import { ChartData } from '@/lib/vedic-calculations';

const SIGN_NAMES_ZH = [
  '白羊 (Mesha)', '金牛 (Vrishabha)', '双子 (Mithuna)', '巨蟹 (Karka)',
  '狮子 (Simha)', '处女 (Kanya)', '天秤 (Tula)', '天蝎 (Vrishchika)',
  '射手 (Dhanu)', '摩羯 (Makara)', '水瓶 (Kumbha)', '双鱼 (Meena)',
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_NAMES_ZH: Record<string, string> = {
  sun:'太阳(苏利耶)', moon:'月亮(旃陀罗)', mars:'火星(芒格拉)', mercury:'水星(布达)',
  jupiter:'木星(古鲁)', venus:'金星(舒克拉)', saturn:'土星(沙尼)', rahu:'罗睺', ketu:'计都',
};

const THEMES = [
  { id: 1,  name: '命运基础',   d1: 1, d2: 9,  label: 'D1 + D9',  desc: '此生根本目的与灵魂前世业力模式' },
  { id: 2,  name: '伴侣缘分',   d1: 1, d2: 9,  label: 'D1 + D9',  desc: '未来伴侣的性格与缘分深度' },
  { id: 3,  name: '子女创造力', d1: 1, d2: 7,  label: 'D1 + D7',  desc: '与子女的连结及创造性才能' },
  { id: 4,  name: '财富格局',   d1: 1, d2: 2,  label: 'D1 + D2',  desc: '物质财富与资源的流动模式' },
  { id: 5,  name: '事业舞台',   d1: 1, d2: 10, label: 'D1 + D10', desc: '在社会中的位置与职业方向' },
  { id: 6,  name: '职业轨道',   d1: 1, d2: 10, label: 'D1 + D10', desc: '此生职业角色与深层职业方向' },
  { id: 7,  name: '家园根基',   d1: 1, d2: 4,  label: 'D1 + D4',  desc: '房产、家庭与母亲的连结' },
  { id: 8,  name: '父母家族',   d1: 1, d2: 12, label: 'D1 + D12', desc: '祖先业力与父母的影响' },
  { id: 9,  name: '出行财物',   d1: 1, d2: 16, label: 'D1 + D16', desc: '车辆、旅行与物质享受' },
  { id: 10, name: '学业专长',   d1: 1, d2: 24, label: 'D1 + D24', desc: '高等教育、专业技能与学术成就' },
  { id: 11, name: '灵性方向',   d1: 1, d2: 20, label: 'D1 + D20', desc: '灵性成长、冥想与解脱之路' },
  { id: 12, name: '天赋才能',   d1: 1, d2: 27, label: 'D1 + D27', desc: '内在优势与与生俱来的才华特长' },
  { id: 13, name: '业力课题',   d1: 1, d2: 30, label: 'D1 + D30', desc: '生命中反复出现的挑战与业力模式' },
  { id: 14, name: '母系传承',   d1: 1, d2: 40, label: 'D1 + D40', desc: '来自母系家族的业力传承' },
  { id: 15, name: '父系传承',   d1: 1, d2: 45, label: 'D1 + D45', desc: '来自父系家族的业力传承' },
] as const;

type Theme = typeof THEMES[number];

export default function ZhKundaliPage() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart'|'planets'|'dasha'|'ai'>('chart');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

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
    } catch { setError('星盘计算失败，请重试。'); }
    setLoading(false);
  }

  const moonPlanet = chart?.planets.find(p => p.id === 'moon');
  const sunPlanet  = chart?.planets.find(p => p.id === 'sun');

  const COLORS: Record<string,string> = {
    sun:'#f59e0b', moon:'#c0c0c0', mars:'#ef4444', mercury:'#10b981',
    jupiter:'#fbbf24', venus:'#ec4899', saturn:'#a78bfa', rahu:'#94a3b8', ketu:'#9ca3af',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/zh" className="font-cinzel-deco text-base font-bold text-gold hover:opacity-80">
                ✦ Jyoti
              </Link>
              <span style={{ color: 'rgba(201,168,76,0.3)' }}>|</span>
              <span className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>吠陀星盘</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/ko/kundali" className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 한국어
              </Link>
              <Link href="/en/kundali" className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 English
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="text-center mb-10">
            <p className="text-2xl mb-2">✦</p>
            <h1 className="font-cinzel-deco text-2xl md:text-4xl font-bold text-gold mb-3">我的命盘</h1>
            <p className="font-cormorant text-lg" style={{ color: 'rgba(240,235,224,0.6)', fontStyle: 'italic' }}>
              出生那一刻，天空的地图已将您的故事收藏其中
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-cinzel font-bold text-base text-gold mb-5 pb-3"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                  ✦ 出生信息输入
                </h2>
                <BirthChartFormZh onSubmit={handleSubmit} loading={loading} />
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
                  <p className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>请输入出生信息</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(156,163,175,0.5)' }}>
                    在左侧表单输入生日与出生地，即可生成命盘
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
                  <p className="font-cinzel font-bold text-base text-gold">星座计算中</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>正在绘制您专属的宇宙蓝图...</p>
                </div>
              )}

              {chart && birthInfo && (
                <div className="space-y-4">
                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '命宫', sublabel: '上升星座', value: SIGN_NAMES_ZH[chart.lagnaSign]?.split(' ')[0], symbol: SIGN_SYMBOLS[chart.lagnaSign], color: '#22d3ee' },
                      { label: '月亮', sublabel: '月亮星座', value: moonPlanet?.sign, symbol: SIGN_SYMBOLS[moonPlanet?.signIndex ?? 0], color: '#c0c0c0' },
                      { label: '太阳', sublabel: '太阳星座', value: sunPlanet?.sign, symbol: SIGN_SYMBOLS[sunPlanet?.signIndex ?? 0], color: '#f59e0b' },
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
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>月亮Nakshatra</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{moonPlanet.nakshatra}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pada {moonPlanet.pada} / 守护星: {moonPlanet.nakshatraLord}</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>月差</p>
                          <p className="font-cinzel font-bold text-base" style={{ color: 'var(--gold-light)' }}>{chart.ayanamsa?.toFixed(4)}°</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>拉希里（恒星）</p>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.2)' }} />
                        <div>
                          <p className="text-xs font-cinzel mb-0.5" style={{ color: 'var(--gold-dim)' }}>出生地</p>
                          <p className="font-cinzel text-sm" style={{ color: 'var(--text)' }}>{birthInfo.place.split(',').slice(0,2).join(',')}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{birthInfo.latitude.toFixed(2)}N, {birthInfo.longitude.toFixed(2)}E</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.1)' }}>
                    {([
                      { id: 'chart',   label: '星盘图' },
                      { id: 'planets', label: '行星' },
                      { id: 'dasha',   label: '大运' },
                      { id: 'ai',      label: '✨ AI解读' },
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
                        <div className="mb-6">
                          <p className="text-xs font-cinzel mb-3" style={{ color: 'var(--gold-dim)', letterSpacing: '1px' }}>
                            VARGA CHART ∘ 分割星盘选择
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
                              D1<br /><span style={{ fontSize: '9px' }}>命盘</span>
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

                        {!selectedTheme ? (
                          <div>
                            <h3 className="font-cinzel font-bold text-sm text-gold mb-4">
                              <span className="ornament">D1 ∘ 命盘（Rashi）</span>
                            </h3>
                            <div className="flex flex-col md:flex-row items-start gap-6">
                              <div className="flex-shrink-0 mx-auto md:mx-0">
                                <KundaliChart chart={chart} size={300} division={1} label="D1 RASHI" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-cinzel mb-3" style={{ color: 'var(--gold-dim)' }}>行星位置 (D1)</p>
                                <div className="space-y-1.5">
                                  {chart.planets.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 text-xs">
                                      <span className="w-28 font-cinzel" style={{ color: COLORS[p.id] }}>{PLANET_NAMES_ZH[p.id] || p.name}</span>
                                      <span style={{ color: 'var(--text-muted)' }}>{p.sign}</span>
                                      <span style={{ color: 'rgba(156,163,175,0.5)' }}>H{p.house}</span>
                                      {p.isRetrograde && <span style={{ color: '#a78bfa', fontSize:'10px' }}>逆行</span>}
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-2 text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                                    <span className="w-28 font-cinzel" style={{ color: '#22d3ee' }}>命宫 (Lagna)</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{SIGN_NAMES_ZH[chart.lagnaSign]}</span>
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
                              <div>
                                <p className="text-xs font-cinzel mb-2 text-center" style={{ color: 'var(--gold-dim)' }}>D1 · 命盘（基础）</p>
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
                              <div>
                                <p className="text-xs font-cinzel mb-2 text-center" style={{ color: 'var(--gold-dim)' }}>
                                  D{selectedTheme.d2} · {
                                    ({2:'Hora',3:'Drekkana',4:'Chaturthamsha',7:'Saptamsha',9:'Navamsha',10:'Dashamsha',
                                      12:'Dwadashamsha',16:'Shodashamsha',20:'Vimshamsha',24:'Chaturvimshamsha',
                                      27:'Saptavimshamsha',30:'Trimshamsha',40:'Khavedamsha',45:'Akshavedamsha'} as Record<number,string>)[selectedTheme.d2] || `D${selectedTheme.d2}`
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
                          <span className="ornament">行星详细信息</span>
                        </h3>
                        <PlanetTable chart={chart} />
                      </div>
                    )}

                    {activeTab === 'dasha' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-5">
                          <span className="ornament">维姆肖塔里大运（Mahadasha）</span>
                        </h3>
                        <DashaTable dashas={chart.dashas} />
                      </div>
                    )}

                    {activeTab === 'ai' && (
                      <div>
                        <h3 className="font-cinzel font-bold text-sm text-gold mb-4">
                          <span className="ornament">AI命盘解读</span>
                        </h3>
                        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                          <p className="text-xs font-cinzel mb-2" style={{ color: 'var(--gold-dim)' }}>选择解读主题（查看特定领域AI解读）</p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setSelectedTheme(null)}
                              className="px-2 py-1 rounded text-xs font-cinzel transition-all"
                              style={{
                                background: !selectedTheme ? 'rgba(201,168,76,0.2)' : 'transparent',
                                border: '1px solid rgba(201,168,76,0.2)',
                                color: !selectedTheme ? 'var(--gold-light)' : 'var(--text-muted)',
                              }}>
                              综合解读
                            </button>
                            {THEMES.map(t => (
                              <button key={t.id}
                                onClick={() => setSelectedTheme(t)}
                                className="px-2 py-1 rounded text-xs font-cinzel transition-all"
                                style={{
                                  background: selectedTheme?.id === t.id ? 'rgba(201,168,76,0.2)' : 'transparent',
                                  border: '1px solid rgba(201,168,76,0.2)',
                                  color: selectedTheme?.id === t.id ? 'var(--gold-light)' : 'var(--text-muted)',
                                }}>
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <AIInterpretationZh
                          chart={chart}
                          birthInfo={{
                            name: birthInfo.name,
                            date: `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日`,
                            time: `${String(birthInfo.hour).padStart(2,'0')}:${String(birthInfo.minute).padStart(2,'0')}`,
                            place: birthInfo.place,
                          }}
                          theme={selectedTheme ? {
                            name: selectedTheme.name,
                            desc: selectedTheme.desc,
                            d2: selectedTheme.d2,
                          } : undefined}
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
              Jyoti · 吠陀占星中的星光语言 · 本解读仅供灵性探索参考
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
