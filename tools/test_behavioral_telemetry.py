#!/usr/bin/env python3
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/telemetry.js"
MIRROR = ROOT / "docs/telemetry.js"
CONFIG = ROOT / "AsyncScene/Web/telemetry-config.js"
CONFIG_MIRROR = ROOT / "docs/telemetry-config.js"
CONTRACT = ROOT / "AsyncScene/Web/TELEMETRY.md"
CONTRACT_MIRROR = ROOT / "docs/TELEMETRY.md"
INDEX = ROOT / "AsyncScene/Web/index.html"
INDEX_MIRROR = ROOT / "docs/index.html"
STAGE7 = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE7_MIRROR = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLES = ROOT / "AsyncScene/Web/ui/ui-battles.js"
BATTLES_MIRROR = ROOT / "docs/ui/ui-battles.js"
ESSENCE = ROOT / "AsyncScene/Web/ui/ui-stage7-essence.js"
ESSENCE_MIRROR = ROOT / "docs/ui/ui-stage7-essence.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


for left, right, label in (
    (SOURCE, MIRROR, "telemetry runtime"),
    (CONFIG, CONFIG_MIRROR, "telemetry config"),
    (CONTRACT, CONTRACT_MIRROR, "telemetry contract"),
    (INDEX, INDEX_MIRROR, "index"),
    (STAGE7, STAGE7_MIRROR, "Stage 7 controller"),
    (BATTLES, BATTLES_MIRROR, "battle UI"),
    (ESSENCE, ESSENCE_MIRROR, "essence modal"),
):
    require(left.read_bytes() == right.read_bytes(), f"{label} mirrors differ")

source = SOURCE.read_text(encoding="utf-8")
config = CONFIG.read_text(encoding="utf-8")
contract = CONTRACT.read_text(encoding="utf-8")
index = INDEX.read_text(encoding="utf-8")
stage7 = STAGE7.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
essence = ESSENCE.read_text(encoding="utf-8")

required_events = (
    "session_start", "session_end", "screen_enter", "screen_exit",
    "modal_open", "modal_close", "button_click", "action",
    "choice_selected", "state_changed", "question_shown", "question_answered",
    "visibility_hidden", "visibility_visible", "abandon", "return",
)
for event_type in required_events:
    require(f'"{event_type}"' in source, f"missing event type: {event_type}")

for token in (
    'const SCHEMA_VERSION = 1',
    'const MAX_EVENTS = 1000',
    'const MAX_EVENT_AGE_MS = 30 * 24 * 60 * 60 * 1000',
    'const BATCH_SIZE = 50',
    'networkTransmissionDefault: false',
    'privateFriendsAlphaTransportOnly: true',
    'credentialsOrCookies: false',
    'credentials: "omit"',
    'Game.Telemetry = Object.freeze',
    'export: exportData',
    'getEvents:',
    'summary,',
    'rotateIdentity,',
):
    require(token in source, f"missing telemetry contract token: {token}")

require('src="telemetry-config.js?v=behavioral_telemetry_receiver_20260813a"' in index, "telemetry config entrypoint missing")
require('src="telemetry.js?v=behavioral_telemetry_receiver_20260813a"' in index, "telemetry entrypoint missing")
require(index.index('src="util.js?v=2"') < index.index('src="telemetry-config.js?v=behavioral_telemetry_receiver_20260813a"') < index.index('src="telemetry.js?v=behavioral_telemetry_receiver_20260813a"') < index.index('src="state.js?'), "telemetry load order invalid")

for forbidden_read in (".value", ".innerText", ".textContent", "location.search", "location.hash", "document.cookie"):
    require(forbidden_read not in source, f"privacy boundary reads forbidden data: {forbidden_read}")

require('config.enabled !== true || config.mode !== "private_friends_alpha"' in source, "private alpha transport gate missing")
require('endpoint.origin !== String(config.endpointOrigin || "")' in source, "exact endpoint-origin gate missing")
require('endpoint.protocol !== "https:"' in source, "HTTPS transport gate missing")
require('endpoint.pathname !== "/v1/events"' in source, "exact receiver route gate missing")
require('if (!transportConfig() || flushTimer || document.hidden) return' in source, "default-disabled transport scheduling missing")
require('contractVersion: 1' in source, "receiver contract version missing")
require('store.pendingBatches.push(batch)' in source, "durable pending batch missing")
require('latest.pendingBatches = latest.pendingBatches.filter' in source, "successful batch cleanup missing")

for token in (
    'enabled: false',
    'mode: "private_friends_alpha"',
    'cohortId: "private_friends_alpha_2026_08"',
    'endpoint: ""',
    'endpointOrigin: ""',
):
    require(token in config, f"safe pre-provision config missing: {token}")

for forbidden_ui in ("opt-out", "consent dialog", "cookie banner", "refusal control"):
    require(forbidden_ui not in config.lower(), f"player-facing refusal UI leaked into config: {forbidden_ui}")

for token in (
    "G.Telemetry.stateChanged",
    "G.Telemetry.choiceSelected",
    "G.Telemetry.questionShown",
    "G.Telemetry.questionAnswered",
    "G.Telemetry.startCycle",
    "G.Telemetry.completeCycle",
    'data-telemetry-screen',
    'data-telemetry-question',
):
    require(token in stage7, f"Stage 7 explicit instrumentation missing: {token}")

require("Game.Telemetry.choiceSelected" in battles, "battle decisions are not explicitly instrumented")
require(re.search(r'choiceId:\s*argId', battles), "battle choice stable argument ID missing")
require(re.search(r'battleId,', battles), "battle choice stable battle ID missing")
require('Game.Telemetry.setModal("stage7.essence")' in essence, "essence modal open instrumentation missing")
require('Game.Telemetry.clearModal("user_close")' in essence, "essence modal close instrumentation missing")

for privacy_statement in (
    "does not record player-authored text",
    "Network transmission is disabled by default",
    "exact `/v1/events`",
    "bounded exponential delays",
    "Game.Telemetry.export()",
    "Owner-only readback",
    "GET /v1/admin/sessions",
):
    require(privacy_statement in contract, f"telemetry documentation missing: {privacy_statement}")

subprocess.run(["node", "--check", str(SOURCE)], check=True)
subprocess.run(["node", "--check", str(MIRROR)], check=True)
subprocess.run(["node", "--check", str(STAGE7)], check=True)
subprocess.run(["node", "--check", str(STAGE7_MIRROR)], check=True)
subprocess.run(["node", "--check", str(BATTLES)], check=True)
subprocess.run(["node", "--check", str(BATTLES_MIRROR)], check=True)
subprocess.run(["node", "--check", str(ESSENCE)], check=True)
subprocess.run(["node", "--check", str(ESSENCE_MIRROR)], check=True)

print("PASS_BEHAVIORAL_TELEMETRY_CONTRACT")
