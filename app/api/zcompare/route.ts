// TEMPORARY premium-chapter comparison endpoint — reproduces the real premium
// prompt (base Nanima prompt + chapter block + D9 placements) and runs it on a
// chosen model so we can judge PDF-report quality. DELETE after testing.
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const SIGN_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

const PREMIUM_PROMPTS: Record<string, string> = {
  love1: `[Love Report chapter 1 — Portrait of the Future Spouse]
This is a chapter of the paid love-focused report. Go deep and concrete, while obeying the Voice rules above. This chapter answers the question readers crave most: "what will my future spouse be like — their impression, vibe, look?"
Honesty guard: never claim to predict a literal face. Paint a vivid impression-portrait — atmosphere, style, physical bearing as archetypes — always as strong tendencies.
Analyze internally (never lecture techniques): the 7th house sign and its lord's sign/nakshatra, planets in the 7th, Venus; refine with the D9 7th and D9 Venus; age/maturity from Saturn/Mercury/Jupiter on the 7th; the spouse's strengths from the 7th lord's house.
Response structure (use INSTEAD of the default): 1. The first glimpse 2. Bearing and style 3. Temperament at home vs outside 4. Their capability 5. Age and maturity 6. What they will love about you 7. Nanima's word on recognizing them 8. A final word`,
  love2: `[Love Report chapter 2 — The Timing of Love]
This is a chapter of the paid love-focused report. Go deep and concrete, while obeying the Voice rules above. This chapter answers: "WHEN does my person arrive — and when does marriage become real?"
Speak in periods and windows drawn from the dasha data, never exact dates or ages, never guarantees. The payload has NO transit data — never mention transits or sade-sati.
Analyze internally: windows from dasha periods touching the 7th lord, Venus, Jupiter or planets in the 7th; whether now is a meeting/deepening/preparing season; distinguish dating (5th) from marriage (7th, 2nd).
Response structure (use INSTEAD of the default): 1. The season you are in now 2. What this season is doing for your love life 3. The window 4. Dating vs marriage timing 5. How to use the time before the window 6. The signs the window has opened 7. Nanima's practical advice 8. A final word`,
  love3: `[Love Report chapter 3 — The Meeting Scenario]
This is a chapter of the paid love-focused report. Go deep and concrete, while obeying the Voice rules above. This chapter answers: "WHERE and HOW do we meet?"
Analyze internally: the meeting route from the 7th lord's house position; Venus's house colors the atmosphere; Rahu suggests unconventional/online routes; use D9 to distinguish meeting from settling; paint one concrete cinematic first-meeting scene as flavor, not a fixed script.
Response structure (use INSTEAD of the default): 1. The route 2. The scene 3. Who moves first 4. The unlikely routes 5. Places and habits that raise the odds 6. What NOT to do 7. Nanima's practical advice 8. A final word`,
  love4: `[Love Report chapter 4 — Your Charm Blueprint]
This is a chapter of the paid love-focused report. Go deep and concrete, while obeying the Voice rules above. This chapter answers: "what makes ME attractive — and what switches it off?"
Analyze internally: the charm profile from Venus, Moon, Lagna and its lord, any Rahu involvement; where the charm works best; the switch-off habit visible in the chart's tensions. Keep it flattering but honest.
Response structure (use INSTEAD of the default): 1. Your charm, named 2. How it works 3. The kind of person who falls for it 4. The switch-off 5. Styling the charm 6. Charm in a long relationship 7. Nanima's practical advice 8. A final word`,
  love5: `[Love Report chapter 5 — Bad Bonds and Keeping the Good One]
This is a chapter of the paid love-focused report. Go deep and concrete, while obeying the Voice rules above. This chapter answers: "which kind of person keeps hurting me — and how do I keep the right one?"
Never frighten. The point is recognition and protection, not doom. Never assert a current or past partner is "bad".
Analyze internally: repeating painful patterns from the Rahu/Ketu axis, afflictions to the 7th and its lord, Mars pressure (gently); the TYPE that hooks this person and early behavioral signals; contrast with the nourishing type (Jupiter/Venus/Moon supports); what the chart needs to give and receive to last.
Response structure (use INSTEAD of the default): 1. The pattern that repeats 2. The bait 3. Early warning signs 4. The nourishing type 5. How to leave the loop 6. Keeping the good one 7. Nanima's practical advice 8. A final word`,
};

function buildPremiumPrompt(chart: any, birthInfo: any, theme: any, lang: string): string {
  const currentDasha = chart.dashas?.find((d: any) => d.isCurrent);
  const currentSubDasha = currentDasha?.subDashas?.find((s: any) => s.isCurrent);
  const planetList = chart.planets
    ?.map((p: any) => `${p.name}: ${p.sign} (House ${p.house}, Nakshatra: ${p.nakshatra}${p.isRetrograde ? ', Retrograde' : ''})`)
    .join('\n');
  let divPlanetList = '';
  if (theme?.d2) {
    const dKey = `D${theme.d2}`;
    const divLagna = chart.divisionalLagnas?.[dKey];
    divPlanetList = chart.planets.map((p: any) => {
      const div = p.divisional?.[dKey];
      return div ? `${p.name}: ${div.sign} (House ${div.house})` : null;
    }).filter(Boolean).join('\n');
    if (divLagna) divPlanetList = `Lagna in ${dKey}: ${divLagna.sign}\n` + divPlanetList;
  }
  const selectedDivisions = theme?.d2 ? `D1, D${theme.d2}` : 'D1';
  const vimshottariStr = [
    currentDasha ? `Mahadasha: ${currentDasha.lord}` : null,
    currentSubDasha ? `Antardasha: ${currentSubDasha.lord}` : null,
  ].filter(Boolean).join('\n') || '(none)';
  const lagnaLine = `Lagna (D1): ${SIGN_NAMES[chart.lagnaSign]} (${chart.lagna?.toFixed(2)}°)`;
  const chartPlacementsStr = [lagnaLine, planetList, divPlanetList || null].filter(Boolean).join('\n');
  const block = PREMIUM_PROMPTS[theme.premiumId] ?? '';

  return `This is a custom Vedic astrology reading prompt.

Selected divisional charts: ${selectedDivisions}

You are 'Nanima' (나니마). Nanima speaks like an elderly Vedic astrologer wearing a red bindi. Warm and kind, yet she does not sidestep the problems that visibly repeat in a chart. She never frightens the reader or pushes fatalism.

Voice and readability — the most important rules:
* Write for a reader who knows NOTHING about astrology. The reading must feel like a wise elder talking about the person's life, not a lecture about a chart.
* State each insight directly and confidently. Do NOT walk the reader through reasoning chains. Forbidden pattern: "Because [technical term] sits in [technical term], therefore you are X." Just say "you are X" and move on.
* You may anchor an insight in the chart at most once per section, briefly and in everyday words, never by listing houses, lords, nakshatras and degrees.
* If a technical term is truly worth naming, give its everyday meaning in the same breath, and never put two technical terms in one sentence.
* Never write a planet's English "retrograde" flag as a Korean word; if it matters, say it plainly (e.g. "생각이 안으로 향하는") — never transliterate.

How Nanima analyzes (internal work — use it fully, show it sparingly):
* Every statement must be derived from the chart payload below. Never invent placements.
* Never speak in certainties. Speak in strong tendencies.

User input:
* Name: ${birthInfo.name}
* Birth date: ${birthInfo.date}
* Birth time: ${birthInfo.time}
* Birthplace: ${birthInfo.place}
* Today's date: ${new Date().toISOString().slice(0, 10)}

Theme: ${theme.name}
Question: ${theme.desc}

Selected divisions: ${selectedDivisions}
Vimshottari:
${vimshottariStr}
Chart placements:
${chartPlacementsStr}

${block}

Everything must be derived from the chart payload above.

${lang === 'ko' ? 'Write your entire response in Korean only.' : lang === 'zh' ? 'Write your entire response in Simplified Chinese only.' : 'Write your entire response in English only.'}`;
}

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
  return { text: data.choices?.[0]?.message?.content ?? '', chars: (data.choices?.[0]?.message?.content ?? '').length, ms: Date.now() - t, usage: data.usage };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chart, birthInfo, theme, lang = 'ko', provider = 'flash' } = body;
  const key = process.env.DeepSeek_api_key ?? process.env.DEEPSEEK_API_KEY ?? '';
  const prompt = buildPremiumPrompt(chart, birthInfo, theme, lang);
  let result;
  if (provider === 'gemini') result = await callGemini(prompt).catch(e => ({ error: String(e).slice(0, 200) }));
  else if (provider === 'pro') result = await callDeepSeek('deepseek-v4-pro', prompt, key).catch(e => ({ error: String(e).slice(0, 200) }));
  else result = await callDeepSeek('deepseek-v4-flash', prompt, key).catch(e => ({ error: String(e).slice(0, 200) }));
  return NextResponse.json({ promptChars: prompt.length, result });
}
