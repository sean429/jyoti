from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import importlib.util
import traceback

_vedic_mod = None

def _load_vedic():
    global _vedic_mod
    if _vedic_mod is not None:
        return _vedic_mod
    here = os.path.dirname(os.path.abspath(__file__))
    vedic_path = os.path.join(here, "_vedic.py")
    spec = importlib.util.spec_from_file_location("_vedic", vedic_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    _vedic_mod = mod
    return mod


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            vedic = _load_vedic()
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))

            result = vedic.calculate_chart(
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
            here = os.path.dirname(os.path.abspath(__file__))
            self._json(500, {
                "error": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc(),
                "vedic_path": os.path.join(here, "_vedic.py"),
                "vedic_exists": os.path.exists(os.path.join(here, "_vedic.py")),
                "dir_files": os.listdir(here),
            })

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
