import Link from 'next/link';

// Shared shell for the Korean policy pages (privacy / refund / disclaimer).
// Server component — static text only, styled to match the site theme.
export default function LegalPage({ title, updated, children }: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="stars-bg" />
      <div style={{ position: 'relative', zIndex: 1 }} className="max-w-2xl mx-auto px-5 py-12">
        <p className="mb-8">
          <Link href="/ko/kundali" className="text-xs" style={{ color: 'var(--gold-dim)' }}>← Jyoti로 돌아가기</Link>
        </p>
        <h1 className="font-cinzel font-bold text-2xl mb-1" style={{ color: 'var(--gold-light)' }}>{title}</h1>
        <p className="text-xs mb-10" style={{ color: 'var(--text-muted)' }}>시행일: {updated}</p>
        <div className="legal-body text-sm" style={{ color: 'var(--text)', lineHeight: 1.85 }}>
          {children}
        </div>
        <div className="mt-12 pt-6 flex gap-4 flex-wrap" style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
          <Link href="/ko/privacy" className="text-xs" style={{ color: 'var(--text-muted)' }}>개인정보처리방침</Link>
          <Link href="/ko/refund" className="text-xs" style={{ color: 'var(--text-muted)' }}>취소·환불 안내</Link>
          <Link href="/ko/disclaimer" className="text-xs" style={{ color: 'var(--text-muted)' }}>이용 안내·면책</Link>
        </div>
      </div>
    </div>
  );
}

// Section heading + body used by all three pages.
export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-cinzel font-bold text-base mb-2 pb-1" style={{ color: 'var(--gold-light)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
        {heading}
      </h2>
      {children}
    </section>
  );
}
