'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

export interface BirthInfo {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  utcOffset: number;
  place: string;
}

interface Props {
  onSubmit: (info: BirthInfo) => void;
  loading: boolean;
}

interface GeoResult {
  name: string;
  lat: number;
  lon: number;
}

export default function BirthChartFormKo({ onSubmit, loading }: Props) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeoResult | null>(null);
  const [utcOffset, setUtcOffset] = useState(9); // Korea default KST
  const [geoLoading, setGeoLoading] = useState(false);
  const [manualLatLon, setManualLatLon] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cityQuery || manualLatLon) { setGeoResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(cityQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) setGeoResults(data.slice(0, 5));
      } catch { /* ignore */ }
      setGeoLoading(false);
    }, 600);
  }, [cityQuery, manualLatLon]);

  function selectPlace(place: GeoResult) {
    setSelectedPlace(place);
    setCityQuery(place.name.split(',')[0].trim());
    setGeoResults([]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time ? time.split(':').map(Number) : [12, 0];
    const lat = manualLatLon ? parseFloat(manualLat) : (selectedPlace?.lat ?? 37.5665);
    const lon = manualLatLon ? parseFloat(manualLon) : (selectedPlace?.lon ?? 126.9780);
    const placeName = manualLatLon
      ? `${manualLat}°N, ${manualLon}°E`
      : (selectedPlace ? cityQuery : '서울 (기본값)');

    onSubmit({
      name: name || '탐구자',
      year: y, month: m, day: d,
      hour: h, minute: min || 0,
      latitude: lat,
      longitude: lon,
      utcOffset,
      place: placeName,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-cinzel text-gold-solid mb-2">이름</label>
        <input
          className="input-vedic"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-cinzel text-gold-solid mb-2">생년월일 *</label>
          <input
            type="date"
            className="input-vedic"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            max="2030-12-31"
            min="1900-01-01"
          />
        </div>
        <div>
          <label className="block text-sm font-cinzel text-gold-solid mb-2">출생 시각</label>
          <input
            type="time"
            className="input-vedic"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>모르면 비워두세요 (정오 기준)</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-cinzel text-gold-solid">출생지 *</label>
          <button
            type="button"
            onClick={() => { setManualLatLon(v => !v); setGeoResults([]); }}
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {manualLatLon ? '↩ 도시 검색' : '⚙ 좌표 직접 입력'}
          </button>
        </div>

        {!manualLatLon ? (
          <div className="relative">
            <input
              className="input-vedic"
              placeholder="예: 서울, 대한민국 / Seoul, Korea"
              value={cityQuery}
              onChange={e => { setCityQuery(e.target.value); setSelectedPlace(null); }}
            />
            {geoLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--gold)' }} />
              </div>
            )}
            {geoResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
                {geoResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
                    onClick={() => selectPlace(r)}
                  >
                    {r.name.split(',').slice(0, 2).join(',')}
                  </button>
                ))}
              </div>
            )}
            {selectedPlace && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                ✓ {selectedPlace.lat.toFixed(4)}°N, {selectedPlace.lon.toFixed(4)}°E
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input className="input-vedic" placeholder="위도 (예: 37.5665)" value={manualLat} onChange={e => setManualLat(e.target.value)} required={manualLatLon} />
            <input className="input-vedic" placeholder="경도 (예: 126.9780)" value={manualLon} onChange={e => setManualLon(e.target.value)} required={manualLatLon} />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-cinzel text-gold-solid mb-2">시간대 (UTC 오프셋)</label>
        <select className="input-vedic" value={utcOffset} onChange={e => setUtcOffset(parseFloat(e.target.value))}>
          <option value={9}>UTC+9:00 (KST — 한국 표준시) ★</option>
          <option value={8}>UTC+8:00 (CST/SGT)</option>
          <option value={7}>UTC+7:00 (ICT)</option>
          <option value={5.5}>UTC+5:30 (IST — 인도)</option>
          <option value={0}>UTC±0 (GMT)</option>
          <option value={-5}>UTC-5:00 (EST)</option>
          <option value={-8}>UTC-8:00 (PST)</option>
          <option value={1}>UTC+1:00 (CET)</option>
          <option value={2}>UTC+2:00 (EET)</option>
          <option value={3}>UTC+3:00 (MSK)</option>
          <option value={-4}>UTC-4:00</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn-gold w-full text-base"
        disabled={loading || !date || (!selectedPlace && !manualLatLon && !cityQuery)}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1a0f00' }} />
            차트 계산 중...
          </span>
        ) : '✦ 내 쿤달리 차트 보기 ✦'}
      </button>
    </form>
  );
}
