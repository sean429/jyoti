import Link from 'next/link';

export default function RootPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100svh' }}>
      <div className="stars-bg" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <p className="text-4xl pulse-gold" style={{ marginBottom: '0.75rem' }}>✦</p>
          <h1 className="font-cinzel-deco font-bold text-gold" style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', marginBottom: '1rem' }}>Jyoti</h1>
          <p className="font-cinzel tracking-widest" style={{ color: 'var(--gold-dim)', fontSize: '1rem', marginBottom: '0.4rem' }}>조티</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>인도 베딕 점성술 AI · Vedic Astrology · वैदिक ज्योतिष</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', width: '100%', maxWidth: '42rem' }}>
          <Link href="/ko" className="block">
            <div className="card glow-gold text-center hover:scale-105 transition-all cursor-pointer" style={{ padding: '1.25rem 0.75rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🇰🇷</p>
              <h2 className="font-cinzel font-bold" style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '0.4rem' }}>한국어</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>인도 베딕 점성술<br />AI 한국어 운세 해석</p>
              <span className="btn-gold" style={{ display: 'inline-block', padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}>시작하기 →</span>
            </div>
          </Link>
          <Link href="/en" className="block">
            <div className="card text-center hover:scale-105 transition-all cursor-pointer" style={{ padding: '1.25rem 0.75rem', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌍</p>
              <h2 className="font-cinzel font-bold" style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '0.4rem' }}>English</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>Vedic Astrology<br />AI-powered Kundali readings</p>
              <span className="font-cinzel" style={{ border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', display: 'inline-block', padding: '0.4rem 1.1rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>Begin →</span>
            </div>
          </Link>
          <Link href="/zh" className="block">
            <div className="card text-center hover:scale-105 transition-all cursor-pointer" style={{ padding: '1.25rem 0.75rem', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🇨🇳</p>
              <h2 className="font-cinzel font-bold" style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '0.4rem' }}>中文</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>吠陀占星术<br />AI中文命盘解读</p>
              <span className="font-cinzel" style={{ border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', display: 'inline-block', padding: '0.4rem 1.1rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>开始 →</span>
            </div>
          </Link>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'rgba(156,163,175,0.3)' }}>✦ 빛이 당신의 길을 밝혀드립니다 ✦</p>
      </div>
    </div>
  );
}
