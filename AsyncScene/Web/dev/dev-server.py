#!/usr/bin/env python3
import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

STORE_PATH = "/Users/User/Documents/created apps/AsyncScene/Console.txt"
MAX_CHARS = 2_000_000


class DevHandler(SimpleHTTPRequestHandler):
    def _json(self, status, payload, extra_headers=None):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        path = self.path or ""
        if path.startswith("/dev/") or path.startswith("dev/"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        if self.path in ("/console-dump", "console-dump"):
            self._json(404, {"ok": False, "err": "wrong_path_use___dev_console_dump"})
            return

        if self.path != "/__dev/console-dump":
            self._json(404, {"ok": False, "err": "not_found"})
            return

        if self.client_address[0] not in ("127.0.0.1", "::1"):
            self._json(403, {"ok": False, "err": "forbidden"})
            return

        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0:
            self._json(400, {"ok": False, "err": "empty_body"})
            return

        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception as exc:
            self._json(400, {"ok": False, "err": f"bad_json:{exc}"})
            return

        text = payload.get("text")
        meta = payload.get("meta") or {}
        client_epoch = meta.get("clientEpochMs")
        if not isinstance(text, str):
            self._json(400, {"ok": False, "err": "text_not_string"})
            return

        if len(text) > MAX_CHARS:
            text = text[-MAX_CHARS:]

        try:
            now = int(time.time() * 1000)
            dumpAtEpochMs = client_epoch if isinstance(client_epoch, (int, float)) and client_epoch > 0 else now
            zone = timezone(timedelta(hours=9))
            dump_local = datetime.fromtimestamp(dumpAtEpochMs / 1000, zone)
            dumpAtLocal = dump_local.strftime("%Y-%m-%d %H:%M:%S")
            header = f"[DUMP_AT] [{dumpAtLocal}] (epoch_ms={dumpAtEpochMs})\n"
            payload = header + text
            with open(STORE_PATH, "w", encoding="utf-8") as f:
                f.write(payload)
        except Exception as exc:
            self._json(500, {"ok": False, "err": str(exc)})
            return

        print(f"DEV_SERVER_CONSOLE_DUMP_HIT method=POST path={self.path} bytes={len(payload)} firstLine={header.strip()}")
        self._json(200, {
            "ok": True,
            "bytes": len(payload),
            "path": STORE_PATH,
            "marker": "DEV_SERVER_V1_READY",
            "dumpAtLocal": dumpAtLocal,
            "dumpAtEpochMs": dumpAtEpochMs
        })

    def do_GET(self):
        if self.path == "/__dev/health":
            payload = {
                "ok": True,
                "marker": "DEV_SERVER_V1_READY",
                "pid": os.getpid(),
                "cwd": os.getcwd(),
                "routes": ["/__dev/health", "/__dev/console-dump"]
            }
            self._json(200, payload)
            return
        if self.path == "/__dev/console-dump":
            self._json(405, {"ok": False, "err": "method_not_allowed"}, {"Allow": "POST"})
            return
        return super().do_GET()


def main():
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(root)
    server = ThreadingHTTPServer(("127.0.0.1", port), DevHandler)
    print(f"[dev-server] serving {root} on http://127.0.0.1:{port}")
    print("DEV_SERVER_V1_READY")
    print("DEV_SERVER_V1_ROUTE /__dev/health GET")
    print("DEV_SERVER_V1_ROUTE /__dev/console-dump POST enabled")
    server.serve_forever()


if __name__ == "__main__":
    main()
