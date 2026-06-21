import { NextRequest, NextResponse } from 'next/server';
import { calculateChart } from '@/lib/vedic-calculations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, minute, latitude, longitude, utcOffset } = body;

    if (!year || !month || !day || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chart = calculateChart(
      Number(year), Number(month), Number(day),
      Number(hour || 12), Number(minute || 0),
      Number(latitude), Number(longitude),
      Number(utcOffset || 0)
    );

    return NextResponse.json(chart);
  } catch (err) {
    console.error('Calculation error:', err);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
