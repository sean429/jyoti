import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { chart, birthInfo, lang = 'en' } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' }, { status: 500 });
    }

    const lagnaNames = [
      'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
      'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
      'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
    ];

    const currentDasha = chart.dashas?.find((d: { isCurrent: boolean }) => d.isCurrent);
    const currentSubDasha = currentDasha?.subDashas?.find((s: { isCurrent: boolean }) => s.isCurrent);

    const planetList = chart.planets
      ?.map((p: { name: string; sign: string; house: number; nakshatra: string; isRetrograde: boolean }) =>
        `${p.name}: ${p.sign} (House ${p.house}, Nakshatra: ${p.nakshatra}${p.isRetrograde ? ', Retrograde' : ''})`
      ).join('\n');

    const isKorean = lang === 'ko';

    const prompt = isKorean
      ? `당신은 수천 년의 지식을 가진 베딕(인도) 점성술 전문가입니다. 아래 출생 차트 데이터를 바탕으로 상세하고 개인화된 베딕 운세 해석을 한국어로 제공해주세요.

**출생 정보:**
- 이름: ${birthInfo.name}
- 생년월일: ${birthInfo.date}
- 출생 시각: ${birthInfo.time}
- 출생지: ${birthInfo.place}

**차트 데이터:**
- 라그나 (상승궁): ${lagnaNames[chart.lagnaSign]} (${chart.lagna?.toFixed(2)}°)
- 아야남사 (라히리): ${chart.ayanamsa?.toFixed(4)}°

**행성 위치:**
${planetList}

**현재 다샤 (대운) 기간:**
- 마하다샤: ${currentDasha?.lord || '미상'} (${currentDasha?.startDate ? new Date(currentDasha.startDate).getFullYear() : ''}년 ~ ${currentDasha?.endDate ? new Date(currentDasha.endDate).getFullYear() : ''}년)
- 안타르다샤: ${currentSubDasha?.lord || '미상'}

다음 항목을 포함하여 풍부하고 개인화된 한국어 운세 해석을 제공해주세요:

1. **성격과 외모** (라그나와 라그나 주인 행성 기준)
2. **마음과 감정** (달의 별자리와 나크샤트라)
3. **영혼의 목적** (태양의 위치와 하우스)
4. **핵심 인생 테마** (주요 행성 배치)
5. **현재 대운 분석** (마하다샤와 안타르다샤의 영향)
6. **강점과 타고난 재능**
7. **도전과 성장 과제**
8. **현재 기간을 위한 지혜**

산스크리트 용어와 한국어 설명을 함께 사용하고, 따뜻하고 통찰력 있는 어조로 개인화된 해석을 작성해주세요.`
      : `You are a highly knowledgeable Vedic astrologer with deep wisdom. Provide a detailed, insightful, personalized Vedic astrology reading based on the following birth chart.

**Birth Information:**
- Name: ${birthInfo.name}
- Date: ${birthInfo.date}
- Time: ${birthInfo.time}
- Place: ${birthInfo.place}

**Chart Data:**
- Lagna (Ascendant): ${lagnaNames[chart.lagnaSign]} at ${chart.lagna?.toFixed(2)}°
- Ayanamsa (Lahiri): ${chart.ayanamsa?.toFixed(4)}°

**Planetary Positions:**
${planetList}

**Current Dasha Period:**
- Mahadasha: ${currentDasha?.lord || 'Unknown'} (${currentDasha?.startDate ? new Date(currentDasha.startDate).getFullYear() : ''} - ${currentDasha?.endDate ? new Date(currentDasha.endDate).getFullYear() : ''})
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
