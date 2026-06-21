import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JyotiVedic/1.0 (contact@jyoti.app)' },
    });
    const data = await res.json();

    const results = data
      .map((item: Record<string, unknown>) => {
        const addr = item.address as Record<string, string> | undefined;
        const city =
          addr?.city || addr?.town || addr?.village || addr?.municipality ||
          addr?.county || (item.name as string) || '';
        const country = addr?.country || '';
        const state = addr?.state || '';
        const displayName = country
          ? state && state !== city
            ? `${city}, ${state}, ${country}`
            : `${city}, ${country}`
          : city;
        return {
          name: displayName,
          lat: parseFloat(item.lat as string),
          lon: parseFloat(item.lon as string),
        };
      })
      .filter((r: { name: string }) => r.name.trim().length > 0)
      .reduce((acc: { name: string; lat: number; lon: number }[], cur: { name: string; lat: number; lon: number }) => {
        if (!acc.find(a => a.name === cur.name)) acc.push(cur);
        return acc;
      }, [])
      .slice(0, 5);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}