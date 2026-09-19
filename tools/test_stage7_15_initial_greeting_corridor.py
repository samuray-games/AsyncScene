from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


source = SOURCE.read_text(encoding="utf-8")
docs = DOCS.read_text(encoding="utf-8")
require(source == docs, "initial greeting source/docs mirrors differ")

for text in (
    'id: "rayhan_greeting", speakerId: "npc_stage7_ken", name: "Райхан", text: "всем привет в этом чатике!"',
    'id: "nastya_greeting", speakerId: "npc_stage7_mika", name: "Настя", text: "Приветик!"',
    'id: "oleg_greeting", speakerId: "npc_bandit", name: "Олег", text: "здарова)"',
    'id: "rayhan_directed_greeting", speakerId: "npc_stage7_ken", name: "Райхан", text: `привет, ${playerNickname()}`',
    'const introEntries = INTRO_LINES.concat([',
    'const isLastIntroEntry = index === introEntries.length - 1;',
    'onComplete: () => {',
    'if (!active || phase !== "intro") return;',
    'phase = "awaiting_first";',
    'scheduleSilencePrompt();',
    'if (silenceTimer) clearTimeout(silenceTimer);',
    'silenceTimer = null;',
):
    require(text in source, f"missing four-message/timer contract marker: {text}")

require(source.index('id: "rayhan_greeting"') < source.index('id: "nastya_greeting"') < source.index('id: "oleg_greeting"'), "initial greeting order changed")
require(source.count('scheduleSilencePrompt();') == 1, "silence timer must have only the fourth-greeting completion call site")
require(source.index('phase = "awaiting_first";') < source.index('scheduleSilencePrompt();'), "awaiting_first must precede timer start")

print("PASS_STAGE7_15_INITIAL_GREETING_CORRIDOR")
