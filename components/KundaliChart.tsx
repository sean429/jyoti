'use client';

import { ChartData } from '@/lib/vedic-calculations';

interface Props {
  chart: ChartData;
  size?: number;
  division?: number;   // which D-chart to render (default 1 = rashi)
  label?: string;      // label shown in center below OM
}

const HOUSE_GRID: { [house: number]: [number, number] } = {
  12: [0, 0], 1: [1, 0], 2: [2, 0], 3: [3, 0],
  4: [3, 1],
  5: [3, 2],
  6: [3, 3], 7: [2, 3], 8: [1, 3], 9: [0, 3],
  10: [0, 2],
  11: [0, 1],
};

const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const PLANET_SHORT: Record<string, string> = {
  sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me',
  jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke',
};
const PLANET_COLOR: Record<string, string> = {
  sun: '#f59e0b', moon: '#c0c0c0', mars: '#ef4444', mercury: '#10b981',
  jupiter: '#f59e0b', venus: '#ec4899', saturn: '#a78bfa', rahu: '#94a3b8', ketu: '#94a3b8',
};

export default function KundaliChart({ chart, size = 360, division = 1, label }: Props) {
  const cell = size / 4;
  const dKey = `D${division}`;

  // Determine lagna sign for this divisional chart
  const lagnaSign = division === 1
    ? chart.lagnaSign
    : ((chart as any).divisionalLagnas?.[dKey]?.signIndex ?? chart.lagnaSign);

  // Build house->planets map for the selected divisional chart
  const housePlanets: Record<number, typeof chart.planets> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];
  chart.planets.forEach(p => {
    const house = division === 1
      ? p.house
      : ((p as any).divisional?.[dKey]?.house ?? p.house);
    if (housePlanets[house]) housePlanets[house].push(p);
  });

  function getSignForHouse(house: number): number {
    return (lagnaSign + house - 1) % 12;
  }

  function renderHouseCell(house: number) {
    const [col, row] = HOUSE_GRID[house];
    const x = col * cell;
    const y = row * cell;
    const signIdx = getSignForHouse(house);
    const planets = housePlanets[house] || [];
    const isLagna = house === 1;

    return (
      <g key={house}>
        <rect
          x={x + 0.5} y={y + 0.5}
          width={cell - 1} height={cell - 1}
          fill={isLagna ? 'rgba(34, 211, 238, 0.08)' : 'rgba(16, 16, 42, 0.8)'}
          stroke={isLagna ? '#22d3ee' : 'rgba(201, 168, 76, 0.25)'}
          strokeWidth={isLagna ? 1.5 : 0.75}
          rx={2}
        />
        <text x={x + 5} y={y + 13} fontSize={9}
          fill="rgba(201, 168, 76, 0.5)" fontFamily="Cinzel, serif" fontWeight="600">
          {house}
        </text>
        <text x={x + cell / 2} y={y + cell - 8} fontSize={8.5}
          fill={isLagna ? '#22d3ee' : 'rgba(201, 168, 76, 0.6)'}
          textAnchor="middle" fontFamily="Cinzel, serif">
          {SIGN_ABBR[signIdx]}
        </text>
        {isLagna && (
          <text x={x + cell - 5} y={y + 13} fontSize={8}
            fill="#22d3ee" textAnchor="end" fontFamily="Cinzel, serif" fontWeight="700">
            Lg
          </text>
        )}
        {planets.slice(0, 6).map((p, idx) => {
          const cols = Math.min(planets.length, 3);
          const pCol = idx % cols;
          const pRow = Math.floor(idx / cols);
          const px = x + 8 + pCol * ((cell - 16) / Math.max(cols - 1, 1));
          const py = y + 20 + pRow * 14;
          return (
            <text key={p.id}
              x={cols === 1 ? x + cell / 2 : px} y={py}
              fontSize={10}
              fill={PLANET_COLOR[p.id] || '#f0ebe0'}
              textAnchor={cols === 1 ? 'middle' : 'start'}
              fontFamily="Cinzel, serif" fontWeight="600">
              {PLANET_SHORT[p.id]}{p.isRetrograde ? '?' : ''}
            </text>
          );
        })}
      </g>
    );
  }

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        <rect x={1} y={1} width={size - 2} height={size - 2}
          fill="none" stroke="rgba(201, 168, 76, 0.4)" strokeWidth={1.5} rx={4} />
        <rect x={cell + 0.5} y={cell + 0.5} width={cell * 2 - 1} height={cell * 2 - 1}
          fill="rgba(8, 8, 24, 0.9)" stroke="rgba(201, 168, 76, 0.2)" strokeWidth={0.75} />
        <line x1={cell} y1={cell} x2={cell * 3} y2={cell * 3}
          stroke="rgba(201, 168, 76, 0.15)" strokeWidth={0.75} />
        <line x1={cell * 3} y1={cell} x2={cell} y2={cell * 3}
          stroke="rgba(201, 168, 76, 0.15)" strokeWidth={0.75} />
        <text x={size / 2} y={size / 2 + (label ? 2 : 8)} fontSize={28}
          fill="rgba(201, 168, 76, 0.25)" textAnchor="middle" fontFamily="serif">
          ?
        </text>
        {label && (
          <text x={size / 2} y={size / 2 + 22} fontSize={9}
            fill="rgba(201, 168, 76, 0.5)" textAnchor="middle" fontFamily="Cinzel, serif"
            fontWeight="600" letterSpacing="1">
            {label}
          </text>
        )}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => renderHouseCell(h))}
        {[[2, 2], [size - 2, 2], [2, size - 2], [size - 2, size - 2]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={3} fill="rgba(201, 168, 76, 0.4)" />
        ))}
      </svg>
    </div>
  );
}
