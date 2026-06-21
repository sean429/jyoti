import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (!pythonUrl) {
    return NextResponse.json(
      { error: 'Debug endpoint requires PYTHON_SERVICE_URL (local dev only).' },
      { status: 503 }
    );
  }
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${pythonUrl}/debug?${params}`);
  return NextResponse.json(await res.json(), { status: res.status });
}
