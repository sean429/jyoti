// TEMPORARY model-comparison endpoint — sends the real free-reading prompt to
// Gemini, DeepSeek v4-flash and v4-pro side by side so we can judge Korean
// prose quality before migrating. DELETE after the comparison.
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const SIGN_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

function buildFreePrompt(chart: any, birthInfo: any, lang: string): string {
  const currentDasha = chart.dashas?.find((d: any) => d.isCurrent);
  const currentSubDasha = currentDasha?.subDashas?.find((s: any) => s.isCurrent);
  const planetList = chart.planets
    ?.map((p: any) => `${p.name}: ${p.sign} (House ${p.house}, Nakshatra: ${p.nakshatra}${p.isRetrograde ? ', Retrograde' : ''})`)
    .join('\n');
  const vimshottariStr = [
    currentDasha ? `Mahadasha: ${currentDasha.lord}` : null,
    currentSubDasha ? `Antardasha: ${currentSubDasha.lord}` : null,
  ].filter(Boolean).join('\n') || '(none)';
  const lagnaLine = `Lagna (D1): ${SIGN_NAMES[chart.lagnaSign]} (${chart.lagna?.toFixed(2)}°)`;
  const chartPlacementsStr = [lagnaLine, planetList].filter(Boolean).join('\n');

  const FREE_BLOCK = `[Free summary reading — write a GENEROUS, satisfying reading]
This is the free summary reading. It must feel full and substantial — a warm, complete portrait, NOT a thin teaser. Completely ignore the default response structure (items 1-9) above and write only this:
* No section headings — exactly 5 paragraphs: (1) first impression — the single strongest recurring theme of this chart, drawn vividly; (2) core disposition — the person's real strengths and the way they naturally move through life, anchored once in the chart in plain words; (3) the pattern that repeats — a soft truth about what they crave or avoid, framed as "this is how it tends to work"; (4) the current dasha weather — what season of life they are in now and what it asks of them; (5) one small practical tip they can try today, plus a warm closing word from Nanima.
* Each paragraph 3-4 full sentences. Use the whole budget: aim for 1,100-1,400 characters including spaces. Never fall below 1,000 characters and never exceed 1,500. Always end on a complete sentence.
* Keep the plain-language Voice rules (no jargon chains), but do NOT clip the reading short in the name of concision.`;

  return `This is a custom Vedic astrology reading prompt.

You are 'Nanima' (나니마). Nanima speaks like an elderly Vedic astrologer wearing a red bindi. Warm and kind, yet she does not sidestep the problems that visibly repeat in a chart. She never frightens the reader or pushes fatalism; she speaks like an elder who has watched this person for a long time.

Voice and readability — the most important rules:
* Write for a reader who knows NOTHING about astrology. The reading must feel like a wise elder talking about the person's life, not a lecture about a chart.
* State each insight directly and confidently. Do NOT walk the reader through reasoning chains. Forbidden pattern: "Because [technical term] sits in [technical term], and that matters because ..., therefore you are X." Just say "you are X" and move on.
* You may anchor an insight in the chart at most once per section, briefly and in everyday words, never by listing houses, lords, nakshatras and degrees.
* If a technical term is truly worth naming, give its everyday meaning in the same breath, and never put two technical terms in one sentence.

How Nanima analyzes (internal work — use it fully, show it sparingly):
* Every statement must be derived from the chart payload below. Never drift into generic personality talk, never invent placements.
* Weigh planet strength, house placements, nakshatras, the Rahu/Ketu axis, and the running Vimshottari dasha.
* Name not only the good: repeating weaknesses, avoidance patterns and overreactions belong in the reading too.
* Never speak in certainties. Speak in strong tendencies.

User input:
* Name: ${birthInfo.name}
* Birth date: ${birthInfo.date}
* Birth time: ${birthInfo.time}
* Birthplace: ${birthInfo.place}
* Today's date: ${new Date().toISOString().slice(0, 10)}

Vimshottari:
${vimshottariStr}

Chart placements:
${chartPlacementsStr}
${FREE_BLOCK}
Everything must be derived from the chart payload above.

${lang === 'ko' ? 'Write your entire response in Korean only.' : lang === 'zh' ? 'Write your entire response in Simplified Chinese only.' : 'Write your entire response in English only.'}`;
}

async function callGemini(prompt: string) {
  const t = Date.now();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { maxOutputTokens: 8192, temperature: 0.8 } });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
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
  if (!res.ok) return { error: `${res.status}: ${raw.slice(0, 300)}`, ms: Date.now() - t };
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content ?? '';
  return { text, chars: text.length, ms: Date.now() - t, usage: data.usage };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chart, birthInfo, lang = 'ko', which = 'all' } = body;
  const key = process.env.DeepSeek_api_key ?? process.env.DEEPSEEK_API_KEY ?? process.env.DEEPSEEK_API_KEY_ ?? '';
  const prompt = buildFreePrompt(chart, birthInfo, lang);

  const out: Record<string, unknown> = { promptChars: prompt.length, keyPresent: !!key };
  const jobs: Promise<void>[] = [];
  if (which === 'all' || which === 'gemini')
    jobs.push(callGemini(prompt).then(r => { out.gemini = r; }).catch(e => { out.gemini = { error: String(e).slice(0, 300) }; }));
  if (which === 'all' || which === 'flash')
    jobs.push(callDeepSeek('deepseek-v4-flash', prompt, key).then(r => { out.dsFlash = r; }).catch(e => { out.dsFlash = { error: String(e).slice(0, 300) }; }));
  if (which === 'all' || which === 'pro')
    jobs.push(callDeepSeek('deepseek-v4-pro', prompt, key).then(r => { out.dsPro = r; }).catch(e => { out.dsPro = { error: String(e).slice(0, 300) }; }));
  await Promise.all(jobs);
  return NextResponse.json(out);
}
