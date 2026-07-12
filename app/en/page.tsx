import Link from 'next/link';

const features = [
  { icon: '🔭', title: 'Kundali Chart', desc: 'Precise North Indian birth chart with all 9 grahas using Lahiri ayanamsa.' },
  { icon: '🌙', title: 'Nakshatra Analysis', desc: 'Discover your lunar mansion, ruling deity, pada, and nakshatra lord.' },
  { icon: '⌛', title: 'Vimshottari Dasha', desc: 'Navigate your life periods with the 120-year planetary dasha system.' },
  { icon: '✨', title: 'AI Interpretation', desc: 'Personalized readings powered by AI, synthesizing your chart into actionable wisdom.' },
];

export default function EnHomePage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(10px)', background: 'rgba(8,8,24,0.7)' }}
          className="sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl pulse-gold">ॐ</span>
              <div>
                <span className="font-cinzel-deco text-base font-bold text-gold">Jyoti</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1 }}>Vedic Astrology AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ko" className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 한국어
              </Link>
              <Link href="/zh" className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                🌐 中文
              </Link>
              <Link href="/en/kundali">
                <span className="btn-gold text-sm" style={{ display: 'inline-block', padding: '0.5rem 1.25rem' }}>
                  Get Your Kundali
                </span>
              </Link>
            </div>
          </div>
        </nav>

        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="font-cinzel-deco text-4xl md:text-6xl font-bold mb-6 leading-tight fade-in-up">
            <span className="text-gold">Discover Your</span><br />
            <span style={{ color: 'var(--text)' }}>Cosmic Blueprint</span>
          </h1>
          <p className="font-cormorant text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed fade-in-up-delay-1"
            style={{ color: 'rgba(240,235,224,0.7)', fontStyle: 'italic' }}>
            Ancient wisdom meets modern AI. Unlock the secrets of your birth chart through
            the sacred science of Jyotish.
          </p>
          <Link href="/en/kundali">
            <span className="btn-gold text-base fade-in-up-delay-2" style={{ display: 'inline-block', padding: '0.875rem 2.5rem' }}>
              ✦ Reveal My Destiny ✦
            </span>
          </Link>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold mb-3 text-gold">What You Will Discover</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card glow-gold p-6 flex gap-4">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-cinzel font-bold text-base mb-2" style={{ color: 'var(--gold-light)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="card glow-purple p-10 md:p-14">
            <h2 className="font-cinzel-deco text-2xl md:text-3xl font-bold text-gold mb-4">The Stars Are Ready</h2>
            <p className="font-cormorant text-xl mb-8" style={{ color: 'rgba(240,235,224,0.7)', fontStyle: 'italic' }}>
              Every moment of your birth was written in the cosmos.
            </p>
            <Link href="/en/kundali">
              <span className="btn-gold text-base" style={{ display: 'inline-block', padding: '1rem 3rem' }}>
                Begin Your Journey ✦
              </span>
            </Link>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(8,8,24,0.8)' }}>
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <p className="font-cinzel-deco text-base text-gold mb-2">Jyoti</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/ko" className="text-xs" style={{ color: 'rgba(156,163,175,0.5)' }}>한국어 버전</Link>
            </div>
            <p className="text-xs mt-3" style={{ color: 'rgba(156,163,175,0.4)' }}>
              For entertainment and self-reflection. Uses Lahiri ayanamsa with simplified planetary algorithms.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
