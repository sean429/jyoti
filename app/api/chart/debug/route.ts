import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (!pythonUrl) {
    return NextResponse.json({ error: 'PYTHON_SERVICE_URL not set' }, { status: 503 });
  }
  try {
    const params = req.nextUrl.searchParams.toString();
    const res = await fetch(`${pythonUrl}/debug?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
