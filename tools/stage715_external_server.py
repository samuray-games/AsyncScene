#!/usr/bin/env python3
"""Acceptance-only HTTP adapter for the repository's /AsyncScene/ base path."""

import importlib.util
import os
import sys
from http.server import ThreadingHTTPServer
from urllib.parse import urlsplit, urlunsplit


if len(sys.argv) != 3:
    raise SystemExit("usage: stage715_external_server.py CANDIDATE_WEB_ROOT PORT")

candidate_root = os.path.abspath(sys.argv[1])
port = int(sys.argv[2])
dev_server_path = os.path.join(candidate_root, "dev", "dev-server.py")
spec = importlib.util.spec_from_file_location("stage715_candidate_dev_server", dev_server_path)
if spec is None or spec.loader is None:
    raise SystemExit(f"unable to load candidate server: {dev_server_path}")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

os.chdir(candidate_root)


class Stage715Handler(module.DevHandler):
    def _strip_asyncscene_prefix(self):
        parsed = urlsplit(self.path)
        path = parsed.path
        if path == "/AsyncScene":
            path = "/"
        elif path.startswith("/AsyncScene/"):
            path = path[len("/AsyncScene"):]
        self.path = urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))

    def do_GET(self):
        original = self.path
        self._strip_asyncscene_prefix()
        try:
            return super().do_GET()
        finally:
            self.path = original

    def do_POST(self):
        original = self.path
        self._strip_asyncscene_prefix()
        try:
            return super().do_POST()
        finally:
            self.path = original


server = ThreadingHTTPServer(("127.0.0.1", port), Stage715Handler)
print(f"[stage715-external-server] serving {candidate_root} at http://127.0.0.1:{port}/AsyncScene/", flush=True)
print("STAGE715_EXTERNAL_SERVER_READY", flush=True)
server.serve_forever()
