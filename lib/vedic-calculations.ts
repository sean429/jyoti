import { NAKSHATRAS, VIMSHOTTARI_SEQUENCE } from './constants';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function toRad(d: number) { return d * DEG2RAD; }
function toDeg(r: number) { return r * RAD2DEG; }
function norm360(d: number) { return ((d % 360) + 360) % 360; }

export function julianDay(year: number, month: number, day: number, hour = 0, minute = 0, utcOffset = 0): number {
  const utHour = hour - utcOffset;
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    utHour / 24.0 +
    minute / 1440.0 +
    B - 1524.5
  );
}

function julianCenturies(jd: number) {
  return (jd - 2451545.0) / 36525.0;
}

// Lahiri ayanamsa (Chitrapaksha) — standard for Indian astrology
function getLahiriAyanamsa(T: number): number {
  return 23.85472 + T * 1.3958 / 100;
}

function sunLongitude(T: number): number {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = toRad(M);
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const theta = L0 + C;
  const omega = norm360(125.04 - 1934.136 * T);
  return norm360(theta - 0.00569 - 0.00478 * Math.sin(toRad(omega)));
}

function moonLongitude(T: number): number {
  const Lp = norm360(218.3165 + 481267.8813 * T);
  const D = toRad(norm360(297.85036 + 445267.11148 * T - 0.0019142 * T * T + T * T * T / 189474));
  const M = toRad(norm360(357.52772 + 35999.05034 * T - 0.0001603 * T * T));
  const Mp = toRad(norm360(134.96298 + 477198.867398 * T + 0.0086972 * T * T));
  const F = toRad(norm360(93.27191 + 483202.017538 * T - 0.0036825 * T * T));

  const dL =
    6288774 * Math.sin(Mp) +
    1274027 * Math.sin(2 * D - Mp) +
    658314 * Math.sin(2 * D) +
    213618 * Math.sin(2 * Mp) -
    185116 * Math.sin(M) -
    114332 * Math.sin(2 * F) +
    58793 * Math.sin(2 * D - 2 * Mp) +
    57066 * Math.sin(2 * D - M - Mp) +
    53322 * Math.sin(2 * D + Mp) +
    45758 * Math.sin(2 * D - M) -
    40923 * Math.sin(M - Mp) -
    34720 * Math.sin(D) -
    30383 * Math.sin(M + Mp) +
    15327 * Math.sin(2 * D - 2 * F) -
    12528 * Math.sin(Mp + 2 * F) +
    10980 * Math.sin(Mp - 2 * F) +
    10675 * Math.sin(4 * D - Mp) +
    10034 * Math.sin(3 * Mp) +
    8548 * Math.sin(4 * D - 2 * Mp) -
    7888 * Math.sin(2 * D + M - Mp) -
    6766 * Math.sin(2 * D + M) -
    5163 * Math.sin(D - Mp);

  return norm360(Lp + dL / 1e6);
}

function moonNode(T: number): number {
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
}

function planetLongitude(planet: string, T: number): number {
  const d = T * 36525;
  const data: Record<string, [number, number, number, number]> = {
    // [mean longitude epoch, dL/day, eccentricity, argument of perihelion]
    mercury: [252.250906, 4.092337, 0.205630, 77.45645],
    venus: [181.979801, 1.602136, 0.006773, 131.56370],
    mars: [355.453094, 0.524039, 0.093412, 336.04084],
    jupiter: [34.396441, 0.083086, 0.048393, 14.75385],
    saturn: [50.077444, 0.033459, 0.054151, 92.43194],
  };
  const el = data[planet];
  if (!el) return 0;
  const L = norm360(el[0] + el[1] * d);
  const M = norm360(L - el[3]);
  const e = el[2];
  const Mr = toRad(M);
  const C = toDeg(
    (2 * e - (e * e * e) / 4) * Math.sin(Mr) +
    (5 * e * e / 4) * Math.sin(2 * Mr) +
    (13 * e * e * e / 12) * Math.sin(3 * Mr)
  );
  return norm360(L + C);
}

function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  const T = julianCenturies(jd);
  const eps = 23.439291111 - 0.013004167 * T - 0.000001639 * T * T + 0.000000503 * T * T * T;
  const epsR = toRad(eps);
  const GMST = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0);
  const LMST = norm360(GMST + longitude);
  const ramcR = toRad(LMST);
  const latR = toRad(latitude);
  const ascLon = norm360(
    toDeg(Math.atan2(
      Math.cos(ramcR),
      -(Math.sin(ramcR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR))
    ))
  );
  return ascLon;
}

function getMidheaven(jd: number, longitude: number): number {
  const T = julianCenturies(jd);
  const eps = 23.439291111 - 0.013004167 * T;
  const epsR = toRad(eps);
  const GMST = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const LMST = norm360(GMST + longitude);
  const ramcR = toRad(LMST);
  return norm360(toDeg(Math.atan2(Math.sin(ramcR), Math.cos(ramcR) * Math.cos(epsR))));
}

export function getSignIndex(lon: number): number {
  return Math.floor(lon / 30);
}

export function getNakshatra(lon: number) {
  const idx = Math.floor(lon / (360 / 27));
  const nakshatra = NAKSHATRAS[idx];
  const start = (360 / 27) * idx;
  const fraction = (lon - start) / (360 / 27);
  const pada = Math.floor(fraction * 4) + 1;
  return { ...nakshatra, pada };
}

export function getHouseNumber(planetSign: number, lagnaSign: number): number {
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

export interface PlanetData {
  id: string;
  name: string;
  longitude: number;
  signIndex: number;
  sign: string;
  degree: string;
  house: number;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  isRetrograde: boolean;
}

export interface ChartData {
  lagna: number;
  lagnaSign: number;
  midheaven: number;
  planets: PlanetData[];
  ayanamsa: number;
  dashas: DashaData[];
}

export interface DashaData {
  lord: string;
  startDate: Date;
  endDate: Date;
  years: number;
  isCurrent: boolean;
  subDashas: SubDashaData[];
}

export interface SubDashaData {
  lord: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

function isRetrograde(planet: string, T: number): boolean {
  const d1 = planetLongitude(planet, T);
  const d2 = planetLongitude(planet, T + 1 / 36525);
  let diff = d2 - d1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function degreesToDMS(deg: number): string {
  const sign = deg < 0 ? '-' : '';
  const abs = Math.abs(deg);
  const d = Math.floor(abs) % 30;
  const mRaw = (abs % 1) * 60;
  const m = Math.floor(mRaw);
  const s = Math.floor((mRaw % 1) * 60);
  return `${sign}${d}°${m}'${s}"`;
}

export function calculateDashas(moonLon: number, birthDate: Date): DashaData[] {
  const nakshatraIndex = Math.floor(moonLon / (360 / 27));
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const lordIndex = VIMSHOTTARI_SEQUENCE.findIndex(v => v.lord === nakshatra.lord);

  const nakshatraStart = (360 / 27) * nakshatraIndex;
  const fractionElapsed = (moonLon - nakshatraStart) / (360 / 27);
  const remainingFraction = 1 - fractionElapsed;

  const dashas: DashaData[] = [];
  let currentDate = new Date(birthDate);
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const vi = (lordIndex + i) % 9;
    const dasha = VIMSHOTTARI_SEQUENCE[vi];
    const durationYears = i === 0 ? dasha.years * remainingFraction : dasha.years;
    const durationMs = durationYears * 365.25 * 24 * 60 * 60 * 1000;
    const endDate = new Date(currentDate.getTime() + durationMs);
    const isCurrent = now >= currentDate && now < endDate;

    // Calculate sub-dashas (antardashas)
    const subDashas: SubDashaData[] = [];
    let subStart = new Date(currentDate);
    for (let j = 0; j < 9; j++) {
      const svi = (vi + j) % 9;
      const subDasha = VIMSHOTTARI_SEQUENCE[svi];
      const subFraction = subDasha.years / 120;
      const subDurationMs = durationMs * subFraction;
      const subEnd = new Date(subStart.getTime() + subDurationMs);
      subDashas.push({
        lord: subDasha.lord,
        startDate: new Date(subStart),
        endDate: subEnd,
        isCurrent: now >= subStart && now < subEnd,
      });
      subStart = subEnd;
    }

    dashas.push({
      lord: dasha.lord,
      startDate: new Date(currentDate),
      endDate,
      years: durationYears,
      isCurrent,
      subDashas,
    });
    currentDate = endDate;
  }

  return dashas;
}

export function calculateChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  latitude: number, longitude: number,
  utcOffset: number
): ChartData {
  const jd = julianDay(year, month, day, hour, minute, utcOffset);
  const T = julianCenturies(jd);
  const ayanamsa = getLahiriAyanamsa(T);

  const tropicalPlanets: Record<string, number> = {
    sun: sunLongitude(T),
    moon: moonLongitude(T),
    mars: planetLongitude('mars', T),
    mercury: planetLongitude('mercury', T),
    jupiter: planetLongitude('jupiter', T),
    venus: planetLongitude('venus', T),
    saturn: planetLongitude('saturn', T),
  };

  const rahuTropical = moonNode(T);
  tropicalPlanets.rahu = rahuTropical;
  tropicalPlanets.ketu = norm360(rahuTropical + 180);

  const ascTropical = calculateAscendant(jd, latitude, longitude);
  const mcTropical = getMidheaven(jd, longitude);

  const lagnaLon = norm360(ascTropical - ayanamsa);
  const mcLon = norm360(mcTropical - ayanamsa);
  const lagnaSignIndex = getSignIndex(lagnaLon);

  const SIGN_NAMES = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
  ];

  const PLANET_NAMES: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury',
    jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu',
  };

  const planets: PlanetData[] = Object.entries(tropicalPlanets).map(([id, tropLon]) => {
    const lon = norm360(tropLon - ayanamsa);
    const signIdx = getSignIndex(lon);
    const nakshatra = getNakshatra(lon);
    const house = getHouseNumber(signIdx, lagnaSignIndex);
    const retro = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'].includes(id)
      ? isRetrograde(id, T)
      : false;
    return {
      id,
      name: PLANET_NAMES[id],
      longitude: lon,
      signIndex: signIdx,
      sign: SIGN_NAMES[signIdx],
      degree: degreesToDMS(lon),
      house,
      nakshatra: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      pada: nakshatra.pada,
      isRetrograde: retro,
    };
  });

  const moonPlanet = planets.find(p => p.id === 'moon')!;
  const birthDate = new Date(year, month - 1, day, hour, minute);
  const dashas = calculateDashas(moonPlanet.longitude, birthDate);

  return {
    lagna: lagnaLon,
    lagnaSign: lagnaSignIndex,
    midheaven: mcLon,
    planets,
    ayanamsa,
    dashas,
  };
}
