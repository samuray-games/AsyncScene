#!/usr/bin/env python3
import hashlib
import json
import os
import sys
import time
import urllib.parse
from datetime import datetime, timezone, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def _normalize_newlines(text):
    return text.replace("\r\n", "\n").replace("\r", "\n")


def _insert_marker_after_header(path, marker_line):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if marker_line in content.splitlines()[1:3]:
        return
    parts = content.split("\n\n", 1)
    top = parts[0]
    rest = parts[1] if len(parts) > 1 else ""
    lines = top.splitlines()
    if not lines:
        return
    header_line = lines[0]
    body = lines[1:]
    new_top = header_line + "\n" + marker_line
    if body:
        new_top += "\n" + "\n".join(body)
    new_content = new_top + ("\n\n" + rest if rest else "")
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    os.replace(tmp_path, path)


def _check_block_separator(content):
    first_block_end = content.find("\n\n")
    if first_block_end == -1:
        return False, "missing_or_extra_blank_line"
    rest = content[first_block_end + 2 :]
    if not rest.startswith("[DUMP_AT]"):
        return False, "missing_or_extra_blank_line"
    return True, None


def _self_check_top_block(path, banned_substrings):
    with open(path, "r", encoding="utf-8") as f:
        content = _normalize_newlines(f.read())
    parts = content.split("\n\n", 1)
    top = parts[0]
    rest = parts[1] if len(parts) > 1 else ""
    lines = top.splitlines()
    dump_at_count = sum(1 for ln in lines if ln.startswith("[DUMP_AT]"))
    banned_count = 0
    for ln in lines:
        if any(sub in ln for sub in banned_substrings):
            banned_count += 1
        if ln.startswith("[TAPE_TAIL_"):
            banned_count += 1
    header_line = lines[0] if lines else ""
    sep_ok, detail = _check_block_separator(content)
    body_lines = lines[1:]
    body_has_content = any(ln.strip() for ln in body_lines)
    if dump_at_count == 1 and banned_count == 0 and sep_ok and body_has_content:
        marker = 'DUMP_STACK_V1_WRITE_OK {"dumpAtCount":1,"bannedCount":0,"emptyBody":false}'
        _insert_marker_after_header(path, marker)
        return True
    if header_line.startswith("[DUMP_AT]"):
        if not body_has_content:
            meta = {"reason": "empty_body"}
        elif not sep_ok:
            meta = {"sepOk": False, "detail": detail or "missing_or_extra_blank_line"}
        else:
            meta = {"dumpAtCount": dump_at_count, "bannedCount": banned_count}
        marker = f"DUMP_STACK_V1_WRITE_FAIL {json.dumps(meta, separators=(',', ':'))}"
        _insert_marker_after_header(path, marker)
    return False

STORE_PATH = "/Users/User/Documents/created apps/AsyncScene/Console.txt"
BANNED_PAYLOAD_SUBSTRINGS = [
    "CONSOLE_DUMP_",
    "CONSOLE_DUMP_INCLUDED_TAPE_TAIL",
    "CONSOLE_DUMP_INCLUDED_TAPE_TAIL_",
    "[TAPE_TAIL_",
    "CONSOLE_TAPE_",
    "REPL_TAPE_",
    "DUMP_ALIAS_OK",
    "[DUMP_AT]",
    "DEV_CHECKS_",
    "DEV_SERVER_",
    "/__dev/console-dump",
]
FILTER_BUILD_TAG = "FILTER_V4_2026_02_11_02"
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
            old_content = ""
            try:
                with open(STORE_PATH, "r", encoding="utf-8") as f:
                    old_content = f.read()
            except FileNotFoundError:
                old_content = ""
            old_content = _normalize_newlines(old_content).lstrip("\n")
            filtered_parts = []
            normalized_text = _normalize_newlines(text)
            for line in normalized_text.split("\n"):
                stripped_line = line.strip()
                if not stripped_line:
                    continue
                if line.startswith("[TAPE_TAIL_"):
                    continue
                if "[DUMP_AT]" in line:
                    continue
                if any(keyword in line for keyword in BANNED_PAYLOAD_SUBSTRINGS):
                    continue
                filtered_parts.append(line)
            body_lines = filtered_parts or ["[empty_dump_payload]"]
            body_text = "\n".join(body_lines)
            header_line = header.strip()
            new_block = f"{header_line}\n{body_text}\n\n"
            new_content = new_block + old_content
            tmp_path = STORE_PATH + ".tmp"
            with open(tmp_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            os.replace(tmp_path, STORE_PATH)
            try:
                _self_check_top_block(STORE_PATH, BANNED_PAYLOAD_SUBSTRINGS)
            except Exception:
                pass
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
        served = self.serve_dev_checks()
        if not served:
            return super().do_GET()

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
    print("DEV_SERVER_V1_ROUTE /__dev/console-dump POST enabled")
    print("DEV_SERVER_FILTER_ACTIVE", FILTER_BUILD_TAG)
    server.serve_forever()


if __name__ == "__main__":
    main()
