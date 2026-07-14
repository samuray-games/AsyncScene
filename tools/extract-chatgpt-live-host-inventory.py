#!/usr/bin/env python3
"""Experimental parser for externally injected ChatGPT Desktop query responses.

This tool is not a production adapter and cannot establish live-host authority.
"""
from __future__ import annotations

import argparse
import json
import shlex
import subprocess
from pathlib import Path

from chatgpt_live_host_inventory import (
    SOURCE_EXPERIMENTAL,
    chatgpt_version,
    extract_inventory,
    locate_renderer_asset,
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host-id", required=True, help="experimental input only; production host discovery is unavailable")
    parser.add_argument("--response-json", action="append", default=[], help="experimental injected response page")
    parser.add_argument("--query-command", help="experimental external command; receives query JSON on stdin and returns response JSON")
    parser.add_argument("--settings-json")
    parser.add_argument("--app-path", default="/Applications/ChatGPT.app")
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()

    app_path = Path(args.app_path)
    asar_path = app_path / "Contents" / "Resources" / "app.asar"
    pages = [json.loads(Path(path).read_text(encoding="utf-8")) for path in args.response_json]
    page_index = 0

    def query_page(arguments: dict[str, object]) -> object:
        nonlocal page_index
        if args.query_command:
            request = {"query": "list-models-for-host", "arguments": arguments}
            completed = subprocess.run(
                shlex.split(args.query_command),
                input=json.dumps(request),
                text=True,
                capture_output=True,
                check=True,
            )
            return json.loads(completed.stdout)
        if page_index >= len(pages):
            raise ValueError("live query page was not supplied")
        page = pages[page_index]
        page_index += 1
        return page

    try:
        result = extract_inventory(
            host_id=args.host_id,
            query_page=query_page if pages or args.query_command else None,
            settings=json.loads(Path(args.settings_json).read_text(encoding="utf-8")) if args.settings_json else None,
            source=SOURCE_EXPERIMENTAL,
            limit=args.limit,
        )
        if result["status"] == "BLOCKED_MODEL_INVENTORY_UNAVAILABLE":
            print(json.dumps(result, indent=2))
            return 2
        result["provenance"] = {
            "chatgptDesktopVersion": chatgpt_version(app_path),
            "bundlePath": str(asar_path),
            "rendererAsset": locate_renderer_asset(asar_path),
        }
        result["adapterStatus"] = "EXPERIMENTAL_NON_PRODUCTION"
        result["productionUse"] = "FORBIDDEN_NO_SAFE_DESKTOP_READ_ONLY_TRANSPORT"
        print(json.dumps(result, indent=2))
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "reason": str(exc)}, indent=2))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
