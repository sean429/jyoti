from http.server import BaseHTTPRequestHandler
import json

from _vedic import calculate_chart


class handler(BaseHTTPRequestHandler):
    """Vercel Python Serverless Function — POST /api/calculate"""

    def log_message(self, format, *args):
        pass  # suppress default stdout logging

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))

            result = calculate_chart(
                year=int(body["year"]),
                month=int(body["month"]),
                day=int(body["day"]),
                hour=int(body["hour"]),
                minute=int(body["minute"]),
                lat=float(body["latitude"]),
                lon=float(body["longitude"]),
                utc_offset=float(body["utcOffset"]),
                node_type=body.get("node_type", "mean"),
                divisions=body.get("divisions", None),
            )
            self._json(200, result)

        except KeyError as e:
            self._json(400, {"error": f"Missing required field: {e}"})
        except Exception as e:
            self._json(500, {"error": str(e)})

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)
