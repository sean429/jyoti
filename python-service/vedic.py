"""
Vedic astrology chart calculator ? Swiss Ephemeris (pyswisseph)
Lahiri ayanamsa, Whole Sign houses, Moshier built-in ephemeris (no external files needed)
"""
import swisseph as swe
from datetime import datetime, timedelta

SIGNS = [
    "Mesha","Vrishabha","Mithuna","Karka",
    "Simha","Kanya","Tula","Vrishchika",
    "Dhanu","Makara","Kumbha","Meena",
]

NAKSHATRAS = [
    {"name":"Ashwini","lord":"Ketu"},       {"name":"Bharani","lord":"Venus"},
    {"name":"Krittika","lord":"Sun"},        {"name":"Rohini","lord":"Moon"},
    {"name":"Mrigashira","lord":"Mars"},     {"name":"Ardra","lord":"Rahu"},
    {"name":"Punarvasu","lord":"Jupiter"},   {"name":"Pushya","lord":"Saturn"},
    {"name":"Ashlesha","lord":"Mercury"},    {"name":"Magha","lord":"Ketu"},
    {"name":"Purva Phalguni","lord":"Venus"},{"name":"Uttara Phalguni","lord":"Sun"},
    {"name":"Hasta","lord":"Moon"},          {"name":"Chitra","lord":"Mars"},
    {"name":"Swati","lord":"Rahu"},          {"name":"Vishakha","lord":"Jupiter"},
    {"name":"Anuradha","lord":"Saturn"},     {"name":"Jyeshtha","lord":"Mercury"},
    {"name":"Mula","lord":"Ketu"},           {"name":"Purva Ashadha","lord":"Venus"},
    {"name":"Uttara Ashadha","lord":"Sun"},  {"name":"Shravana","lord":"Moon"},
    {"name":"Dhanishtha","lord":"Mars"},     {"name":"Shatabhisha","lord":"Rahu"},
    {"name":"Purva Bhadrapada","lord":"Jupiter"},
    {"name":"Uttara Bhadrapada","lord":"Saturn"},
    {"name":"Revati","lord":"Mercury"},
]

VIMSHOTTARI = [
    {"lord":"Ketu","years":7},    {"lord":"Venus","years":20},  {"lord":"Sun","years":6},
    {"lord":"Moon","years":10},   {"lord":"Mars","years":7},    {"lord":"Rahu","years":18},
    {"lord":"Jupiter","years":16},{"lord":"Saturn","years":19}, {"lord":"Mercury","years":17},
]

# D9 starting sign by natal sign (Fire->Aries, Earth->Capricorn, Air->Libra, Water->Cancer)
_D9_START = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]

def _sign(lon): return int(lon / 30) % 12
def _deg(lon):  return lon % 30

def _nakshatra(lon):
    idx = int(lon / (360 / 27)) % 27
    nak = NAKSHATRAS[idx]
    start = (360 / 27) * idx
    pada = int(((lon - start) / (360 / 27)) * 4) + 1
    return nak["name"], nak["lord"], min(pada, 4)

def _d9_sign(lon):
    s = _sign(lon)
    return (_D9_START[s] + int(_deg(lon) / (30 / 9))) % 12

def _d10_sign(lon):
    s = _sign(lon)
    start = s if s % 2 == 0 else (s + 8) % 12
    return (start + int(_deg(lon) / 3)) % 12

def _dms(deg):
    d = int(deg)
    m = int((deg - d) * 60)
    s = int(((deg - d) * 60 - m) * 60)
    return f"{d}°{m:02d}'{s:02d}\"

def calculate_dashas(moon_lon, birth_dt):
    nak_idx = int(moon_lon / (360 / 27)) % 27
    lord = NAKSHATRAS[nak_idx]["lord"]
    lord_idx = next(i for i, v in enumerate(VIMSHOTTARI) if v["lord"] == lord)
    nak_start = (360 / 27) * nak_idx
    remaining = 1 - (moon_lon - nak_start) / (360 / 27)

    now = datetime.utcnow()
    dashas = []
    cur = birth_dt

    for i in range(9):
        vi = (lord_idx + i) % 9
        entry = VIMSHOTTARI[vi]
        dur_years = entry["years"] * remaining if i == 0 else entry["years"]
        dur_days = dur_years * 365.25
        end = cur + timedelta(days=dur_days)
        is_cur = cur <= now < end

        sub_dashas = []
        sub = cur
        for j in range(9):
            svi = (vi + j) % 9
            se = VIMSHOTTARI[svi]
            sub_days = dur_days * (se["years"] / 120.0)
            sub_end = sub + timedelta(days=sub_days)
            sub_dashas.append({
                "lord": se["lord"],
                "startDate": sub.isoformat(),
                "endDate": sub_end.isoformat(),
                "isCurrent": sub <= now < sub_end,
            })
            sub = sub_end

        dashas.append({
            "lord": entry["lord"],
            "startDate": cur.isoformat(),
            "endDate": end.isoformat(),
            "years": round(dur_years, 4),
            "isCurrent": is_cur,
            "subDashas": sub_dashas,
        })
        cur = end
    return dashas

def calculate_chart(year, month, day, hour, minute, lat, lon, utc_offset, node_type="mean", include_d9=True, include_d10=False):
    ut = hour + minute / 60.0 - utc_offset
    jd = swe.julday(year, month, day, ut)

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)

    flags = swe.FLG_MOSEPH | swe.FLG_SPEED
    rahu_id = swe.MEAN_NODE if node_type == "mean" else swe.TRUE_NODE

    planet_ids = {
        "sun": swe.SUN, "moon": swe.MOON, "mercury": swe.MERCURY,
        "venus": swe.VENUS, "mars": swe.MARS, "jupiter": swe.JUPITER,
        "saturn": swe.SATURN, "rahu": rahu_id,
    }

    tropical, speeds = {}, {}
    for name, pid in planet_ids.items():
        xx, _ = swe.calc_ut(jd, pid, flags)
        tropical[name] = xx[0]
        speeds[name] = xx[3]

    tropical["ketu"] = (tropical["rahu"] + 180) % 360
    speeds["ketu"] = -speeds["rahu"]

    sidereal = {k: (v - ayanamsa) % 360 for k, v in tropical.items()}

    cusps, ascmc = swe.houses(jd, lat, lon, b'W')
    asc_sidereal = (ascmc[0] - ayanamsa) % 360
    lagna_sign = _sign(asc_sidereal)

    DISPLAY = {"sun":"Sun","moon":"Moon","mercury":"Mercury","venus":"Venus",
               "mars":"Mars","jupiter":"Jupiter","saturn":"Saturn","rahu":"Rahu","ketu":"Ketu"}
    ORDER = ["sun","moon","mercury","venus","mars","jupiter","saturn","rahu","ketu"]

    planets = []
    for pid in ORDER:
        sid = sidereal[pid]
        s = _sign(sid)
        d = _deg(sid)
        nak_name, nak_lord, pada = _nakshatra(sid)
        house = ((s - lagna_sign) % 12) + 1
        p = {
            "id": pid,
            "name": DISPLAY[pid],
            "longitude": round(sid, 6),
            "signIndex": s,
            "sign": SIGNS[s],
            "degree": _dms(d),
            "house": house,
            "nakshatra": nak_name,
            "nakshatraLord": nak_lord,
            "pada": pada,
            "isRetrograde": speeds[pid] < 0,
        }
        if include_d9:
            d9s = _d9_sign(sid)
            p["d9SignIndex"] = d9s
            p["d9Sign"] = SIGNS[d9s]
        if include_d10:
            d10s = _d10_sign(sid)
            p["d10SignIndex"] = d10s
            p["d10Sign"] = SIGNS[d10s]
        planets.append(p)

    birth_dt = datetime(year, month, day, hour, minute) - timedelta(hours=utc_offset)
    moon_lon = sidereal["moon"]
    dashas = calculate_dashas(moon_lon, birth_dt)

    debug = {k: round(v, 4) for k, v in sidereal.items()}
    debug["lagna"] = round(asc_sidereal, 4)

    return {
        "lagna": round(asc_sidereal, 6),
        "lagnaSign": lagna_sign,
        "midheaven": 0,
        "planets": planets,
        "ayanamsa": round(ayanamsa, 6),
        "dashas": dashas,
        "debug": debug,
        "_meta": {
            "jd": round(jd, 6),
            "nodeType": node_type,
            "ephemeris": "Moshier (built-in)",
            "ayanamsa": "Lahiri",
            "houseSystem": "Whole Sign",
        },
    }

def debug_chart(year, month, day, hour, minute, lat, lon, utc_offset, node_type="mean"):
    ut = hour + minute / 60.0 - utc_offset
    jd = swe.julday(year, month, day, ut)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)
    flags = swe.FLG_MOSEPH | swe.FLG_SPEED
    rahu_id = swe.MEAN_NODE if node_type == "mean" else swe.TRUE_NODE

    pid_map = {
        "sun": swe.SUN, "moon": swe.MOON, "mercury": swe.MERCURY,
        "venus": swe.VENUS, "mars": swe.MARS, "jupiter": swe.JUPITER,
        "saturn": swe.SATURN, "rahu": rahu_id,
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

    return {
        "input": {"year":year,"month":month,"day":day,"hour":hour,"minute":minute,
                  "lat":lat,"lon":lon,"utc_offset":utc_offset,"node_type":node_type},
        "utc_datetime": utc_dt.isoformat() + "Z",
        "julian_day": round(jd, 6),
        "ayanamsa_lahiri": round(ayanamsa, 6),
        "tropical_longitudes": tropical,
        "sidereal_longitudes": sidereal,
        "sign_mapping": {k: SIGNS[int(v/30)%12] for k, v in sidereal.items()},
        "house_mapping": {
            k: ((int(v/30)%12 - int(sidereal["ascendant"]/30)%12) % 12) + 1
            for k, v in sidereal.items() if k != "ascendant"
        },
    }
