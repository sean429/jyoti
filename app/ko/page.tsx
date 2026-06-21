import Link from 'next/link';

const features = [
  {
    icon: '🔭',
    title: '쿤달리 차트',
    desc: '라히리 아야남사(Lahiri Ayanamsa)로 계산된 정밀 북인도식 출생 차트. 9개 행성의 위치를 한눈에 확인하세요.',
  },
  {
    icon: '🌙',
    title: '나크샤트라 분석',
    desc: '27개 달의 별자리(나크샤트라)와 수호신, 파다(Pada)를 분석해 당신의 내면 본질을 밝혀드립니다.',
  },
  {
    icon: '⏳',
    title: '빔쇼타리 다샤',
    desc: '120년 주기 행성 대운(Mahadasha)과 소운(Antardasha) 시스템으로 인생의 흐름을 파악하세요.',
  },
  {
    icon: '✨',
    title: 'AI 한국어 해석',
    desc: 'Claude AI가 당신의 쿤달리를 분석해 성격, 재물, 건강, 인간관계까지 한국어로 상세히 해석해드립니다.',
  },
];

const planets = [
  { name: '수리야', korean: '태양', symbol: '☉', role: '영혼과 생명력', color: '#f59e0b' },
  { name: '찬드라', korean: '달', symbol: '☽', role: '마음과 감정', color: '#c0c0c0' },
  { name: '망갈라', korean: '화성', symbol: '♂', role: '에너지와 용기', color: '#ef4444' },
  { name: '부다', korean: '수성', symbol: '☿', role: '지성과 소통', color: '#10b981' },
  { name: '구루', korean: '목성', symbol: '♃', role: '지혜와 행운', color: '#fbbf24' },
  { name: '슈크라', korean: '금성', symbol: '♀', role: '사랑과 아름다움', color: '#ec4899' },
  { name: '샤니', korean: '토성', symbol: '♄', role: '카르마와 규율', color: '#a78bfa' },
  { name: '라후', korean: '북교점', symbol: '☊', role: '욕망과 성장', color: '#94a3b8' },
  { name: '케투', korean: '남교점', symbol: '☋', role: '해탈과 과거', color: '#9ca3af' },
];

export default function KoHomePage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl pulse-gold">ॐ</span>
              <div>
                <span className="font-cinzel-deco text-base font-bold text-gold">Jyoti</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1 }}>인도 베딕 점성술 AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/en" className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 English
              </Link>
              <Link href="/ko/kundali">
                <span className="btn-gold text-sm" style={{ display: 'inline-block', padding: '0.5rem 1.25rem' }}>
                  내 쿤달리 보기
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="mb-6">
            <p className="text-4xl mb-2" style={{ color: 'rgba(201,168,76,0.3)', fontFamily: 'serif' }}>
              ॥ श्री गणेशाय नमः ॥
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm fade-in-up"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--gold)' }}>
            <span>✦</span>
            <span className="font-cinzel">5,000년 역사의 인도 베딕 점성술</span>
            <span>✦</span>
          </div>

          <h1 className="font-cinzel-deco text-4xl md:text-6xl font-bold mb-6 leading-tight fade-in-up">
            <span className="text-gold">당신의 우주적 운명을</span>
            <br />
            <span style={{ color: 'var(--text)' }}>밝혀드립니다</span>
          </h1>

          <p className="font-cormorant text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed fade-in-up-delay-1"
            style={{ color: 'rgba(240,235,224,0.75)', fontStyle: 'italic' }}>
            고대 인도 조티쉬(Jyotish) 점성술이 AI 기술과 만났습니다.<br />
            당신이 태어난 순간, 우주는 이미 당신에게 속삭이고 있었습니다.
          </p>

          <div className="flex flex-wrap gap-4 justify-center fade-in-up-delay-2">
            <Link href="/ko/kundali">
              <span className="btn-gold text-base" style={{ display: 'inline-block', padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
                ✦ 나의 쿤달리 차트 보기 ✦
              </span>
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            생년월일과 출생 장소만 입력하면 바로 확인 가능합니다
          </p>

          <div className="flex items-center gap-4 mt-12 mb-2 justify-center">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3))' }} />
            <span className="text-xl" style={{ color: 'rgba(201,168,76,0.5)' }}>✦</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)' }} />
          </div>

          <p className="text-xs font-cinzel tracking-widest" style={{ color: 'var(--text-muted)' }}>
            조티쉬 · 나크샤트라 · 쿤달리 · 다샤 · 라시
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
                  <span className="text-[10px] text-center" style={{ color: 'rgba(156,163,175,0.6)' }}>{p.korean}<br />{p.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold mb-3 text-gold">무엇을 알 수 있나요?</h2>
            <p style={{ color: 'var(--text-muted)' }}>출생 정보 하나로 이 모든 것을 확인하세요</p>
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
              <span className="ornament">이렇게 사용하세요</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: '생년월일 입력', desc: '태어난 날짜, 시간, 장소를 입력하세요. 태어난 시간이 없어도 괜찮습니다.' },
                { step: '02', title: '차트 자동 계산', desc: '정밀한 천문 알고리즘으로 라히리 아야남사 기반의 사이드리얼 행성 위치를 계산합니다.' },
                { step: '03', title: 'AI 한국어 해석', desc: 'Claude AI가 당신의 쿤달리를 분석해 성격, 운세, 현재 대운을 한국어로 해석합니다.' },
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

        {/* Testimonial-style info */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { num: '27개', label: '나크샤트라', desc: '달의 별자리 완전 분석' },
              { num: '9개', label: '그라하(행성)', desc: '태양·달·화·수·목·금·토·라후·케투' },
              { num: '120년', label: '다샤 시스템', desc: '빔쇼타리 대운·소운 체계' },
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
              별이 준비되어 있습니다
            </h2>
            <p className="font-cormorant text-xl mb-3" style={{ color: 'rgba(240,235,224,0.7)', fontStyle: 'italic' }}>
              당신이 태어난 그 순간, 우주는 당신을 위한 이야기를 새겨두었습니다.
            </p>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              인도 베딕 점성술로 당신의 라그나(상승궁), 달 별자리, 현재 대운을 확인해보세요
            </p>
            <Link href="/ko/kundali">
              <span className="btn-gold text-base" style={{ display: 'inline-block', padding: '1rem 3rem' }}>
                지금 바로 시작하기 ✦
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
              <Link href="/en" className="text-xs" style={{ color: 'rgba(156,163,175,0.5)' }}>English Version</Link>
            </div>
            <p className="text-xs mt-3" style={{ color: 'rgba(156,163,175,0.4)' }}>
              본 서비스는 오락 및 자기 성찰 목적입니다. 라히리 아야남사 기반의 간소화된 행성 계산을 사용합니다.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
