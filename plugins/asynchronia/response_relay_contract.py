"""Deterministic validation for visible selector-response relay contracts."""

from __future__ import annotations

from dataclasses import dataclass


PROMPT_REQUIRED_LINES = (
    "At WAITING_FOR_INVENTORY_CONFIRMATION and WAITING_FOR_MODEL_SELECTION, faithfully relay the complete executable selector stdout to the user-visible response.",
    "The visible mutation preflight response must include state directory, current status, authorization path, snapshot revision, snapshot hash, source artifact, model count, model-effort pair count, evaluated pair count, required capability score, the complete ordered evaluation matrix, cheapest rejected pair and reason, recommended pair, next more capable plausible pair, and exact next response.",
    "Do not summarize, truncate, omit evaluated pairs, duplicate evaluated pairs, reconstruct different values, or replace executable selector evidence with prose.",
    "When preflight, transition, state, or mutation-authorization evidence is requested, print the complete raw executable output or guard/state JSON without paraphrase.",
)

SKILL_REQUIRED_LINES = (
    "At `WAITING_FOR_INVENTORY_CONFIRMATION` and `WAITING_FOR_MODEL_SELECTION`, the user-visible response must faithfully relay the complete executable selector stdout.",
    "every evaluated model-effort pair exactly once",
    "truncate the executable output",
    "replace executable evidence with an assistant-generated approximation",
)

ROUTER_REQUIRED_LINES = (
    "The router must carry the selector's exact output forward unchanged at `WAITING_FOR_INVENTORY_CONFIRMATION` and `WAITING_FOR_MODEL_SELECTION`, including every evaluated pair, the current state, and the exact next response.",
    "The router must preserve the exact same-thread fenced `CONTINUE` token when current policy requires the pause.",
)


@dataclass(frozen=True)
class RelayWindow:
    start: int
    end: int


def _selector_lines(text: str) -> list[str]:
    return [line.rstrip() for line in text.splitlines() if line.strip()]


def _find_window(selector_output: str, visible_response: str) -> RelayWindow | None:
    selector_lines = _selector_lines(selector_output)
    visible_lines = _selector_lines(visible_response)
    if not selector_lines:
        return None
    start = None
    cursor = 0
    for selector_line in selector_lines:
        while cursor < len(visible_lines) and visible_lines[cursor] != selector_line:
            cursor += 1
        if cursor >= len(visible_lines):
            return None
        if start is None:
            start = cursor
        cursor += 1
    return RelayWindow(start if start is not None else 0, cursor)


def _matrix_lines(lines: list[str]) -> list[str]:
    return [line for line in lines if line.startswith("- ")]


def _line_with_prefix(lines: list[str], prefix: str) -> str | None:
    return next((line for line in lines if line.startswith(prefix)), None)


def validate_visible_selector_response(selector_output: str, visible_response: str) -> list[str]:
    """Return contract failures for a visible response that should relay selector stdout."""
    failures: list[str] = []
    selector_lines = _selector_lines(selector_output)
    visible_lines = _selector_lines(visible_response)
    window = _find_window(selector_output, visible_response)

    required_lines = (
        "state directory:",
        "status:",
        "authorization path:",
        "snapshot revision:",
        "snapshot hash:",
        "source artifact:",
        "model count:",
        "model-effort pair count:",
        "evaluated pair count:",
        "required capability score:",
        "cheapest rejected pair:",
        "recommended pair:",
        "next more capable plausible pair:",
        "exact next response:",
    )
    for prefix in required_lines:
        expected = _line_with_prefix(selector_lines, prefix)
        if expected is not None and expected not in visible_lines:
            failures.append(f"missing selector line: {expected}")

    status_line = _line_with_prefix(selector_lines, "status:")
    if status_line and status_line not in visible_lines:
        failures.append("relay omits current state line")

    next_response_line = _line_with_prefix(selector_lines, "exact next response:")
    if next_response_line and next_response_line not in visible_lines:
        failures.append("relay omits exact next response line")

    expected_matrix = _matrix_lines(selector_lines)
    actual_window_lines = visible_lines if window is None else visible_lines[window.start:window.end]
    actual_matrix = _matrix_lines(actual_window_lines)
    if actual_matrix != expected_matrix:
        failures.append("relay matrix lines differ from selector output")

    expected_count_line = _line_with_prefix(selector_lines, "evaluated pair count:")
    actual_count_line = _line_with_prefix(actual_window_lines, "evaluated pair count:")
    if expected_count_line != actual_count_line:
        failures.append("relay evaluated-pair count differs from selector output")

    if window is None:
        failures.append("selector output is not relayed as an ordered visible subsequence")

    return failures
