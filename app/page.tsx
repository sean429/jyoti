import Link from 'next/link';

export default function RootPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />
      <div style={{ position: 'relative', zIndex: 1 }} className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2 pulse-gold">✦</p>
          <h1 className="font-cinzel-deco text-5xl md:text-6xl font-bold text-gold mb-2">Jyoti</h1>
          <p className="text-base font-cinzel tracking-widest mb-1" style={{ color: 'var(--gold-dim)' }}>조티</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>인도 베딕 점성술 AI · Vedic Astrology · वैदिक ज्योतिष</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
          <Link href="/ko" className="block">
            <div className="card glow-gold p-5 md:p-8 text-center hover:scale-105 transition-all cursor-pointer">
              <p className="text-3xl md:text-4xl mb-2">🇰🇷</p>
              <h2 className="font-cinzel font-bold text-xl mb-2" style={{ color: 'var(--gold-light)' }}>한국어</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>인도 베딕 점성술<br />AI 한국어 운세 해석</p>
              <span className="btn-gold text-sm" style={{ display: 'inline-block', padding: '0.5rem 1.5rem' }}>시작하기 →</span>
            </div>
          </Link>
          <Link href="/en" className="block">
            <div className="card p-5 md:p-8 text-center hover:scale-105 transition-all cursor-pointer" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-3xl md:text-4xl mb-2">🌍</p>
              <h2 className="font-cinzel font-bold text-xl mb-2" style={{ color: 'var(--gold-light)' }}>English</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Vedic Astrology<br />AI-powered Kundali readings</p>
              <span className="text-sm px-6 py-2 rounded-lg font-cinzel" style={{ border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', display: 'inline-block' }}>Begin →</span>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-xs" style={{ color: 'rgba(156,163,175,0.3)' }}>✦ 빛이 당신의 길을 밝혀드립니다 ✦</p>
      </div>
    </div>
  );
}
