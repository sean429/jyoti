import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { chart, birthInfo, lang = 'en', theme } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' }, { status: 500 });
    }

    const SIGN_NAMES = [
      'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
      'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
      'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
    ];

    const currentDasha = chart.dashas?.find((d: { isCurrent: boolean }) => d.isCurrent);
    const currentSubDasha = currentDasha?.subDashas?.find((s: { isCurrent: boolean }) => s.isCurrent);

    // D1 planet list
    const planetList = chart.planets
      ?.map((p: { name: string; sign: string; house: number; nakshatra: string; isRetrograde: boolean }) =>
        `${p.name}: ${p.sign} (House ${p.house}, Nakshatra: ${p.nakshatra}${p.isRetrograde ? ', Retrograde' : ''})`
      ).join('\n');

    // Divisional chart planet list (when theme provided)
    let divPlanetList = '';
    if (theme?.d2) {
      const dKey = `D${theme.d2}`;
      const divLagna = (chart as any).divisionalLagnas?.[dKey];
      divPlanetList = chart.planets
        ?.map((p: any) => {
          const div = p.divisional?.[dKey];
          if (!div) return null;
          return `${p.name}: ${div.sign} (House ${div.house})`;
        })
        .filter(Boolean)
        .join('\n');
      if (divLagna) {
        divPlanetList = `Lagna in ${dKey}: ${divLagna.sign}\n` + divPlanetList;
      }
    }

    const isKorean = lang === 'ko';

    let prompt: string;

    if (isKorean) {
      if (theme) {
        // Theme-specific Korean prompt
        prompt = `??? ?? ?? ??? ?? ??(??) ??? ??????.
?? ?? ?? ???? ?? ??? ???? ?? ?? ??? ??? ??????.

**?? ??:**
- ??: ${birthInfo.name}
- ????: ${birthInfo.date}
- ?? ??: ${birthInfo.time}
- ???: ${birthInfo.place}

**?? ??: ${theme.name}**
${theme.desc}

**?? ?? (D1 ??) ?? ??:**
??? (???): ${SIGN_NAMES[chart.lagnaSign]} (${chart.lagna?.toFixed(2)}?)
???? (???): ${chart.ayanamsa?.toFixed(4)}?

${planetList}

**D${theme.d2} ?? ?? ?? ??:**
${divPlanetList}

**?? ?? ??:**
- ????: ${currentDasha?.lord || '??'} (${currentDasha?.startDate ? new Date(currentDasha.startDate).getFullYear() : ''}? ~ ${currentDasha?.endDate ? new Date(currentDasha.endDate).getFullYear() : ''}?)
- ?????: ${currentSubDasha?.lord || '??'}

?? ??? ???? '${theme.name}' ??? ??? ?? ??? ??????:

1. **${theme.name}? ?? ???** (D1? D${theme.d2}? ?? ??)
2. **D1 ?? ???? ??? ??** (? ??? ??? ?? ???)
3. **D${theme.d2} ?? ??? ?? ??** (???? ???? ???)
4. **? ??? ??? ???? ??? ??**
5. **?? ?? ???? ???**
6. **???? ??? ?? ??**

????? ??? ??? ??? ?? ????, ???? ??? ?? ??? ???? ??? ??????.`;
      } else {
        // General Korean prompt
        prompt = `??? ?? ?? ??? ?? ??(??) ??? ??????. ?? ?? ?? ???? ???? ???? ???? ?? ?? ??? ???? ??????.

**?? ??:**
- ??: ${birthInfo.name}
- ????: ${birthInfo.date}
- ?? ??: ${birthInfo.time}
- ???: ${birthInfo.place}

**?? ???:**
- ??? (???): ${SIGN_NAMES[chart.lagnaSign]} (${chart.lagna?.toFixed(2)}?)
- ???? (???): ${chart.ayanamsa?.toFixed(4)}?

**?? ??:**
${planetList}

**?? ?? (??) ??:**
- ????: ${currentDasha?.lord || '??'} (${currentDasha?.startDate ? new Date(currentDasha.startDate).getFullYear() : ''}? ~ ${currentDasha?.endDate ? new Date(currentDasha.endDate).getFullYear() : ''}?)
- ?????: ${currentSubDasha?.lord || '??'}

?? ??? ???? ???? ???? ??? ?? ??? ??????:

1. **??? ??** (???? ??? ?? ?? ??)
2. **??? ??** (?? ???? ?????)
3. **??? ??** (??? ??? ???)
4. **?? ?? ??** (?? ?? ??)
5. **?? ?? ??** (????? ?????? ??)
6. **??? ??? ??**
7. **??? ?? ??**
8. **?? ??? ?? ??**

????? ??? ??? ??? ?? ????, ???? ??? ?? ??? ???? ??? ??????.`;
      }
    } else {
      if (theme) {
        // Theme-specific English prompt
        prompt = `You are a highly knowledgeable Vedic astrologer. Provide a focused, insightful reading based on the theme below.

**Birth Information:**
- Name: ${birthInfo.name}
- Date: ${birthInfo.date} | Time: ${birthInfo.time} | Place: ${birthInfo.place}

**Theme: ${theme.name}**
${theme.desc}

**D1 Rashi Chart:**
Lagna: ${SIGN_NAMES[chart.lagnaSign]} at ${chart.lagna?.toFixed(2)}?
Ayanamsa (Lahiri): ${chart.ayanamsa?.toFixed(4)}?
${planetList}

**D${theme.d2} Divisional Chart:**
${divPlanetList}

**Current Dasha:**
Mahadasha: ${currentDasha?.lord || 'Unknown'} (${currentDasha?.startDate ? new Date(currentDasha.startDate).getFullYear() : ''}-${currentDasha?.endDate ? new Date(currentDasha.endDate).getFullYear() : ''})
Antardasha: ${currentSubDasha?.lord || 'Unknown'}

Provide a deep interpretation focused on '${theme.name}':
1. **Core Energy of this Theme** (synthesis of D1 + D${theme.d2})
2. **D1 Rashi Chart Patterns** (planets relevant to this life area)
3. **D${theme.d2} Divisional Chart Insights** (deeper potentials and nuances)
4. **Combined Chart Reading** (what the combination reveals)
5. **Current Dasha Influence** on this theme
6. **Practical Guidance**

Use Sanskrit and English terminology. Be specific and personalized.`;
      } else {
        // General English prompt
        prompt = `You are a highly knowledgeable Vedic astrologer with deep wisdom. Provide a detailed, insightful, personalized Vedic astrology reading based on the following birth chart.

**Birth Information:**
- Name: ${birthInfo.name}
- Date: ${birthInfo.date} | Time: ${birthInfo.time} | Place: ${birthInfo.place}

**Chart Data:**
- Lagna (Ascendant): ${SIGN_NAMES[chart.lagnaSign]} at ${chart.lagna?.toFixed(2)}?
- Ayanamsa (Lahiri): ${chart.ayanamsa?.toFixed(4)}?

**Planetary Positions:**
${planetList}

**Current Dasha Period:**
- Mahadasha: ${currentDasha?.lord || 'Unknown'} (${currentDasha?.startDate ? new Date(currentDasha.startDate).getFullYear() : ''}-${currentDasha?.endDate ? new Date(currentDasha.endDate).getFullYear() : ''})
- Antardasha: ${currentSubDasha?.lord || 'Unknown'}

Please provide a rich interpretation covering:
1. **Personality & Appearance** (Lagna and its lord)
2. **Mind & Emotions** (Moon sign and nakshatra)
3. **Soul Purpose** (Sun sign and house)
4. **Key Life Themes** (dominant planetary placements)
5. **Current Period** (Mahadasha and Antardasha influences)
6. **Strengths & Gifts**
7. **Challenges & Growth**
8. **Guidance for Now**

Use Sanskrit and English terminology together. Be specific and personalized, not generic.`;
      }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 8192, temperature: 0.8 },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ interpretation: text });
  } catch (err) {
    console.error('Interpretation error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Interpretation failed: ${msg}` }, { status: 500 });
  }
}
