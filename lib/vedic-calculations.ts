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

// Lahiri ayanamsa (Chitrapaksha)
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

// Earth's heliocentric longitude and radius vector (AU)
function earthHeliocentric(T: number): [number, number] {
  const sunLon = sunLongitude(T);
  const earthLon = norm360(sunLon + 180);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const e = 0.016708634 - 0.000042037 * T;
  const Mr = toRad(M);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const nu = norm360(M + C);
  const r = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(toRad(nu)));
  return [earthLon, r];
}

// Returns [heliocentric tropical longitude, heliocentric radius AU]
function planetHeliocentric(planet: string, T: number): [number, number] {
  const d = T * 36525;
  // [L0, dL/day, e, perihelion longitude, semi-major axis AU]
  const data: Record<string, [number, number, number, number, number]> = {
    mercury: [252.250906, 4.092337,  0.205630, 77.45645,  0.387098],
    venus:   [181.979801, 1.602136,  0.006773, 131.56370, 0.723332],
    mars:    [355.453094, 0.524039,  0.093412, 336.04084, 1.523679],
    jupiter: [34.396441,  0.083086,  0.048393, 14.75385,  5.204267],
    saturn:  [50.077444,  0.033459,  0.054151, 92.43194,  9.582017],
  };
  const el = data[planet];
  if (!el) return [0, 1];
  const [L0, dLday, e, omega, a] = el;
  const L = norm360(L0 + dLday * d);
  const M = norm360(L - omega);
  const Mr = toRad(M);
  const C = toDeg(
    (2 * e - (e * e * e) / 4) * Math.sin(Mr) +
    (5 * e * e / 4) * Math.sin(2 * Mr) +
    (13 * e * e * e / 12) * Math.sin(3 * Mr)
  );
  const nu = norm360(M + C);
  const r = a * (1 - e * e) / (1 + e * Math.cos(toRad(nu)));
  return [norm360(L + C), r];
}

// Convert heliocentric (lon, r) to geocentric longitude
function helioToGeo(helioLon: number, helioR: number, earthLon: number, earthR: number): number {
  const Xp = helioR * Math.cos(toRad(helioLon));
  const Yp = helioR * Math.sin(toRad(helioLon));
  const Xe = earthR * Math.cos(toRad(earthLon));
  const Ye = earthR * Math.sin(toRad(earthLon));
  return norm360(toDeg(Math.atan2(Yp - Ye, Xp - Xe)));
}

// Moon geocentric longitude ? Meeus Ch.47, 40 terms
function moonLongitude(T: number): number {
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841);
  const D  = toRad(norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868));
  const M  = toRad(norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T));
  const Mp = toRad(norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699));
  const F  = toRad(norm360(93.2720950  + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000));

  const dL =
    6288774 * Math.sin(Mp) +
    1274027 * Math.sin(2*D - Mp) +
    658314  * Math.sin(2*D) +
    213618  * Math.sin(2*Mp) -
    185116  * Math.sin(M) -
    114332  * Math.sin(2*F) +
    58793   * Math.sin(2*D - 2*Mp) +
    57066   * Math.sin(2*D - M - Mp) +
    53322   * Math.sin(2*D + Mp) +
    45758   * Math.sin(2*D - M) -
    40923   * Math.sin(M - Mp) -
    34720   * Math.sin(D) -
    30383   * Math.sin(M + Mp) +
    15327   * Math.sin(2*D - 2*F) -
    12528   * Math.sin(Mp + 2*F) +
    10980   * Math.sin(Mp - 2*F) +
    10675   * Math.sin(4*D - Mp) +
    10034   * Math.sin(3*Mp) +
    8548    * Math.sin(4*D - 2*Mp) -
    7888    * Math.sin(2*D + M - Mp) -
    6766    * Math.sin(2*D + M) -
    5163    * Math.sin(D - Mp) +
    4987    * Math.sin(D + M) +
    4036    * Math.sin(2*D - M + Mp) +
    3994    * Math.sin(2*D + 2*Mp) +
    3861    * Math.sin(4*D) +
    3665    * Math.sin(2*D - 3*Mp) -
    2689    * Math.sin(M - 2*Mp) -
    2602    * Math.sin(2*D - Mp + 2*F) +
    2390    * Math.sin(2*D - M - 2*Mp) -
    2348    * Math.sin(D + Mp) +
    2236    * Math.sin(2*D - 2*M) -
    2120    * Math.sin(M + 2*Mp) -
    2069    * Math.sin(2*M) +
    2048    * Math.sin(2*D - 2*M - Mp) -
    1773    * Math.sin(2*D + Mp - 2*F) -
    1595    * Math.sin(2*D + 2*F) +
    1215    * Math.sin(4*D - M - Mp) -
    1110    * Math.sin(2*Mp + 2*F) -
    892     * Math.sin(3*D - Mp) -
    810     * Math.sin(2*D + M + Mp);

  return norm360(Lp + dL / 1e6);
}

function moonNode(T: number): number {
  return norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
}

function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  const T = julianCenturies(jd);
  const eps = 23.439291111 - 0.013004167 * T - 0.000001639 * T * T + 0.000000503 * T * T * T;
  const epsR = toRad(eps);
  const GMST = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0);
  const LMST = norm360(GMST + longitude);
  const ramcR = toRad(LMST);
  const latR = toRad(latitude);
  return norm360(toDeg(Math.atan2(
    Math.cos(ramcR),
    -(Math.sin(ramcR) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR))
  )));
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

export interface DivisionalPlacement {
  signIndex: number;
  sign: string;
  house: number;
}

export interface PlanetData {
  id: string;
  name: string;
  longitude: number;
  signIndex: number;
  sign: string;
  degree: string;
  degreeDecimal?: number;
  house: number;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  isRetrograde: boolean;
  speed?: number;
  divisional?: Record<string, DivisionalPlacement>;
}

export interface ChartData {
  lagna: number;
  lagnaSign: number;
  lagnaSignName?: string;
  midheaven: number;
  ayanamsa: number;
  nodeType?: string;
  divisionalLagnas?: Record<string, { signIndex: number; sign: string }>;
  planets: PlanetData[];
  dashas: DashaData[];
  debug?: Record<string, number>;
  _meta?: Record<string, unknown>;
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
  const [l1] = planetHeliocentric(planet, T);
  const [l2] = planetHeliocentric(planet, T + 1 / 36525);
  const [e1, r1] = earthHeliocentric(T);
  const [e2, r2] = earthHeliocentric(T + 1 / 36525);
  const g1 = helioToGeo(l1, planetHeliocentric(planet, T)[1], e1, r1);
  const g2 = helioToGeo(l2, planetHeliocentric(planet, T + 1 / 36525)[1], e2, r2);
  let diff = g2 - g1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function degreesToDMS(deg: number): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs) % 30;
  const mRaw = (abs % 1) * 60;
  const m = Math.floor(mRaw);
  const s = Math.floor((mRaw % 1) * 60);
  return `${d}°${m}'${s}"`;
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

  const [earthLon, earthR] = earthHeliocentric(T);

  // Tropical geocentric longitudes
  const tropicalPlanets: Record<string, number> = {
    sun: sunLongitude(T),
    moon: moonLongitude(T),
  };

  for (const p of ['mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
    const [hLon, hR] = planetHeliocentric(p, T);
    tropicalPlanets[p] = helioToGeo(hLon, hR, earthLon, earthR);
  }

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

  // Debug: raw sidereal longitudes before sign conversion
  const debug: Record<string, number> = {};
  for (const [id, tropLon] of Object.entries(tropicalPlanets)) {
    debug[id] = parseFloat(norm360(tropLon - ayanamsa).toFixed(4));
  }
  debug['lagna'] = parseFloat(lagnaLon.toFixed(4));

  const moonPlanet = planets.find(p => p.id === 'moon')!;
  const birthDate = new Date(year, month - 1, day, hour, minute);
  const dashas = calculateDashas(moonPlanet.longitude, birthDate);

  return { lagna: lagnaLon, lagnaSign: lagnaSignIndex, midheaven: mcLon, planets, ayanamsa, dashas, debug };
}
