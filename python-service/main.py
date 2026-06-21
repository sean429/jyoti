"""
Jyoti Vedic Astrology - Python Calculation Service
Start: uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional, List
from vedic import calculate_chart, debug_chart, SUPPORTED_DIVISIONS

app = FastAPI(title="Jyoti Vedic API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChartRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    utcOffset: float
    name: str = ""
    place: str = ""
    node_type: Literal["mean", "true"] = "mean"
    divisions: Optional[List[int]] = None   # None = all supported divisions

@app.get("/health")
def health():
    return {"status": "ok", "supported_divisions": SUPPORTED_DIVISIONS}

@app.post("/calculate")
def calculate(req: ChartRequest):
    try:
        return calculate_chart(
            req.year, req.month, req.day,
            req.hour, req.minute,
            req.latitude, req.longitude,
            req.utcOffset,
            node_type=req.node_type,
            divisions=req.divisions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/debug")
def debug(
    year: int = Query(...), month: int = Query(...), day: int = Query(...),
    hour: int = Query(12), minute: int = Query(0),
    lat: float = Query(37.5665), lon: float = Query(126.9780),
    utc_offset: float = Query(9.0),
    node_type: Literal["mean", "true"] = Query("mean"),
):
    try:
        return debug_chart(year, month, day, hour, minute, lat, lon, utc_offset, node_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
