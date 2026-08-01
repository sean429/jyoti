import type { Metadata } from 'next';
import './globals.css';

const OG_TITLE = '당신의 점성술사를 고르세요 — Jyoti 베딕 점성술';
const OG_DESC = '시크한 누나부터 비밀스러운 그 남자까지, 나만의 점성술사가 별로 읽어주는 무료 운세. 생년월일만으로 확인하세요.';

export const metadata: Metadata = {
  // Update this to the custom domain once it's connected; OG image URLs resolve against it.
  metadataBase: new URL('https://jyoti-vedic-astrology.vercel.app'),
  title: 'Jyoti — 인도 베딕 점성술 AI',
  description: '나의 쿤달리 차트, 나크샤트라, 대운을 AI로 분석합니다. 5000년 인도 베딕 점성술을 한국어로.',
  keywords: 'vedic astrology, kundali, jyotish, nakshatra, dasha, 베딕점성술, 쿤달리, 인도점성술, 조티',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Jyoti',
    title: OG_TITLE,
    description: OG_DESC,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Jyoti 점성술사 — 타라 · 미라 · 라후 · 아르카 · 나니마' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESC,
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
