"""
Vedic astrology chart calculator ? Swiss Ephemeris (pyswisseph)
Lahiri ayanamsa, Whole Sign houses, Moshier built-in ephemeris
Divisional charts: D1,D2,D3,D4,D7,D9,D10,D12,D16,D20,D24,D27,D30,D40,D45,D60
"""
import swisseph as swe
from datetime import datetime, timedelta

SIGNS = [
    "Mesha","Vrishabha","Mithuna","Karka",
    "Simha","Kanya","Tula","Vrishchika",
    "Dhanu","Makara","Kumbha","Meena",
]

NAKSHATRAS = [
    {"name":"Ashwini","lord":"Ketu"},        {"name":"Bharani","lord":"Venus"},
    {"name":"Krittika","lord":"Sun"},         {"name":"Rohini","lord":"Moon"},
    {"name":"Mrigashira","lord":"Mars"},      {"name":"Ardra","lord":"Rahu"},
    {"name":"Punarvasu","lord":"Jupiter"},    {"name":"Pushya","lord":"Saturn"},
    {"name":"Ashlesha","lord":"Mercury"},     {"name":"Magha","lord":"Ketu"},
    {"name":"Purva Phalguni","lord":"Venus"}, {"name":"Uttara Phalguni","lord":"Sun"},
    {"name":"Hasta","lord":"Moon"},           {"name":"Chitra","lord":"Mars"},
    {"name":"Swati","lord":"Rahu"},           {"name":"Vishakha","lord":"Jupiter"},
    {"name":"Anuradha","lord":"Saturn"},      {"name":"Jyeshtha","lord":"Mercury"},
    {"name":"Mula","lord":"Ketu"},            {"name":"Purva Ashadha","lord":"Venus"},
    {"name":"Uttara Ashadha","lord":"Sun"},   {"name":"Shravana","lord":"Moon"},
    {"name":"Dhanishtha","lord":"Mars"},      {"name":"Shatabhisha","lord":"Rahu"},
    {"name":"Purva Bhadrapada","lord":"Jupiter"},
    {"name":"Uttara Bhadrapada","lord":"Saturn"},
    {"name":"Revati","lord":"Mercury"},
]

VIMSHOTTARI = [
    {"lord":"Ketu","years":7},     {"lord":"Venus","years":20},  {"lord":"Sun","years":6},
    {"lord":"Moon","years":10},    {"lord":"Mars","years":7},    {"lord":"Rahu","years":18},
    {"lord":"Jupiter","years":16}, {"lord":"Saturn","years":19}, {"lord":"Mercury","years":17},
]

# Supported divisional charts
SUPPORTED_DIVISIONS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60]

# D9 starting sign per natal sign: Fire->Aries(0), Earth->Capricorn(9), Air->Libra(6), Water->Cancer(3)
_D9_START  = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]
# D16: Movable->Aries(0), Fixed->Leo(4), Mutable->Sagittarius(8)
_D16_START = [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8]
# D20: Movable->Aries(0), Fixed->Sagittarius(8), Mutable->Leo(4)
_D20_START = [0, 8, 4, 0, 8, 4, 0, 8, 4, 0, 8, 4]
# D27 (Bhamsha): same as D9 starting signs
_D27_START = [0, 3, 6, 9, 0, 3, 6, 9, 0, 3, 6, 9]
# D45: Movable->Aries(0), Fixed->Leo(4), Mutable->Sagittarius(8)
_D45_START = [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8]


def get_div_sign(lon: float, d: int) -> int:
    """
    Calculate the sign index (0-11) for a given sidereal longitude
    in divisional chart D-d. Pure mathematical transformation ? no hardcoding.
    All formulas follow Brihat Parasara Hora Sastra (BPHS) standard.
    """
    sign = int(lon / 30) % 12
    deg  = lon % 30

    if d == 1:
        return sign

    elif d == 2:   # Hora ? only two possible signs: Cancer(3) or Leo(4)
        # Odd signs (1-based = 0-indexed even): 0-15deg->Leo, 15-30deg->Cancer
        # Even signs (1-based = 0-indexed odd): 0-15deg->Cancer, 15-30deg->Leo
        if sign % 2 == 0:
            return 4 if deg < 15 else 3
        else:
            return 3 if deg < 15 else 4

    elif d == 3:   # Drekkana (Parashari) -- 3 parts of 10deg each
        # 1st decan: same sign; 2nd: 5th from sign (+4); 3rd: 9th from sign (+8)
        part = int(deg / 10)
        return (sign + part * 4) % 12

        elif d == 4:   # Chaturthamsha ? 4 parts of 7.5deg each
        # Each successive part shifts 3 signs forward from natal sign
        part = int(deg / 7.5)
        return (sign + part * 3) % 12

    elif d == 7:   # Saptamsha ? 7 equal parts of 30/7 deg each
        # Odd signs: start from natal sign; Even signs: start from 7th from natal
        part = int(deg / (30.0 / 7))
        if sign % 2 == 0:           # odd signs (1-based)
            return (sign + part) % 12
        else:                        # even signs (1-based)
            return (sign + 6 + part) % 12

    elif d == 9:   # Navamsha ? 9 parts of 3deg20min each
        part = int(deg / (30.0 / 9))
        return (_D9_START[sign] + part) % 12

    elif d == 10:  # Dashamsha ? 10 parts of 3deg each
        # Odd signs: start from natal sign; Even signs: start from 9th from natal
        part = int(deg / 3.0)
        start = sign if sign % 2 == 0 else (sign + 8) % 12
        return (start + part) % 12

    elif d == 12:  # Dwadashamsha ? 12 parts of 2.5deg each
        # Starts from natal sign, cycles through all 12
        part = int(deg / 2.5)
        return (sign + part) % 12

    elif d == 16:  # Shodashamsha ? 16 parts of 1deg52'30" each
        # Movable->Aries, Fixed->Leo, Mutable->Sagittarius
        part = int(deg / (30.0 / 16))
        return (_D16_START[sign] + part) % 12

    elif d == 20:  # Vimshamsha ? 20 parts of 1.5deg each
        # Movable->Aries, Fixed->Sagittarius, Mutable->Leo
        part = int(deg / 1.5)
        return (_D20_START[sign] + part) % 12

    elif d == 24:  # Chaturvimshamsha ? 24 parts of 1.25deg each
        # Odd signs: start from Leo(4); Even signs: start from Cancer(3)
        part = int(deg / (30.0 / 24))
        start = 4 if sign % 2 == 0 else 3
        return (start + part) % 12

    elif d == 27:  # Nakshatramsha/Bhamsha ? 27 parts of 1deg6'40" each
        # Fire->Aries, Earth->Cancer, Air->Libra, Water->Capricorn
        part = int(deg / (30.0 / 27))
        return (_D27_START[sign] + part) % 12

    elif d == 30:  # Trimshamsha ? BPHS classical unequal parts
        # Odd signs (0-indexed even): Mars=0-5, Saturn=5-10, Jupiter=10-18, Mercury=18-25, Venus=25-30
        # Even signs (0-indexed odd): Venus=0-5, Mercury=5-12, Jupiter=12-20, Saturn=20-25, Mars=25-30
        if sign % 2 == 0:   # odd signs (1-based)
            if deg < 5:  return 0   # Aries  (Mars)
            if deg < 10: return 10  # Aquarius (Saturn)
            if deg < 18: return 8   # Sagittarius (Jupiter)
            if deg < 25: return 2   # Gemini (Mercury)
            return 6                 # Libra (Venus)
        else:                # even signs (1-based)
            if deg < 5:  return 1   # Taurus (Venus)
            if deg < 12: return 5   # Virgo (Mercury)
            if deg < 20: return 11  # Pisces (Jupiter)
            if deg < 25: return 9   # Capricorn (Saturn)
            return 7                 # Scorpio (Mars)

    elif d == 40:  # Khavedamsha ? 40 parts of 0.75deg each
        # Odd signs: start from Aries(0); Even signs: start from Libra(6)
        part = int(deg / 0.75)
        start = 0 if sign % 2 == 0 else 6
        return (start + part) % 12

    elif d == 45:  # Akshavedamsha ? 45 parts of 0.6667deg each
        # Movable->Aries(0), Fixed->Leo(4), Mutable->Sagittarius(8)
        part = int(deg / (30.0 / 45))
        return (_D45_START[sign] + part) % 12

    elif d == 60:  # Shashtiamsha -- 60 parts of 0.5deg each
        # Cycles 5 times through all 12 signs within each natal sign.
        # The 60 parts are counted from Aries regardless of natal sign.
        part = int(deg / 0.5)  # 0-59
        return (sign * 60 + part) % 12  # sign*60 % 12 = 0, so = part % 12

        else:
        raise ValueError(f"Divisional chart D{d} not supported. Supported: {SUPPORTED_DIVISIONS}")


def _sign(lon):    return int(lon / 30) % 12
def _deg(lon):     return lon % 30

def _nakshatra(lon):
    idx   = int(lon / (360.0 / 27)) % 27
    nak   = NAKSHATRAS[idx]
    start = (360.0 / 27) * idx
    pada  = int(((lon - start) / (360.0 / 27)) * 4) + 1
    return nak["name"], nak["lord"], min(pada, 4)

def _dms(deg):
    d = int(deg)
    m = int((deg - d) * 60)
    s = int(((deg - d) * 60 - m) * 60)
    return f"{d}°{m:02d}'{s:02d}\"


def calculate_dashas(moon_lon, birth_dt):
    nak_idx   = int(moon_lon / (360.0 / 27)) % 27
    lord      = NAKSHATRAS[nak_idx]["lord"]
    lord_idx  = next(i for i, v in enumerate(VIMSHOTTARI) if v["lord"] == lord)
    nak_start = (360.0 / 27) * nak_idx
    remaining = 1.0 - (moon_lon - nak_start) / (360.0 / 27)

    now    = datetime.utcnow()
    dashas = []
    cur    = birth_dt

    for i in range(9):
        vi    = (lord_idx + i) % 9
        entry = VIMSHOTTARI[vi]
        dur_years = entry["years"] * remaining if i == 0 else float(entry["years"])
        dur_days  = dur_years * 365.25
        end        = cur + timedelta(days=dur_days)
        is_cur     = cur <= now < end

        sub_dashas = []
        sub = cur
        for j in range(9):
            svi      = (vi + j) % 9
            se       = VIMSHOTTARI[svi]
            sub_days = dur_days * (se["years"] / 120.0)
            sub_end  = sub + timedelta(days=sub_days)
            sub_dashas.append({
                "lord":      se["lord"],
                "startDate": sub.isoformat(),
                "endDate":   sub_end.isoformat(),
                "isCurrent": sub <= now < sub_end,
            })
            sub = sub_end

        dashas.append({
            "lord":       entry["lord"],
            "startDate":  cur.isoformat(),
            "endDate":    end.isoformat(),
            "years":      round(dur_years, 4),
            "isCurrent":  is_cur,
            "subDashas":  sub_dashas,
        })
        cur = end
    return dashas


def calculate_chart(
    year, month, day, hour, minute,
    lat, lon, utc_offset,
    node_type="mean",
    divisions=None,   # list of D-numbers to include, e.g. [1,9,10]. None = all supported
):
    if divisions is None:
        divisions = SUPPORTED_DIVISIONS
    else:
        for d in divisions:
            if d not in SUPPORTED_DIVISIONS:
                raise ValueError(f"D{d} not supported. Supported: {SUPPORTED_DIVISIONS}")

    # Julian Day in UT
    ut  = hour + minute / 60.0 - utc_offset
    jd  = swe.julday(year, month, day, ut)

    # Lahiri ayanamsa
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)

    flags   = swe.FLG_MOSEPH | swe.FLG_SPEED
    rahu_id = swe.MEAN_NODE if node_type == "mean" else swe.TRUE_NODE

    planet_ids = {
        "sun":     swe.SUN,
        "moon":    swe.MOON,
        "mercury": swe.MERCURY,
        "venus":   swe.VENUS,
        "mars":    swe.MARS,
        "jupiter": swe.JUPITER,
        "saturn":  swe.SATURN,
        "rahu":    rahu_id,
    }

    # Compute tropical positions
    tropical, speeds = {}, {}
    for name, pid in planet_ids.items():
        xx, _ = swe.calc_ut(jd, pid, flags)
        tropical[name] = xx[0]
        speeds[name]   = xx[3]   # deg/day

    tropical["ketu"] = (tropical["rahu"] + 180) % 360
    speeds["ketu"]   = -speeds["rahu"]

    # Convert to sidereal
    sidereal = {k: (v - ayanamsa) % 360 for k, v in tropical.items()}

    # Ascendant (Whole Sign)
    cusps, ascmc = swe.houses(jd, lat, lon, b'W')
    asc_sidereal = (ascmc[0] - ayanamsa) % 360
    lagna_sign   = _sign(asc_sidereal)

    # Divisional lagna signs (ASC in each divisional chart)
    div_lagnas = {}
    for d in divisions:
        ds = get_div_sign(asc_sidereal, d)
        div_lagnas[f"D{d}"] = {"signIndex": ds, "sign": SIGNS[ds]}

    # Build planet list
    ORDER   = ["sun","moon","mercury","venus","mars","jupiter","saturn","rahu","ketu"]
    DISPLAY = {"sun":"Sun","moon":"Moon","mercury":"Mercury","venus":"Venus",
               "mars":"Mars","jupiter":"Jupiter","saturn":"Saturn","rahu":"Rahu","ketu":"Ketu"}

    planets = []
    for pid in ORDER:
        sid  = sidereal[pid]
        s    = _sign(sid)
        d1deg = _deg(sid)
        nak_name, nak_lord, pada = _nakshatra(sid)
        d1_house = ((s - lagna_sign) % 12) + 1

        # Divisional placements for this planet
        divisional = {}
        for d in divisions:
            ps = get_div_sign(sid, d)
            dl = div_lagnas[f"D{d}"]["signIndex"]
            ph = ((ps - dl) % 12) + 1
            divisional[f"D{d}"] = {
                "signIndex": ps,
                "sign":      SIGNS[ps],
                "house":     ph,
            }

        planets.append({
            "id":            pid,
            "name":          DISPLAY[pid],
            "longitude":     round(sid, 6),
            "signIndex":     s,
            "sign":          SIGNS[s],
            "degree":        _dms(d1deg),
            "degreeDecimal": round(d1deg, 4),
            "house":         d1_house,
            "nakshatra":     nak_name,
            "nakshatraLord": nak_lord,
            "pada":          pada,
            "isRetrograde":  speeds[pid] < 0,
            "speed":         round(speeds[pid], 6),
            "divisional":    divisional,
        })

    birth_dt = datetime(year, month, day, hour, minute) - timedelta(hours=utc_offset)
    dashas   = calculate_dashas(sidereal["moon"], birth_dt)

    debug = {k: round(v, 4) for k, v in sidereal.items()}
    debug["lagna"] = round(asc_sidereal, 4)

    return {
        "lagna":         round(asc_sidereal, 6),
        "lagnaSign":     lagna_sign,
        "lagnaSignName": SIGNS[lagna_sign],
        "midheaven":     0,
        "ayanamsa":      round(ayanamsa, 6),
        "nodeType":      node_type,
        "divisionalLagnas": div_lagnas,
        "planets":       planets,
        "dashas":        dashas,
        "debug":         debug,
        "_meta": {
            "jd":         round(jd, 6),
            "ephemeris":  "Moshier (built-in)",
            "ayanamsa":   "Lahiri",
            "houseSystem":"Whole Sign",
            "divisions":  [f"D{d}" for d in divisions],
        },
    }


def debug_chart(year, month, day, hour, minute, lat, lon, utc_offset, node_type="mean"):
    ut  = hour + minute / 60.0 - utc_offset
    jd  = swe.julday(year, month, day, ut)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)

    flags   = swe.FLG_MOSEPH | swe.FLG_SPEED
    rahu_id = swe.MEAN_NODE if node_type == "mean" else swe.TRUE_NODE

    pid_map = {
        "sun":swe.SUN,"moon":swe.MOON,"mercury":swe.MERCURY,"venus":swe.VENUS,
        "mars":swe.MARS,"jupiter":swe.JUPITER,"saturn":swe.SATURN,"rahu":rahu_id,
    }
    tropical, sidereal = {}, {}
    for name, pid in pid_map.items():
        xx, _ = swe.calc_ut(jd, pid, flags)
        tropical[name] = round(xx[0], 6)
        sidereal[name] = round((xx[0] - ayanamsa) % 360, 6)

    tropical["ketu"] = round((tropical["rahu"] + 180) % 360, 6)
    sidereal["ketu"] = round((sidereal["rahu"] + 180) % 360, 6)

    cusps, ascmc = swe.houses(jd, lat, lon, b'W')
    tropical["ascendant"] = round(ascmc[0], 6)
    sidereal["ascendant"] = round((ascmc[0] - ayanamsa) % 360, 6)

    utc_dt = datetime(year, month, day, hour, minute) - timedelta(hours=utc_offset)
    asc_sid = sidereal["ascendant"]

    div_lagnas = {f"D{d}": SIGNS[get_div_sign(asc_sid, d)] for d in SUPPORTED_DIVISIONS}
    sign_mapping = {k: SIGNS[_sign(v)] for k, v in sidereal.items()}
    lagna_sign = _sign(asc_sid)
    house_mapping = {k: (((_sign(v)) - lagna_sign) % 12) + 1
                     for k, v in sidereal.items() if k != "ascendant"}

    return {
        "input": {
            "year":year,"month":month,"day":day,"hour":hour,"minute":minute,
            "lat":lat,"lon":lon,"utc_offset":utc_offset,"node_type":node_type,
        },
        "utc_datetime":    utc_dt.isoformat() + "Z",
        "julian_day":      round(jd, 6),
        "ayanamsa_lahiri": round(ayanamsa, 6),
        "tropical_longitudes":  tropical,
        "sidereal_longitudes":  sidereal,
        "sign_mapping":         sign_mapping,
        "house_mapping":        house_mapping,
        "divisional_lagnas":    div_lagnas,
    }
