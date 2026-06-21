import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jyoti — 인도 베딕 점성술 AI',
  description: '나의 쿤달리 차트, 나크샤트라, 대운을 AI로 분석합니다. 5000년 인도 베딕 점성술을 한국어로.',
  keywords: 'vedic astrology, kundali, jyotish, nakshatra, dasha, 베딕점성술, 쿤달리, 인도점성술, 조티',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
