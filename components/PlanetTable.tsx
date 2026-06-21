'use client';

import { ChartData, PlanetData } from '@/lib/vedic-calculations';
import { SIGNS } from '@/lib/constants';

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mars: '♂', mercury: '☿',
  jupiter: '♃', venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#f59e0b', moon: '#c0c0c0', mars: '#ef4444', mercury: '#10b981',
  jupiter: '#fbbf24', venus: '#ec4899', saturn: '#a78bfa', rahu: '#94a3b8', ketu: '#94a3b8',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'rgba(239,68,68,0.15)', Earth: 'rgba(120,53,15,0.15)',
  Air: 'rgba(59,130,246,0.15)', Water: 'rgba(6,182,212,0.15)',
};

interface Props { chart: ChartData }

export default function PlanetTable({ chart }: Props) {
  const { planets, lagnaSign } = chart;

  const SIGN_NAMES = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
  ];

  const lagnaData = {
    id: 'lagna',
    name: 'Lagna',
    longitude: chart.lagna,
    signIndex: lagnaSign,
    sign: SIGN_NAMES[lagnaSign],
    degree: formatDegree(chart.lagna),
    house: 1,
    nakshatra: getNakshatra(chart.lagna),
    nakshatraLord: '',
    pada: 0,
    isRetrograde: false,
  };

  function getNakshatra(lon: number): string {
    const nakshatras = [
      'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
      'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
      'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
      'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
      'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
    ];
    return nakshatras[Math.floor(lon / (360 / 27))];
  }

  function formatDegree(lon: number): string {
    const d = Math.floor(lon % 30);
    const m = Math.floor(((lon % 30) - d) * 60);
    return `${d}°${m}'`;
  }

  function getSignInfo(signIdx: number) {
    return SIGNS[signIdx];
  }

  const allPlanets: (PlanetData | typeof lagnaData)[] = [lagnaData, ...planets];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
        <thead>
          <tr>
            {['Planet', 'Symbol', 'Sign', 'Deg', 'House', 'Nakshatra', 'Pada', 'Lord', 'R'].map(h => (
              <th
                key={h}
                className="text-xs px-3 py-2 text-left font-cinzel"
                style={{ color: 'var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allPlanets.map((planet) => {
            const signInfo = getSignInfo(planet.signIndex);
            const bgColor = signInfo ? ELEMENT_COLORS[signInfo.element] || 'transparent' : 'transparent';
            const isLagna = planet.id === 'lagna';

            return (
              <tr
                key={planet.id}
                style={{ background: bgColor }}
              >
                <td className="px-3 py-2 rounded-l-lg">
                  <span
                    className="font-cinzel text-xs font-semibold"
                    style={{ color: isLagna ? '#22d3ee' : (PLANET_COLORS[planet.id] || 'var(--text)') }}
                  >
                    {planet.name}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-base" style={{ color: isLagna ? '#22d3ee' : (PLANET_COLORS[planet.id] || 'var(--text)') }}>
                    {isLagna ? 'Asc' : (PLANET_SYMBOLS[planet.id] || '')}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1">
                    <span style={{ color: 'var(--gold-light)' }}>{signInfo?.symbol || ''}</span>
                    <span style={{ color: 'var(--text)' }}>{planet.sign}</span>
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDegree(planet.longitude)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-cinzel font-bold"
                    style={{
                      background: 'rgba(201,168,76,0.15)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(201,168,76,0.3)',
                    }}
                  >
                    {planet.house}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {'nakshatra' in planet ? planet.nakshatra : '—'}
                </td>
                <td className="px-3 py-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  {'pada' in planet && planet.pada > 0 ? planet.pada : '—'}
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {'nakshatraLord' in planet ? planet.nakshatraLord : '—'}
                </td>
                <td className="px-3 py-2 rounded-r-lg text-xs">
                  {planet.isRetrograde && (
                    <span className="font-bold" style={{ color: '#a78bfa' }}>R</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        {Object.entries(ELEMENT_COLORS).map(([el, color]) => (
          <span key={el} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }} />
            {el}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-bold" style={{ color: '#a78bfa' }}>R</span> = Retrograde
        </span>
      </div>
    </div>
  );
}
