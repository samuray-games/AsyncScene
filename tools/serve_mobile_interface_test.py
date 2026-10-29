#!/usr/bin/env python3
"""Serve the repository Web app and same-origin mobile DOM regression page."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "AsyncScene" / "Web"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        request_path = unquote(urlsplit(path).path)
        if request_path == "/AsyncScene" or request_path == "/AsyncScene/":
            request_path = "/AsyncScene/index.html"
        if request_path.startswith("/AsyncScene/"):
            relative = request_path[len("/AsyncScene/"):]
            candidate = (WEB / relative).resolve()
            if candidate == WEB.resolve() or WEB.resolve() in candidate.parents:
                return str(candidate)
        candidate = (ROOT / request_path.lstrip("/")).resolve()
        if candidate == ROOT.resolve() or ROOT.resolve() in candidate.parents:
            return str(candidate)
        return str(ROOT / "__not_found__")

    def log_message(self, format, *args):
        sys.stdout.write("[mobile-test-server] " + format % args + "\n")
        sys.stdout.flush()


os.chdir(ROOT)
server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
print(f"MOBILE_INTERFACE_TEST_SERVER_READY http://127.0.0.1:{PORT}/tools/test_mobile_first_interface.html", flush=True)
server.serve_forever()
