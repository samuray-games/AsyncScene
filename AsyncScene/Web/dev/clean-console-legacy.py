#!/usr/bin/env python3
import io
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CONSOLE_PATH = os.path.join(ROOT, "Console.txt")


def read_blocks(text):
    normalized = text.replace("\r\n", "\n")
    parts = normalized.split("\n\n")
    blocks = []
    index = 0
    while index < len(parts):
        block = parts[index].strip()
        if not block:
            index += 1
            continue
        blocks.append(block)
        index += 1
    return blocks


def format_blocks(blocks):
    return "\n\n".join(blocks).rstrip() + "\n"


def should_drop(block):
    lines = block.splitlines()
    if len(lines) < 2:
        return False
    second = lines[1].strip()
    return second.startswith('{"text":') and second.endswith("}")


def main():
    if not os.path.isfile(CONSOLE_PATH):
        raise SystemExit(f"Console file not found: {CONSOLE_PATH}")
    with io.open(CONSOLE_PATH, "r", encoding="utf-8") as f:
        body = f.read()
    blocks = read_blocks(body)
    kept = []
    for block in blocks:
        if should_drop(block):
            continue
        kept.append(block)
    cleaned = format_blocks(kept)
    with io.open(CONSOLE_PATH, "w", encoding="utf-8") as f:
        f.write(cleaned)
    print(f"cleaned {len(blocks) - len(kept)} legacy blocks from Console.txt")


if __name__ == "__main__":
    main()
