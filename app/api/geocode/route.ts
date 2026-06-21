import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VedicAstrology/1.0 (contact@vedic-astrology.app)' },
    });
    const data = await res.json();
    const results = data.map((item: Record<string, unknown>) => ({
      name: item.display_name,
      lat: parseFloat(item.lat as string),
      lon: parseFloat(item.lon as string),
    }));
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
