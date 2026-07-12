import Link from 'next/link';

const features = [
  {
    icon: '🔭',
    title: '命盘图表',
    desc: '基于拉希里月差（Lahiri Ayanamsa）精确计算的北印度式出生星盘，一目了然呈现9颗行星位置。',
  },
  {
    icon: '🌙',
    title: 'Nakshatra分析',
    desc: '解析27个月亮星宿（Nakshatra）、守护神与Pada（宫位段），揭示您内在本质。',
  },
  {
    icon: '⏳',
    title: '维姆肖塔里大运',
    desc: '以120年周期行星大运（Mahadasha）与小运（Antardasha）系统，洞见人生流转。',
  },
  {
    icon: '✨',
    title: 'AI中文解读',
    desc: 'AI解析您的命盘，从性格、财运、健康到人际关系，以中文提供深入解读。',
  },
];

const planets = [
  { name: '苏利耶', chinese: '太阳', symbol: '☉', role: '灵魂与生命力', color: '#f59e0b' },
  { name: '旃陀罗', chinese: '月亮', symbol: '☽', role: '心灵与情感', color: '#c0c0c0' },
  { name: '芒格拉', chinese: '火星', symbol: '♂', role: '能量与勇气', color: '#ef4444' },
  { name: '布达', chinese: '水星', symbol: '☿', role: '智慧与沟通', color: '#10b981' },
  { name: '古鲁', chinese: '木星', symbol: '♃', role: '智慧与好运', color: '#fbbf24' },
  { name: '舒克拉', chinese: '金星', symbol: '♀', role: '爱情与美丽', color: '#ec4899' },
  { name: '沙尼', chinese: '土星', symbol: '♄', role: '业力与纪律', color: '#a78bfa' },
  { name: '罗睺', chinese: '北交点', symbol: '☊', role: '欲望与成长', color: '#94a3b8' },
  { name: '计都', chinese: '南交点', symbol: '☋', role: '解脱与过去', color: '#9ca3af' },
];

export default function ZhHomePage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50 pt-2">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl pulse-gold">ॐ</span>
              <div>
                <span className="font-cinzel-deco text-base font-bold text-gold">Jyoti</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1 }}>印度吠陀占星 AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ko" className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 한국어
              </Link>
              <Link href="/en" className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 English
              </Link>
              <Link href="/zh/kundali">
                <span className="btn-gold text-sm" style={{ display: 'inline-block', padding: '0.5rem 1.25rem' }}>
                  查看我的命盘
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 text-center">
          <div className="mb-6">
            <p className="text-4xl mb-2" style={{ color: 'rgba(201,168,76,0.3)', fontFamily: 'serif' }}>
              ॥ श्री गणेशाय नमः ॥
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm fade-in-up"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--gold)' }}>
            <span>✦</span>
            <span className="font-cinzel">5000年历史的印度吠陀占星术</span>
            <span>✦</span>
          </div>

          <h1 className="font-cinzel-deco text-4xl md:text-6xl font-bold mb-6 leading-tight fade-in-up">
            <span className="text-gold">揭示您的宇宙命运</span>
          </h1>

          <p className="font-cormorant text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed fade-in-up-delay-1"
            style={{ color: 'rgba(240,235,224,0.75)', fontStyle: 'italic' }}>
            古印度Jyotish占星术与AI技术的完美融合。<br />
            您诞生的那一刻，宇宙便已向您低语。
          </p>

          <div className="flex flex-wrap gap-4 justify-center fade-in-up-delay-2">
            <Link href="/zh/kundali">
              <span className="btn-gold text-base" style={{ display: 'inline-block', padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
                ✦ 查看我的命盘 ✦
              </span>
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            只需输入出生日期与出生地，即可立即查看
          </p>

          <div className="flex items-center gap-4 mt-12 mb-2 justify-center">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
            <span className="text-xl" style={{ color: 'rgba(201,168,76,0.5)' }}>✦</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
          </div>

          <p className="text-xs font-cinzel tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Jyotish · Nakshatra · Kundali · Dasha · Rashi
          </p>
        </section>

        {/* Planets */}
        <section style={{ background: 'rgba(16,16,42,0.6)', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {planets.map(p => (
                <div key={p.name} className="flex flex-col items-center gap-1 group cursor-default">
                  <span className="text-2xl transition-transform group-hover:scale-125" style={{ color: p.color }}>
                    {p.symbol}
                  </span>
                  <span className="font-cinzel text-xs" style={{ color: p.color }}>{p.name}</span>
                  <span className="text-[10px] text-center" style={{ color: 'rgba(156,163,175,0.6)' }}>{p.chinese}<br />{p.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold mb-3 text-gold">您能了解什么？</h2>
            <p style={{ color: 'var(--text-muted)' }}>仅凭出生信息，即可获得以下全部内容</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card glow-gold p-6 flex gap-4 hover:border-gold/50 transition-all">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-cinzel font-bold text-base mb-2" style={{ color: 'var(--gold-light)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ background: 'rgba(16,16,42,0.4)', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="max-w-4xl mx-auto px-6 py-20">
            <h2 className="font-cinzel text-2xl font-bold text-center text-gold mb-12">
              <span className="ornament">使用方法</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: '输入出生信息', desc: '填写出生日期、时间与地点。不知道出生时间也没关系。' },
                { step: '02', title: '自动计算星盘', desc: '精密天文算法基于拉希里月差计算恒星天体行星位置。' },
                { step: '03', title: 'AI中文解读', desc: 'AI解析您的命盘，以中文解读性格、运势与当前大运。' },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel font-bold text-lg"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)' }}>
                    {s.step}
                  </div>
                  <h3 className="font-cinzel font-bold mb-2" style={{ color: 'var(--gold-light)' }}>{s.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { num: '27个', label: 'Nakshatra', desc: '月亮星宿完整分析' },
              { num: '9颗', label: '行星（Graha）', desc: '太阳·月亮·火·水·木·金·土·罗睺·计都' },
              { num: '120年', label: 'Dasha系统', desc: '维姆肖塔里大运·小运体系' },
            ].map(s => (
              <div key={s.num} className="card p-6">
                <p className="font-cinzel-deco text-3xl font-bold text-gold mb-1">{s.num}</p>
                <p className="font-cinzel text-sm mb-2" style={{ color: 'var(--gold-light)' }}>{s.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="card glow-purple p-10 md:p-14 text-center">
            <p className="text-3xl mb-4" style={{ color: 'rgba(201,168,76,0.4)' }}>☽ ✦ ☉</p>
            <h2 className="font-cinzel-deco text-2xl md:text-3xl font-bold text-gold mb-4">
              星辰已准备好了
            </h2>
            <p className="font-cormorant text-xl mb-3" style={{ color: 'rgba(240,235,224,0.7)', fontStyle: 'italic' }}>
              您诞生的那一刻，宇宙已将您的故事刻入星辰之中。
            </p>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              通过印度吠陀占星，了解您的上升星座（Lagna）、月亮星座与当前大运
            </p>
            <Link href="/zh/kundali">
              <span className="btn-gold text-base" style={{ display: 'inline-block', padding: '1rem 3rem' }}>
                立即开始 ✦
              </span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,8,24,0.8)' }}>
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <p className="font-cinzel-deco text-base text-gold mb-2">Jyoti</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ॥ यदा यदा हि धर्मस्य ग्लानिर्भवति भारत ॥
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link href="/ko" className="text-xs" style={{ color: 'rgba(156,163,175,0.5)' }}>한국어 버전</Link>
              <Link href="/en" className="text-xs" style={{ color: 'rgba(156,163,175,0.5)' }}>English Version</Link>
            </div>
            <p className="text-xs mt-3" style={{ color: 'rgba(156,163,175,0.4)' }}>
              本服务仅供娱乐与自我探索目的。使用拉希里月差的简化行星算法。
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
