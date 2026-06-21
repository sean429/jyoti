from http.server import BaseHTTPRequestHandler
import json
import sys
import os

class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        info = {}

        # Check sys.path
        info["sys_path"] = sys.path
        info["cwd"] = os.getcwd()

        # Check if _vedic.py exists and read its first bytes
        vedic_path = "/var/task/_vedic.py"
        if os.path.exists(vedic_path):
            with open(vedic_path, "rb") as f:
                first_bytes = list(f.read(10))
            info["vedic_first_bytes"] = first_bytes
            info["vedic_first_hex"] = [hex(b) for b in first_bytes]
        else:
            info["vedic_exists"] = False

        # Try compile first (catches SyntaxError)
        try:
            with open(vedic_path, "r", encoding="utf-8-sig") as f:
                src = f.read()
            compile(src, vedic_path, "exec")
            info["vedic_compile"] = "OK"
        except SyntaxError as e:
            info["vedic_compile"] = f"SyntaxError line {e.lineno}: {e.msg}"
        except Exception as e:
            info["vedic_compile"] = f"{type(e).__name__}: {e}"

        # Try explicit sys.path manipulation
        sys.path.insert(0, "/var/task")
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("_vedic", vedic_path)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            info["importlib_load"] = "OK"
            info["vedic_supported_divisions"] = getattr(mod, "SUPPORTED_DIVISIONS", "missing")
        except Exception as e:
            info["importlib_load"] = f"{type(e).__name__}: {e}"

        body = json.dumps(info, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
