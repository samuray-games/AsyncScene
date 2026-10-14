#!/usr/bin/env python3
"""Exact-copy routing regression for the five-profile start and essence surfaces."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene" / "Web"
DEPLOYED = ROOT / "docs"
PROJECT = ROOT / "AsyncScene" / "AsyncScene.xcodeproj" / "project.pbxproj"
PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
SWITCH_ORDER = ("boomer", "genX", "millennial", "zoomer", "alpha", "boomer")
CSS_VERSION = "start_essence_human_copy_20261014a"
START_BLOCK_SHA256 = "ce5588d891bbb8c140ca3dfac029b1981acfecafdbaf78cef03acdae4db4f6a0"
JS_VERSION = "start_essence_five_voices_20261014b"
TITLE = "Что за игра?"

START = {
    "boomer": {"intro": ["Здесь чужая ссора может неожиданно стать вашим делом.", "За кого вступиться, кому возразить и когда отступить — решаете вы."], "birth_digits_label": "Последние две цифры года рождения", "profile_helper": "Это влияет только на оформление. Год рождения не сохраняется; стиль можно изменить позже.", "fantasy_birth_label": "Какой год вам ближе по ощущениям?", "start_reset": "Сбросить выбор"},
    "genX": {"intro": ["Зашёл узнать, что тут происходит. Уже кто-то выясняет отношения.", "Не лезть или ввязаться — решай сам."], "birth_digits_label": "Две последние цифры года рождения", "profile_helper": "Год нужен только для оформления. Не сохраняем. Стиль можно сменить потом.", "fantasy_birth_label": "Год по ощущениям", "start_reset": "Сбросить"},
    "millennial": {"intro": ["Хотел просто почитать чат. А тебя уже втянули в спор.", "Встать на чью-то сторону легко. Разгрести последствия — сложнее."], "birth_digits_label": "Последние 2 цифры года рождения", "profile_helper": "Подбираем оформление по году. Сам год не храним, стиль можно сменить позже.", "fantasy_birth_label": "А по ощущениям я из...", "start_reset": "Сбросить выбор"},
    "zoomer": {"intro": ["Зашёл на минутку — уже кто-то устроил разбор.", "Впишешься, поддержишь или скипнешь?"], "birth_digits_label": "Последние 2 цифры года", "profile_helper": "Это чисто для внешнего вида. Год не сохраняем, стиль можно сменить.", "fantasy_birth_label": "по вайбу я из...", "start_reset": "Сбросить"},
    "alpha": {"intro": ["в чате замес.", "ты в деле или мимо?"], "birth_digits_label": "2 цифры года рождения", "profile_helper": "это только стиль. год не сохраняем. сменить можно.", "fantasy_birth_label": "по вайбу я из...", "start_reset": "Сброс"},
}
BLOCKS = {
    "boomer": [("Здесь всё решают отношения.", "Люди спорят, поддерживают друг друга и меняют мнение. Вы выбираете, когда вмешаться и чью сторону занять."), ("За поступками следуют последствия.", "Поддержали одного — другой может обидеться. Даже выигранный спор не всегда означает, что всё улажено."), ("Играйте без спешки.", "Не нужно договариваться о времени встречи. Заходите, когда вам удобно.")],
    "genX": [("Тут каждый за кого-то.", "Один спорит, другой вступается, третий подливает масла. Вмешиваться или нет — сам решай."), ("За слова отвечают.", "Помог одному — нажил недовольного. Бывает, выиграл спор, а неприятности остались."), ("Без обязательных сборов.", "Зашёл, сделал своё дело, вышел. Ждать, пока все появятся онлайн, не требуется.")],
    "millennial": [("Здесь чат быстро становится личным.", "Кто-то спорит, кто-то зовёт на помощь. План был просто посмотреть, но ты уже выбираешь сторону."), ("Карма без кнопки «отменить».", "Поддержал одного — второй обиделся. Даже выигранный спор иногда запускает следующий."), ("Никакой вечерней переклички.", "Заходишь, когда есть время. Сделал выбор, вернулся позже — игра не требует собирать всех к одному часу.")],
    "zoomer": [("Здесь легко влететь в чужой движ.", "Споры, вбросы, просьбы о помощи. Можешь вписаться, можешь остаться в стороне."), ("За вброс прилетит ответ.", "Поддержал одного — другой уже косится. Победа в споре не всегда закрывает конфликт."), ("Без «все онлайн в девять».", "Залетел, выбрал, вышел. Никого караулить не надо.")],
    "alpha": [("тут у всех своё мнение", "один спорит. другой зовёт помочь. ты за кого?"), ("влез — будет ответ", "кого-то поддержал — другой может обидеться. даже победа не всегда финал."), ("зашёл. выбрал. вышел.", "все онлайн сразу не нужны. вернёшься потом.")],
}
COMMON = {"title": "Асинхрония", "start_start": "Начать", "start_continue": "Продолжить игру", "rules_action": "Что за игра?", "digit_up_first": "Увеличить первую цифру", "digit_down_first": "Уменьшить первую цифру", "digit_up_second": "Увеличить вторую цифру", "digit_down_second": "Уменьшить вторую цифру"}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def object_source(source: str, profile: str, kind: str) -> str:
    if kind == "data":
        start = source.index("Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({")
        match = re.search(rf"    {profile}: Object\.freeze\(\{{(.*?)\n    \}}\),?", source[start:], re.S)
    elif kind == "tone":
        start = source.index("const START_PROFILE_OVERRIDES = Object.freeze({")
        match = re.search(rf"    {profile}: Object\.freeze\(\{{(.*?)\n    \}}\),?", source[start:], re.S)
    else:
        start = source.index("function resolveStartScreenText")
        match = re.search(rf"    const {profile} = \{{(.*?)\n    \}};", source[start:], re.S)
    assert match, (profile, kind)
    return match.group(1)


def check_exact_fields(block: str, profile: str, layer: str) -> None:
    expected = {**COMMON, **START[profile]}
    expected.pop("title")
    expected.pop("intro")
    expected["async_value"], expected["no_simultaneous_required"] = START[profile]["intro"]
    title_key = "title" if layer == "tone" else "start_title"
    expected[title_key] = COMMON["title"]
    for key, value in expected.items():
        match = re.search(rf'(?m)^\s*(?:"{re.escape(key)}"|{re.escape(key)}):\s*"((?:[^"\\]|\\.)*)"', block)
        assert match, f"{layer}.{profile} missing {key}"
        assert match.group(1) == value, (layer, profile, key, value, match.group(1))


def harness(js: str, args: list[Path]) -> object:
    with tempfile.TemporaryDirectory() as folder:
        path = Path(folder) / "harness.js"
        path.write_text(js, encoding="utf-8")
        result = subprocess.run(["node", str(path), *(str(arg) for arg in args)], check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def main() -> None:
    mirrors = ("system.js", "data.js", "ui/ui-boot.js", "ui/ui-profile-visual-tone-repair.js", "ui/ui-stage7-essence.js", "ui/ui-stage7-essence.css", "index.html")
    for relative in mirrors:
        if relative != "ui/ui-boot.js":
            assert (SOURCE / relative).read_bytes() == (DEPLOYED / relative).read_bytes(), f"source/docs mirror differs: {relative}"

    index = read(SOURCE / "index.html")
    for resource, version in (("system.js", JS_VERSION), ("data.js", JS_VERSION), ("ui/ui-boot.js", JS_VERSION), ("ui/ui-stage7-essence.js", JS_VERSION), ("ui/ui-profile-visual-tone-repair.js", JS_VERSION)):
        tag = f'{resource}?v={version}'
        assert tag in index, f"stale or missing cache-buster: {tag}"
    assert f'ui/ui-stage7-essence.css?v={CSS_VERSION}' in index
    assert 'aria-label="Закрыть"' in read(SOURCE / "ui/ui-stage7-essence.js")
    assert "Game.UI.getStage7EssenceCopy = copyFor;" in read(SOURCE / "ui/ui-stage7-essence.js")

    data = read(SOURCE / "data.js")
    tone = read(SOURCE / "ui/ui-profile-visual-tone-repair.js")
    boot = read(SOURCE / "ui/ui-boot.js")
    for profile in PROFILES:
        check_exact_fields(object_source(data, profile, "data"), profile, "data")
        check_exact_fields(object_source(tone, profile, "tone"), profile, "tone")
        check_exact_fields(object_source(boot, profile, "boot"), profile, "boot")
        check_exact_fields(object_source(read(DEPLOYED / "data.js"), profile, "data"), profile, "data")
        check_exact_fields(object_source(read(DEPLOYED / "ui" / "ui-profile-visual-tone-repair.js"), profile, "tone"), profile, "tone")
        check_exact_fields(object_source(read(DEPLOYED / "ui" / "ui-boot.js"), profile, "boot"), profile, "boot")

    start_js = r'''const fs=require("fs"),vm=require("vm");global.window=global;global.Game={};const log=console.log;console.log=()=>{};vm.runInThisContext(fs.readFileSync(process.argv[2],"utf8"));vm.runInThisContext(fs.readFileSync(process.argv[3],"utf8"));console.log=log;const d=Game.Data;const order=%s;const rows=[];for(const p of order){d.setUiProfile(p);rows.push({profile:d.getUiProfile(),title:d.resolveStartScreenText("start_title"),intro:[d.resolveStartScreenText("async_value"),d.resolveStartScreenText("no_simultaneous_required")],birth:d.resolveStartScreenText("birth_digits_label"),helper:d.resolveStartScreenText("profile_helper"),feeling:d.resolveStartScreenText("fantasy_birth_label"),reset:d.resolveStartScreenText("start_reset"),start:d.resolveStartScreenText("start_start"),continue:d.resolveStartScreenText("start_continue"),rules:d.resolveStartScreenText("rules_action"),digits:["digit_up_first","digit_down_first","digit_up_second","digit_down_second"].map(k=>d.resolveStartScreenText(k))})}console.log(JSON.stringify(rows));process.exit(0);''' % json.dumps(SWITCH_ORDER)
    start_rows = harness(start_js, [SOURCE / "system.js", SOURCE / "data.js"])
    for i, profile in enumerate(SWITCH_ORDER):
        row = start_rows[i]
        assert row["profile"] == profile
        assert row["title"] == COMMON["title"]
        assert row["intro"] == START[profile]["intro"]
        for field in ("birth", "helper", "feeling", "reset"):
            key = {"birth":"birth_digits_label", "helper":"profile_helper", "feeling":"fantasy_birth_label", "reset":"start_reset"}[field]
            assert row[field] == START[profile][key], (profile, field, row[field])
        assert (row["start"], row["continue"], row["rules"]) == ("Начать", "Продолжить игру", "Что за игра?")
        assert row["digits"] == [COMMON["digit_up_first"], COMMON["digit_down_first"], COMMON["digit_up_second"], COMMON["digit_down_second"]]

    modal_js = r'''const fs=require("fs"),vm=require("vm");global.window=global;global.Game={UI:{}};vm.runInThisContext(fs.readFileSync(process.argv[2],"utf8"));const api=Game.UI;const order=%s;const rows=order.map(p=>({profile:p,copy:api.getStage7EssenceCopy(p)}));console.log(JSON.stringify({rows,profiles:api.getStage7EssenceProfiles()}));''' % json.dumps(SWITCH_ORDER)
    modal = harness(modal_js, [SOURCE / "ui" / "ui-stage7-essence.js"])
    assert modal["profiles"] == list(PROFILES)
    for row in modal["rows"]:
        profile = row["profile"]
        copy = row["copy"]
        assert copy["profile"] == profile
        assert copy["title"] == TITLE and copy["close"] == "Вернуться"
        assert [{"heading": b["heading"], "body": b["body"]} for b in copy["blocks"]] == [{"heading": h, "body": body} for h, body in BLOCKS[profile]]
    assert modal["rows"][-1]["copy"] == modal["rows"][0]["copy"], "return to Boomer leaked previous profile copy"
    boomer = " ".join([START["boomer"]["intro"][0], START["boomer"]["intro"][1], *(part for h,b in BLOCKS["boomer"] for part in (h,b))])
    assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|играй|заходи|решай)\b", boomer, re.I)
    alpha = " ".join(part for h,b in BLOCKS["alpha"] for part in (h,b))
    assert alpha == alpha.lower()

    for path in (SOURCE / "data.js", SOURCE / "system.js", SOURCE / "ui" / "ui-boot.js", SOURCE / "ui" / "ui-stage7-essence.js", SOURCE / "ui" / "ui-profile-visual-tone-repair.js"):
        subprocess.run(["node", "--check", str(path)], check=True, capture_output=True, text=True)
    css = read(SOURCE / "ui" / "ui-stage7-essence.css")
    assert "overflow-wrap:anywhere" in css
    assert css.count("{") == css.count("}")
    project = read(PROJECT)
    assert "PBXFileSystemSynchronizedRootGroup" in project and "fileSystemSynchronizedGroups = (" in project
    print(json.dumps({"ok": True, "profiles": list(PROFILES), "profileSwitch": list(SWITCH_ORDER), "startFieldsPerProfile": 8, "modalBlocksPerProfile": 3, "fallbackLayers": ["Data.START_SCREEN_PROFILE_TEXTS", "START_PROFILE_OVERRIDES", "ui-boot fallback"], "sourceDocsMirrors": [x for x in mirrors if x != "ui/ui-boot.js"], "knownPreexistingUiBootByteDrift": True, "nodeSyntax": True}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
