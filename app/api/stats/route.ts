import { NextResponse } from 'next/server';
import { redis } from '@/lib/premium-server';

// Real usage numbers for the social-proof line on the kundali pages.
// Counters are incremented by /api/interpret on every successful reading.
export async function GET() {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const [today, total] = await Promise.all([
      redis(['GET', `stats:reads:${day}`]),
      redis(['GET', 'stats:reads:total']),
    ]);
    return NextResponse.json({
      today: Number(today) || 0,
      total: Number(total) || 0,
    });
  } catch {
    return NextResponse.json({ today: 0, total: 0 });
  }
}
