from http.server import BaseHTTPRequestHandler
import json
import sys

class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        try:
            import swisseph as swe
            swe_version = swe.version
        except Exception as e:
            swe_version = f"ERROR: {e}"

        try:
            from _vedic import SUPPORTED_DIVISIONS
            vedic_ok = True
        except Exception as e:
            vedic_ok = f"ERROR: {e}"

        body = json.dumps({
            "status": "ok",
            "python": sys.version,
            "swisseph": swe_version,
            "vedic_import": vedic_ok,
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
