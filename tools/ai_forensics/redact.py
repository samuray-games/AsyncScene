"""Fail-closed redaction for published forensic artifacts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import math
import re
from typing import Any

SECRET_KEY_PATTERN = re.compile(
    r"(api[_-]?key|token|secret|password|passwd|authorization|cookie|session|credential|private[_-]?key)",
    re.IGNORECASE,
)
AUTH_HEADER_PATTERN = re.compile(r"(?im)^(authorization\s*:\s*)(.+)$")
COOKIE_HEADER_PATTERN = re.compile(r"(?im)^((?:set-cookie|cookie)\s*:\s*)(.+)$")
REMOTE_URL_PATTERN = re.compile(r"(https?://)([^/\s:@]+):([^/\s@]+)@")
QUERY_SECRET_PATTERN = re.compile(
    r"([?&](?:access[_-]?token|api[_-]?key|auth|authorization|client[_-]?secret|password|secret|token)=)([^&#\s]+)",
    re.IGNORECASE,
)
PRIVATE_KEY_BLOCK_PATTERN = re.compile(
    r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----.*?-----END [A-Z0-9 ]*PRIVATE KEY-----",
    re.DOTALL,
)
PRIVATE_KEY_BEGIN_PATTERN = re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----")
PRIVATE_KEY_END_PATTERN = re.compile(r"-----END [A-Z0-9 ]*PRIVATE KEY-----")
ASSIGNMENT_PATTERN = re.compile(
    r'(?im)^(\s*["\']?[A-Za-z0-9_.-]*?(?:api[_-]?key|token|secret|password|passwd|authorization|cookie|session|credential)[A-Za-z0-9_.-]*["\']?\s*[:=]\s*)(.+?)\s*$'
)


@dataclass(frozen=True)
class RedactionResult:
    text: str
    blocked: bool
    replacements: list[str]
    reasons: list[str]


def _entropy(value: str) -> float:
    if not value:
        return 0.0
    counts = {char: value.count(char) / len(value) for char in set(value)}
    return -sum(p * math.log2(p) for p in counts.values())


def _looks_secret(value: str) -> bool:
    compact = value.strip().strip('"').strip("'")
    if len(compact) < 16:
        return False
    if re.fullmatch(r"[0-9a-f]{40}", compact, re.IGNORECASE):
        return False
    return _entropy(compact) >= 3.2


def sanitize_text(text: str, *, home: str | None = None) -> RedactionResult:
    replacements: list[str] = []
    reasons: list[str] = []
    blocked = False
    sanitized = text

    if PRIVATE_KEY_BEGIN_PATTERN.search(sanitized) and not PRIVATE_KEY_END_PATTERN.search(sanitized):
        return RedactionResult(
            text="",
            blocked=True,
            replacements=[],
            reasons=["malformed private key block"],
        )

    if PRIVATE_KEY_BLOCK_PATTERN.search(sanitized):
        sanitized = PRIVATE_KEY_BLOCK_PATTERN.sub("<redacted:private-key>", sanitized)
        replacements.append("private-key-block")

    for pattern, tag in (
        (AUTH_HEADER_PATTERN, "authorization-header"),
        (COOKIE_HEADER_PATTERN, "cookie-header"),
    ):
        if pattern.search(sanitized):
            sanitized = pattern.sub(r"\1<redacted>", sanitized)
            replacements.append(tag)

    if REMOTE_URL_PATTERN.search(sanitized):
        sanitized = REMOTE_URL_PATTERN.sub(r"\1<redacted>@", sanitized)
        replacements.append("remote-credentials")

    if QUERY_SECRET_PATTERN.search(sanitized):
        sanitized = QUERY_SECRET_PATTERN.sub(r"\1<redacted>", sanitized)
        replacements.append("query-secret")

    def assignment_replacer(match: re.Match[str]) -> str:
        prefix = match.group(1)
        value = match.group(2).strip()
        replacements.append("secret-assignment")
        if value in {"", '""', "''"}:
            reasons.append("empty secret assignment")
        return f"{prefix}<redacted>"

    sanitized = ASSIGNMENT_PATTERN.sub(assignment_replacer, sanitized)

    for line in sanitized.splitlines():
        if ":" not in line and "=" not in line:
            continue
        parts = re.split(r"[:=]", line, maxsplit=1)
        if len(parts) != 2:
            continue
        key, value = parts
        if SECRET_KEY_PATTERN.search(key) and _looks_secret(value):
            escaped = re.escape(value.strip())
            sanitized = re.sub(escaped, "<redacted>", sanitized, count=1)
            replacements.append("high-entropy-secret")

    home_prefixes = {home or str(Path.home())}
    parent = str(Path(home_prefixes.copy().pop()).parent)
    if parent.startswith("/Users/"):
        user_name = Path(home or str(Path.home())).name
        home_prefixes.add(f"/Users/{user_name}")
    for prefix in sorted(home_prefixes, key=len, reverse=True):
        if prefix and prefix in sanitized:
            sanitized = sanitized.replace(prefix, "<HOME>")
            replacements.append("home-path")

    blocked = bool(reasons and not replacements)
    return RedactionResult(
        text=sanitized,
        blocked=blocked,
        replacements=sorted(set(replacements)),
        reasons=sorted(set(reasons)),
    )


def sanitize_json_compatible(payload: Any) -> tuple[Any, list[str], list[str], bool]:
    replacements: list[str] = []
    reasons: list[str] = []
    blocked = False

    def _sanitize(value: Any, key_hint: str = "") -> Any:
        nonlocal blocked
        if isinstance(value, dict):
            return {key: _sanitize(item, str(key)) for key, item in value.items()}
        if isinstance(value, list):
            return [_sanitize(item, key_hint) for item in value]
        if isinstance(value, str):
            result = sanitize_text(value)
            replacements.extend(result.replacements)
            reasons.extend(result.reasons)
            blocked = blocked or result.blocked
            if (
                SECRET_KEY_PATTERN.search(key_hint)
                and "<redacted:private-key>" not in result.text
                and _looks_secret(value)
            ):
                replacements.append("json-secret-value")
                return "<redacted>"
            return result.text
        return value

    sanitized = _sanitize(payload)
    return sanitized, sorted(set(replacements)), sorted(set(reasons)), blocked


def sanitize_json_text(raw_json: str) -> RedactionResult:
    try:
        payload = json.loads(raw_json)
    except json.JSONDecodeError:
        return sanitize_text(raw_json)
    sanitized, replacements, reasons, blocked = sanitize_json_compatible(payload)
    return RedactionResult(
        text=json.dumps(sanitized, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        blocked=blocked,
        replacements=replacements,
        reasons=reasons,
    )
