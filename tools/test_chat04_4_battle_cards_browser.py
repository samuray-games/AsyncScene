"""Optional standalone Chat04.4 browser regression against exact local fixture bytes.

Requires Python playwright and a Chromium executable. Uses set_content plus inlined
fixture CSS/JS because the execution sandbox may block localhost/file navigation.
Run: python3 tools/test_chat04_4_battle_cards_browser.py
"""
from pathlib import Path
import shutil
import sys

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def run_case(browser, width, height, touch):
    context = browser.new_context(viewport={"width": width, "height": height}, has_touch=touch)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.set_content('<!doctype html><html lang="ru"><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body><div id="battle-preview"></div></body></html>')
    page.add_style_tag(content=(HERE / "chat04_4_battle_cards.css").read_text())
    code = (HERE / "chat04_4_battle_cards.mjs").read_text()
    # The module has no imports and all exports are declarations. Inline the identical
    # function bodies for document-based testing where module URLs are blocked.
    check('import ' not in code, "fixture should remain import-free")
    code = code.replace('export const ', 'const ').replace('export function ', 'function ')
    page.add_script_tag(content=code + '\nconst fixtureMemory = new Map(); window.__fixture = mountPreview(document.querySelector("#battle-preview"), {storage: {getItem: k => fixtureMemory.get(k) ?? null, setItem: (k,v) => fixtureMemory.set(k,v), removeItem: k => fixtureMemory.delete(k)}});')

    def perform_click(locator):
        if touch:
            locator.tap()
        else:
            locator.click()

    def open_editor():
        perform_click(page.locator('[data-battle-id="бой-101"] .bc-bubble.left .bc-edit-button').first)
        area = page.get_by_role('textbox', name='Редактор реплики')
        check(area.count() == 1, "text editor must be open")
        return area

    # Original regression: one click/tap on "Disputes" must both save text AND navigate.
    area = open_editor()
    area.fill('Текст перед переходом в Споры')
    perform_click(page.get_by_role('button', name='Споры', exact=True))
    check(page.locator('.bc-navigation button.active').inner_text() == 'Споры',
          'single outside click/tap should activate Disputes')
    check(page.evaluate('window.__fixture.getState().battles[0].sides.A.attack.text') == 'Текст перед переходом в Споры',
          'the outside action must persist edited text')

    # Navigate back, edit again, one click commits updated draft and only once.
    perform_click(page.get_by_role('button', name='Общая лента', exact=True))
    area = open_editor()
    area.fill('Текст перед подтверждением')
    perform_click(page.get_by_role('button', name='Подтвердить обе реплики'))
    current = page.evaluate('window.__fixture.getState().battles[0].sides.A')
    check(current['committed'], 'outside click on commit should commit in one interaction')
    check(current['attack']['text'] == 'Текст перед подтверждением',
          'the commit must use newly edited text, not the previous draft')
    check(page.locator('[data-battle-id="бой-101"] .bc-locked').count() == 1,
          'UI should show confirmed state')
    check(page.locator('[data-battle-id="бой-101"] .bc-edit-button').count() == 0,
          'committed text should be read-only')

    # Reset and test another editor entry in same synthetic battle.
    perform_click(page.get_by_role('button', name='Сбросить тестовый сценарий'))
    area = open_editor()
    area.fill('Отмена пробного ввода')
    area.press('Escape')
    check(page.evaluate('window.__fixture.getState().battles[0].sides.A.attack.text') != 'Отмена пробного ввода',
          'Escape should cancel without editing state')

    # Clicking another edit control must open it on the first tap, while
    # committing the earlier unsaved editor without losing the action.
    area = open_editor()
    area.fill('Атака перед выбором другой реплики')
    perform_click(page.locator('[data-battle-id="бой-101"] .bc-bubble.left .bc-edit-button').last)
    check(page.get_by_role('textbox', name='Редактор реплики').count() == 1,
          'second editor must open on the first interaction')
    check(page.evaluate('window.__fixture.getState().battles[0].sides.A.attack.text') == 'Атака перед выбором другой реплики',
          'switching editors must save the previous draft')
    page.get_by_role('textbox', name='Редактор реплики').press('Escape')

    # Switching the synthetic viewer while editing should still save, including
    # select/change-based interactions that may not emit a click on mobile Safari.
    area = open_editor()
    area.fill('Текст перед сменой роли')
    page.get_by_role('combobox', name='Режим просмотра').select_option('B')
    check(page.evaluate('window.__fixture.getState().viewer') == 'B', 'viewer must switch')
    check(page.evaluate('window.__fixture.getState().battles[0].sides.A.attack.text') == 'Текст перед сменой роли',
          'change capture should flush draft before role rerender')
    check(page.locator('body').evaluate('(el) => el.scrollWidth <= window.innerWidth'),
          'body must not have horizontal overflow')
    check(not errors, f'no browser errors allowed: {errors}')
    context.close()
    print(f'BROWSER PASS {width}x{height} touch={touch}: navigation, commit, Escape, role-change, viewport')


def main():
    chromium = shutil.which('chromium') or shutil.which('google-chrome')
    if not chromium:
        raise SystemExit('Chromium executable not found; install Chromium to run browser regressions')
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium, headless=True, args=['--no-sandbox'])
        try:
            for width, height, touch in [(1440, 900, False), (393, 852, True), (320, 568, True)]:
                run_case(browser, width, height, touch)
        finally:
            browser.close()
    print('Chat04.4 browser regression: 3/3 PASS')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'BROWSER FAIL: {type(exc).__name__}: {exc}', file=sys.stderr)
        sys.exit(1)
