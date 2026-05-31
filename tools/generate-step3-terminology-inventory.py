#!/usr/bin/env python3
import csv, html.parser, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTS = [ROOT/'docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv', ROOT/'AsyncScene/Web/terminology/STEP3_TERMINOLOGY_INVENTORY.csv']
SOURCES = []
for base in ['docs','AsyncScene/Web']:
    for p in (ROOT/base).rglob('*.js'):
        s = str(p.relative_to(ROOT))
        if 'AsyncSceneLogs/' in s or '/dev/' in s or s.endswith('/logger.js'):
            continue
        SOURCES.append(p)
    for rel in ['index.html']:
        SOURCES.append(ROOT/base/rel)
SOURCES = sorted(set(SOURCES), key=lambda p: str(p.relative_to(ROOT)))
CATEGORIES = {'Button','BlockTitle','ResourceName','Status','Error','Hint','Toast','ResultCard','EmptyState','Cooldown','EconomyReason','ChatLine','DMLine','SystemLine','Other'}
FEATURE_RULES = [
    ('chat_ui', ['chat','чат','бабл','площадь','заслать','пиши что']),
    ('battle_ui', ['battle','battles','баттл','победа','поражение','толпа решает','атак','защита','соперник']),
    ('dm_ui', ['dm','личк','личку','teach','обучил','аргумент']),
    ('events_voting_crowd', ['event','событ','голос','впис','толпа','vote','crowd']),
    ('reports_cop_flow', ['report','cop','сдать','бандит','токсик','проверя','приняты меры','обвин']),
    ('escape', ['escape','свал','взятк']),
    ('ignore', ['ignore','игнор','отвалил']),
    ('rematch', ['rematch','реванш','ещё раз']),
    ('training_econ04', ['training','train','обуч','учен','teach']),
    ('respect_econ08', ['respect','респект','уваж','rep']),
    ('p2p', ['p2p','перевод','получатель','донат','отдал']),
    ('price_caps', ['cap','лимит','price','цена','дороже','неделя']),
    ('cooldowns', ['cooldown','перезаряд','подожд','осталось','ещё','занят предыдущим']),
    ('economy_toasts', ['toast','💰','points','пойнт','монет','цена','награда','штраф']),
    ('result_cards', ['result','итог','карточ','win','lose','draw','победа','поражение']),
    ('empty_states', ['empty','ничего','пусто','нет событий','сплошная болтовня']),
    ('disabled_states', ['disabled','нельзя','не хватает','закрыт','нет такого','нет 💰']),
    ('pending_states', ['pending','ждём','проверя','сейчас','занят','ожида']),
    ('success_fail_states', ['ok','fail','принято','не удалось','получилось','не получилось','выиграл','проиграл']),
]

def clean_js_string(s):
    try:
        return bytes(s, 'utf-8').decode('unicode_escape')
    except Exception:
        return s.replace('\\n','\n').replace('\\"','"').replace("\\'","'").replace('\\`','`')

def category_for(text, src, ctx):
    low = (text + ' ' + src + ' ' + ctx).lower()
    if any(x in low for x in ['button','btn','label','закрыть','очистить','погнали','рандом','заслать','сдать','свалить','меню']) and len(text) < 80:
        return 'Button'
    if any(x in low for x in ['title','header','block','меню','личка','баттлы','события']) and len(text) < 60:
        return 'BlockTitle'
    if any(x in low for x in ['влияние','репутация','пойнты','победы','💰','rep','points','influence']) and len(text) < 80:
        return 'ResourceName'
    if any(x in low for x in ['ошиб','не удалось','нет такого','не хватает','нельзя','invalid','fail','false block']):
        return 'Error'
    if any(x in low for x in ['hint','placeholder','подсказ','введи','пиши','кликни','ответь']):
        return 'Hint'
    if any(x in low for x in ['toast','получила','отдал','награда','штраф','+','-']) and any(y in low for y in ['💰','rep','⚡','репутац','пойнт']):
        return 'Toast'
    if any(x in low for x in ['result','победа','поражение','ничья','свалил','толпа решает']):
        return 'ResultCard'
    if any(x in low for x in ['empty','ничего','пусто','сплошная болтовня']):
        return 'EmptyState'
    if any(x in low for x in ['cooldown','осталось','подожд','занят предыдущим','ещё {sec}']):
        return 'Cooldown'
    if any(x in low for x in ['reason','цена','лимит','cap','стоимость','дороже']):
        return 'EconomyReason'
    if 'pushchat' in low or 'chat' in src.lower() or 'чат' in low:
        return 'ChatLine'
    if 'dm' in src.lower() or 'личк' in low:
        return 'DMLine'
    if 'система' in low or 'system' in low:
        return 'SystemLine'
    if any(x in low for x in ['принято','занят','проверя','ждём','готов','открыт','закрыт']):
        return 'Status'
    return 'Other'

def buckets_for(text, src, ctx):
    low = (text + ' ' + src + ' ' + ctx).lower()
    hits=[]
    for b, terms in FEATURE_RULES:
        if any(t in low for t in terms):
            hits.append(b)
    return hits or ['general_interface']

def nearest_context(lines, idx):
    ctx=[]
    for j in range(max(0, idx-4), idx+1):
        line = lines[j]
        m = re.search(r'([A-Za-z0-9_$А-Яа-яЁё-]+)\s*:', line)
        if m: ctx.append(m.group(1))
        m = re.search(r'function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=|([A-Za-z0-9_$]+)\s*\(', line)
        if m: ctx.append(next(g for g in m.groups() if g))
    return ctx[-1] if ctx else 'literal_at_line'

JS_PAT = re.compile(r'(["\'`])((?:\\.|(?!\1).)*?)(\1)')
rows=[]
seq=1
for p in SOURCES:
    rel=str(p.relative_to(ROOT))
    text=p.read_text(encoding='utf-8', errors='ignore')
    lines=text.splitlines()
    if p.suffix == '.js':
        for m in JS_PAT.finditer(text):
            raw=m.group(2)
            val=raw.replace('\\n','\\\\n').replace('\\\"','\"').replace("\\'","'").replace('\\`','`')
            if not val.strip():
                continue
            # Keep likely UI/core terminology: Cyrillic, resource emoji, or core exact English labels.
            if not (re.search(r'[А-Яа-яЁё]', val) or any(ch in val for ch in ['💰','⚡','⭐','🏆','✓','✕']) or val in ['AsyncScene','DRAW','DM']):
                continue
            line=text.count('\n',0,m.start())+1
            ctx=nearest_context(lines, line-1)
            cat=category_for(val, rel, ctx)
            vars_=re.findall(r'\{([A-Za-z0-9_]+)\}|\$\{([^}]+)\}', val)
            varlist=[a or b for a,b in vars_]
            dyn='dynamic_template' if varlist or '${' in val else 'static_string'
            bucket=','.join(buckets_for(val, rel, ctx))
            rows.append({
                'TERM_ID': f'ST3_{seq:04d}', 'category': cat, 'currentText': val.replace('\r',' ').replace('\n','\\n'),
                'screenOrFeature': bucket, 'sourceFile': rel, 'sourceKeyOrFunction': ctx,
                'triggerCondition': dyn, 'notes': ('variables=' + '|'.join(varlist) + '; ' if varlist else '') + f'line={line}'
            }); seq+=1
    elif p.name == 'index.html':
        # HTML visible text plus selected UI attributes.
        for mm in re.finditer(r'(?:placeholder|aria-label|title)="([^"]+)"|>([^<>]+)<', text):
            val=(mm.group(1) or mm.group(2) or '').strip()
            if not val or val.startswith('<') or not (re.search(r'[А-Яа-яЁё]', val) or val=='AsyncScene'):
                continue
            line=text.count('\n',0,mm.start())+1
            ctx='html_text_or_attribute'
            cat=category_for(val, rel, ctx)
            bucket=','.join(buckets_for(val, rel, ctx))
            rows.append({'TERM_ID': f'ST3_{seq:04d}', 'category': cat, 'currentText': val,
                'screenOrFeature': bucket, 'sourceFile': rel, 'sourceKeyOrFunction': ctx,
                'triggerCondition': 'static_string', 'notes': f'line={line}'})
            seq+=1

# Add explicit forbidden placeholder rows only for runtime-composed DOM text families that cannot be enumerated by static literals alone.
for label, template, feature, src, key, vars_ in [
    ('RUNTIME_CHAT_BUBBLE_TEMPLATE','{speaker}: {message}','chat_ui','docs/ui/ui-chat.js','renderChat','speaker|message'),
    ('RUNTIME_DM_BUBBLE_TEMPLATE','{speaker}: {message}','dm_ui','docs/ui/ui-dm.js','renderDM','speaker|message'),
    ('RUNTIME_RESULT_CARD_NUMERIC_SUMMARY','{name}: {resultLine}; ΔREP {repDelta}; Δ💰 {pointsDelta}','result_cards','docs/ui/ui-battles.js','renderBattleResult','name|resultLine|repDelta|pointsDelta'),
]:
    rows.append({'TERM_ID': label, 'category':'Other', 'currentText':template, 'screenOrFeature':feature,
        'sourceFile':src, 'sourceKeyOrFunction':key, 'triggerCondition':'forbidden_placeholder_dynamic_template',
        'notes':'variables='+vars_+'; runtime-composed text family'})

for out in OUTS:
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('w', encoding='utf-8', newline='') as f:
        w=csv.DictWriter(f, fieldnames=['TERM_ID','category','currentText','screenOrFeature','sourceFile','sourceKeyOrFunction','triggerCondition','notes'])
        w.writeheader(); w.writerows(rows)
print(f'wrote {len(rows)} rows to ' + ', '.join(str(o.relative_to(ROOT)) for o in OUTS))
