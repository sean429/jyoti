"""
Jyoti Vedic Astrology ? Python Calculation Service
Deploy on Render: https://render.com
  Build: pip install -r requirements.txt
  Start: uvicorn main:app --host 0.0.0.0 --port $PORT

Set PYTHON_SERVICE_URL in Vercel to your Render service URL.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from vedic import calculate_chart, debug_chart

app = FastAPI(title="Jyoti Vedic API", version="1.0.0")

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
    include_d9: bool = True
    include_d10: bool = False

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/calculate")
def calculate(req: ChartRequest):
    try:
        return calculate_chart(
            req.year, req.month, req.day,
            req.hour, req.minute,
            req.latitude, req.longitude,
            req.utcOffset,
            node_type=req.node_type,
            include_d9=req.include_d9,
            include_d10=req.include_d10,
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
