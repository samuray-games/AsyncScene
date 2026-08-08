"""Deterministic validation for visible selector-response relay contracts."""

from __future__ import annotations

from dataclasses import dataclass


PROMPT_REQUIRED_LINES = (
    "At WAITING_FOR_INVENTORY_CONFIRMATION and WAITING_FOR_MODEL_SELECTION, faithfully relay the complete executable selector stdout to the user-visible response.",
    "At WAITING_FOR_INVENTORY_CONFIRMATION, relay the complete authoritative inventory with every model and supported effort plus revision, hashes, source, current status, and exact next response; do not print evaluation or recommendation.",
    "At WAITING_FOR_MODEL_SELECTION, relay state directory, current status, authorization path, snapshot revision, snapshot hash, source artifact, model count, model-effort pair count, evaluated pair count, required capability score, the complete ordered evaluation matrix, cheapest rejected pair and reason, recommended pair, next more capable plausible pair, and exact next response.",
    "Do not summarize, truncate, omit evaluated pairs, duplicate evaluated pairs, reconstruct different values, or replace executable selector evidence with prose.",
    "Reject the phase and do not advance state when the first stop lacks the complete inventory block or the second stop lacks the complete recommendation block.",
    "When preflight, transition, state, or mutation-authorization evidence is requested, print the complete raw executable output or guard/state JSON without paraphrase.",
)

SKILL_REQUIRED_LINES = (
    "At `WAITING_FOR_INVENTORY_CONFIRMATION` and `WAITING_FOR_MODEL_SELECTION`, the user-visible response must faithfully relay the complete executable selector stdout.",
    "complete authoritative inventory",
    "every evaluated model-effort pair exactly once",
    "truncate the executable output",
    "replace executable evidence with an assistant-generated approximation",
    "binds hashes of both mandatory relay blocks",
)

ROUTER_REQUIRED_LINES = (
    "The router must carry the selector's exact output forward unchanged at `WAITING_FOR_INVENTORY_CONFIRMATION` and `WAITING_FOR_MODEL_SELECTION`, including the complete inventory or every evaluated pair as appropriate, the current state, and the exact next response.",
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
        "exact next response:",
    )
    status_line = _line_with_prefix(selector_lines, "status:")
    is_inventory = status_line == "status: WAITING_FOR_INVENTORY_CONFIRMATION"
    is_evaluation = status_line == "status: WAITING_FOR_MODEL_SELECTION"
    if is_evaluation:
        required_lines += (
            "evaluated pair count:",
            "required capability score:",
            "cheapest rejected pair:",
            "recommended pair:",
            "next more capable plausible pair:",
        )
    elif is_inventory:
        required_lines += ("source artifact blob sha:", "complete authoritative inventory:")
    for prefix in required_lines:
        expected = _line_with_prefix(selector_lines, prefix)
        if expected is None:
            failures.append(f"selector output missing required line: {prefix}")
        elif expected not in visible_lines:
            failures.append(f"missing selector line: {expected}")

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

    if is_inventory:
        forbidden_prefixes = (
            "evaluated pair count:", "required capability score:", "evaluation matrix:",
            "cheapest rejected pair:", "recommended pair:", "next more capable plausible pair:",
        )
        for prefix in forbidden_prefixes:
            if _line_with_prefix(selector_lines, prefix) is not None:
                failures.append(f"inventory stop leaks forbidden selector block: {prefix}")
        model_count_line = _line_with_prefix(selector_lines, "model count:")
        if model_count_line is not None:
            try:
                expected_models = int(model_count_line.split(":", 1)[1].strip())
            except ValueError:
                failures.append("selector model count is malformed")
            else:
                if len(expected_matrix) != expected_models:
                    failures.append("selector inventory does not contain every model exactly once")

    if is_evaluation:
        expected_count_line = _line_with_prefix(selector_lines, "evaluated pair count:")
        actual_count_line = _line_with_prefix(actual_window_lines, "evaluated pair count:")
        if expected_count_line != actual_count_line:
            failures.append("relay evaluated-pair count differs from selector output")
        if expected_count_line is not None:
            try:
                evaluated, total = expected_count_line.split(":", 1)[1].strip().split("/", 1)
                evaluated_count, total_count = int(evaluated), int(total)
            except ValueError:
                failures.append("selector evaluated-pair count is malformed")
            else:
                if evaluated_count != total_count or len(expected_matrix) != total_count:
                    failures.append("selector recommendation block does not contain every evaluated pair exactly once")

    if window is None:
        failures.append("selector output is not relayed as an ordered visible subsequence")

    return failures
