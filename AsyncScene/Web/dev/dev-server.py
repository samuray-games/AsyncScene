#!/usr/bin/env python3
import hashlib
import json
import os
import sys
import time
import urllib.parse
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

STORE_PATH = "/Users/User/Documents/created apps/AsyncScene/Console.txt"
FILTER_BUILD_TAG = "FILTER_V4_2026_02_11_02"
SERVER_CONSOLE_DUMP_PROOF = "DEV_SERVER_CONSOLE_DUMP_V2_PROOF build_2026_02_11_b1"
MAX_DUMP_CHARS = 2_000_000


def _normalize_newlines(text):
    return text.replace("\r\n", "\n").replace("\r", "\n")


def _clean_old_content(text):
    return _normalize_newlines(text).lstrip("\n")


def _format_header(epoch_ms):
    local_ts = datetime.fromtimestamp(epoch_ms / 1000)
    formatted = local_ts.strftime("%Y-%m-%d %H:%M:%S")
    header = f"[DUMP_AT] [{formatted}] (epoch_ms={int(epoch_ms)})"
    return header, formatted


def _check_separator(content):
    first_sep = content.find("\n\n")
    if first_sep == -1:
        return False
    remainder = content[first_sep + 2 :]
    if not remainder:
        return True
    return remainder.startswith("[DUMP_AT]")


class DevHandler(SimpleHTTPRequestHandler):
    def _json(self, status, payload, extra_headers=None):
        merged_payload = {"proof": SERVER_CONSOLE_DUMP_PROOF, "path": STORE_PATH}
        merged_payload.update(payload)
        body = json.dumps(merged_payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
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
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path != "/__dev/console-dump":
            self._json(404, {"ok": False, "err": "not_found", "bytes": 0, "sepOk": False})
            return

        if self.client_address[0] not in ("127.0.0.1", "::1"):
            self._json(403, {"ok": False, "err": "forbidden", "bytes": 0, "sepOk": False})
            return

        length = int(self.headers.get("Content-Length") or "0")
        raw = self.rfile.read(length)
        text = raw.decode("utf-8", errors="replace")
        if not text.strip():
            self._json(400, {"ok": False, "err": "empty_dump_payload", "bytes": 0, "sepOk": False})
            return

        ctype = (self.headers.get("Content-Type") or "").lower()
        dump_body = text
        if "application/json" in ctype or "application/javascript" in ctype:
            try:
                parsed = json.loads(text)
                candidate = parsed.get("dumpText") or parsed.get("text")
                if isinstance(candidate, str) and candidate.strip():
                    dump_body = candidate
                else:
                    payload_value = parsed.get("payload")
                    if isinstance(payload_value, str) and payload_value.strip():
                        dump_body = payload_value
                    else:
                        self._json(400, {"ok": False, "err": "empty_dump_payload", "bytes": 0, "sepOk": False})
                        return
            except json.JSONDecodeError:
                self._json(400, {"ok": False, "err": "json_payload_invalid", "bytes": 0, "sepOk": False})
                return
        else:
            trimmed = dump_body.strip()
            if trimmed.startswith("{") and trimmed.endswith("}"):
                self._json(400, {"ok": False, "err": "json_wrapper_rejected", "bytes": 0, "sepOk": False})
                return

        normalized = _normalize_newlines(dump_body)
        if len(normalized) > MAX_DUMP_CHARS:
            normalized = normalized[-MAX_DUMP_CHARS:]

        trimmed_body = normalized.rstrip()
        if not trimmed_body:
            self._json(400, {"ok": False, "err": "empty_dump_payload", "bytes": 0, "sepOk": False})
            return

        now_ms = int(time.time() * 1000)
        header_line, local_ts = _format_header(now_ms)
        proof_line = f"[DUMP_PROOF] {SERVER_CONSOLE_DUMP_PROOF}"
        new_block = f"{header_line}\n{proof_line}\n{trimmed_body}\n\n"

        old_content = ""
        try:
            with open(STORE_PATH, "r", encoding="utf-8") as f:
                old_content = f.read()
        except FileNotFoundError:
            old_content = ""

        old_content = _clean_old_content(old_content)
        new_content = new_block + old_content
        bytes_written = len(new_content.encode("utf-8"))

        tmp_path = STORE_PATH + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        os.replace(tmp_path, STORE_PATH)

        sep_ok = _check_separator(new_content)
        print(f"DEV_SERVER_CONSOLE_DUMP_HIT bytes={bytes_written} sepOk={sep_ok} path={STORE_PATH}")
        self._json(200, {
            "ok": True,
            "prepend": True,
            "sepOk": sep_ok,
            "bytes": bytes_written,
            "dumpAtLocal": local_ts,
            "dumpAtEpochMs": now_ms
        })

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path == "/__dev/console-dump-proof":
            self._json(200, {"ok": True, "sepOk": True, "bytes": 0})
            return
        if path == "/__dev/health":
            payload = {
                "ok": True,
                "marker": "DEV_SERVER_V1_READY",
                "pid": os.getpid(),
                "cwd": os.getcwd(),
                "routes": ["/__dev/health", "/__dev/console-dump"]
            }
            self._json(200, payload)
            return
        if path == "/__dev/console-dump":
            self._json(405, {"ok": False, "err": "method_not_allowed", "bytes": 0, "sepOk": False}, {"Allow": "POST"})
            return
        if self.serve_docs():
            return
        served = self.serve_dev_checks()
        if not served:
            return super().do_GET()

    def serve_docs(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if not path.startswith("/__dev__/docs/"):
            return False
        filename = path.split("/")[-1]
        target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        real_path = os.path.join(target_dir, filename)
        if not os.path.isfile(real_path):
            self.send_response(404)
            body = f"{filename} not found".encode("utf-8")
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return True
        try:
            with open(real_path, "rb") as f:
                data = f.read()
        except Exception:
            self.send_response(500)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return True
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)
        return True

    def serve_dev_checks(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path != "/dev/dev-checks.js":
            return False
        real_path = self.translate_path(path)
        if not os.path.isfile(real_path):
            return False
        try:
            with open(real_path, "rb") as f:
                data = f.read()
        except Exception:
            return False
        sha1 = hashlib.sha1(data).hexdigest()
        mtime = int(os.path.getmtime(real_path) * 1000)
        self.send_response(200)
        self.send_header("Content-Type", "application/javascript")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-DEV-CHECKS-BUILD", "build_2026_02_09b")
        self.send_header("X-DEV-CHECKS-MTIME", str(mtime))
        self.send_header("X-DEV-CHECKS-SHA1", sha1)
        self.end_headers()
        self.wfile.write(data)
        print(f"SERVE_DEV_CHECKS path={self.path} bytes={len(data)} mtime={mtime} sha1={sha1}")
        return True


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
    print("DEV_SERVER_V1_ROUTE /__dev/console-dump-proof GET enabled")
    print("DEV_SERVER_V1_ROUTE /__dev/console-dump POST enabled")
    print("DEV_SERVER_FILTER_ACTIVE", FILTER_BUILD_TAG)
    server.serve_forever()


if __name__ == "__main__":
    main()
