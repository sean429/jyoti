'use client';

import { useState } from 'react';
import { DashaData } from '@/lib/vedic-calculations';

const DASHA_COLORS: Record<string, string> = {
  Sun: '#f59e0b', Moon: '#c0c0c0', Mars: '#ef4444',
  Mercury: '#10b981', Jupiter: '#fbbf24', Venus: '#ec4899',
  Saturn: '#a78bfa', Rahu: '#94a3b8', Ketu: '#9ca3af',
};

function formatDate(d: Date | string) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatYears(y: number) {
  const yrs = Math.floor(y);
  const months = Math.round((y - yrs) * 12);
  if (months === 0) return `${yrs}y`;
  if (yrs === 0) return `${months}m`;
  return `${yrs}y ${months}m`;
}

interface Props { dashas: DashaData[] }

export default function DashaTable({ dashas }: Props) {
  const [expanded, setExpanded] = useState<number | null>(
    dashas.findIndex(d => d.isCurrent)
  );

  const currentDasha = dashas.find(d => d.isCurrent);
  const currentSub = currentDasha?.subDashas?.find(s => s.isCurrent);

  return (
    <div>
      {/* Current period highlight */}
      {currentDasha && (
        <div
          className="mb-4 p-4 rounded-xl"
          style={{
            background: `linear-gradient(135deg, rgba(201,168,76,0.08), rgba(${hexToRgb(DASHA_COLORS[currentDasha.lord])},0.1))`,
            border: '1px solid rgba(201,168,76,0.25)',
          }}
        >
          <p className="text-xs font-cinzel mb-2" style={{ color: 'var(--text-muted)' }}>CURRENT PERIOD</p>
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mahadasha</p>
              <p className="font-cinzel font-bold text-base" style={{ color: DASHA_COLORS[currentDasha.lord] }}>
                {currentDasha.lord}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {formatDate(currentDasha.startDate)} – {formatDate(currentDasha.endDate)}
              </p>
            </div>
            {currentSub && (
              <>
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>→</span>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Antardasha</p>
                  <p className="font-cinzel font-bold text-base" style={{ color: DASHA_COLORS[currentSub.lord] }}>
                    {currentSub.lord}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(currentSub.startDate)} – {formatDate(currentSub.endDate)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dasha timeline */}
      <div className="space-y-1">
        {dashas.map((dasha, idx) => {
          const color = DASHA_COLORS[dasha.lord] || '#c9a84c';
          const isOpen = expanded === idx;

          return (
            <div key={idx}>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(isOpen ? null : idx)}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    background: dasha.isCurrent
                      ? `rgba(${hexToRgb(color)}, 0.1)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${dasha.isCurrent ? `rgba(${hexToRgb(color)},0.3)` : 'rgba(201,168,76,0.1)'}`,
                  }}
                >
                  {/* Color dot */}
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: color,
                      boxShadow: dasha.isCurrent ? `0 0 8px ${color}` : 'none',
                    }}
                  />

                  {/* Lord name */}
                  <span
                    className="font-cinzel font-bold text-sm flex-shrink-0 w-20"
                    style={{ color: dasha.isCurrent ? color : 'var(--text)' }}
                  >
                    {dasha.lord}
                    {dasha.isCurrent && <span className="ml-1.5 text-[10px]" style={{ color }}>●</span>}
                  </span>

                  {/* Years */}
                  <span className="text-xs flex-shrink-0 w-12" style={{ color: 'var(--text-muted)' }}>
                    {formatYears(dasha.years)}
                  </span>

                  {/* Dates */}
                  <span className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(dasha.startDate)} – {formatDate(dasha.endDate)}
                  </span>

                  {/* Expand icon */}
                  <span className="text-xs" style={{ color: 'var(--gold-dim)' }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Sub-dashas */}
              {isOpen && (
                <div className="pl-6 mt-1 space-y-0.5">
                  {dasha.subDashas.map((sub, si) => (
                    <div
                      key={si}
                      className="flex items-center gap-3 px-3 py-1.5 rounded-md"
                      style={{
                        background: sub.isCurrent ? `rgba(${hexToRgb(DASHA_COLORS[sub.lord] || '#c9a84c')},0.08)` : 'transparent',
                        border: sub.isCurrent ? `1px solid rgba(${hexToRgb(DASHA_COLORS[sub.lord] || '#c9a84c')},0.2)` : '1px solid transparent',
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: DASHA_COLORS[sub.lord] || '#c9a84c', opacity: sub.isCurrent ? 1 : 0.5 }}
                      />
                      <span
                        className="font-cinzel text-xs flex-shrink-0 w-20"
                        style={{ color: sub.isCurrent ? (DASHA_COLORS[sub.lord] || 'var(--gold)') : 'var(--text-muted)' }}
                      >
                        {sub.lord}{sub.isCurrent && ' ●'}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
                        {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '201,168,76';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
