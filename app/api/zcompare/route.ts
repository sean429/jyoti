// TEMPORARY model-comparison endpoint — sends the EXACT production reading
// prompt (imported from the interpret route) to a chosen model so we can judge
// quality faithfully. DELETE after testing.
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildReadingPrompt } from '../interpret/route';

export const maxDuration = 60;

async function callGemini(prompt: string) {
  const t = Date.now();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { maxOutputTokens: 8192, temperature: 0.8 } });
  const r = await model.generateContent(prompt);
  const text = r.response.text();
  return { text, chars: text.length, ms: Date.now() - t };
}
async function callDeepSeek(model: string, prompt: string, key: string) {
  const t = Date.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.8, max_tokens: 4000 }),
  });
  const raw = await res.text();
  if (!res.ok) return { error: `${res.status}: ${raw.slice(0, 200)}`, ms: Date.now() - t };
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content ?? '';
  return { text, chars: text.length, ms: Date.now() - t, usage: data.usage };
}

export async function POST(req: NextRequest) {
  // Gate the temp endpoint behind the master code so it can't be abused to burn
  // paid LLM calls while it lives.
  const gate = new URL(req.url).searchParams.get('k');
  if (!process.env.MASTER_CODE || gate !== process.env.MASTER_CODE.trim()) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const body = await req.json();
  const { chart, birthInfo, theme = null, lang = 'ko', provider = 'flash' } = body;
  const key = process.env.DeepSeek_api_key ?? process.env.DEEPSEEK_API_KEY ?? '';
  // theme with a premiumId + previewMode:false reproduces the full paid reading;
  // theme:null reproduces the free general reading.
  const prompt = buildReadingPrompt({ chart, birthInfo, theme, lang, previewMode: false });
  let result;
  if (provider === 'gemini') result = await callGemini(prompt).catch(e => ({ error: String(e).slice(0, 200) }));
  else if (provider === 'pro') result = await callDeepSeek('deepseek-v4-pro', prompt, key).catch(e => ({ error: String(e).slice(0, 200) }));
  else result = await callDeepSeek('deepseek-v4-flash', prompt, key).catch(e => ({ error: String(e).slice(0, 200) }));
  return NextResponse.json({ promptChars: prompt.length, result });
}
