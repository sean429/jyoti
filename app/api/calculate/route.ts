import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (!pythonUrl) {
    return NextResponse.json(
      { error: 'Python calculation service not configured. Set PYTHON_SERVICE_URL in Vercel environment variables. Deploy python-service/ to Render first.' },
      { status: 503 }
    );
  }
  try {
    const body = await req.json();
    const res = await fetch(`${pythonUrl}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Calculation service error: ${msg}` }, { status: 502 });
  }
}
