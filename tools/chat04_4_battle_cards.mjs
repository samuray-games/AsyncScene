/* Chat04.4: isolated deterministic UI fixture. NOT a server, security boundary, or combat evaluator. */
export const STORAGE_KEY = 'asynchronia.chat04_4.synthetic.v1';
export const TYPES = Object.freeze({
  attack: Object.freeze([
    { id: 'N', label: 'Наезд', phrases: ['Ты слишком уверен в себе.', 'Говори по делу, без спектакля.'] },
    { id: 'P', label: 'Предъява', phrases: ['Есть вопрос, который надо закрыть.', 'Объясни, зачем ты так поступил.'] },
    { id: 'T', label: 'Подкол', phrases: ['Это была репетиция или весь номер?', 'У тебя аргументы в отпуске?'] }
  ]),
  defense: Object.freeze([
    { id: 'S', label: 'Спокойно', phrases: ['Я услышал. Теперь давай по фактам.', 'Тише. Слова ещё ничего не доказывают.'] },
    { id: 'C', label: 'Контратака', phrases: ['Тот же вопрос можно задать тебе.', 'Тогда объясни собственный поступок.'] },
    { id: 'G', label: 'Агрессия', phrases: ['Не тебе мне указывать.', 'Сначала научись отвечать за слова.'] }
  ])
});
export const COLORS = Object.freeze({ y: 'Жёлтый', o: 'Оранжевый', r: 'Красный' });
const ownKinds = ['attack', 'defense'];
const clone = value => JSON.parse(JSON.stringify(value));
const phrase = (kind, type, index = 0) => TYPES[kind].find(x => x.id === type)?.phrases[index] ?? '';

function side(attackType = 'P', defenseType = 'S', attackColor = 'y', defenseColor = 'y') {
  return {
    committed: false,
    attack: { type: attackType, color: attackColor, phraseIndex: 0, text: phrase('attack', attackType) },
    defense: { type: defenseType, color: defenseColor, phraseIndex: 0, text: phrase('defense', defenseType) }
  };
}
const FIXTURES = [
  {
    id: 'бой-101', date: 1, title: 'Спор у ворот', participants: { A: 'Вы', B: 'Настя' },
    publicStatus: 'Стороны готовят ответы',
    context: ['Настя: Тут правила не для новичков.', 'Вы: Я всё-таки отвечу.'],
    sides: { A: side('P','S','o','y'), B: side('N','C','r','o') },
    result: { mechanicalOutcome: 'B_WIN', explanation: 'Учебный сценарий: механическая победа Насти задана тестовыми данными. Реального расчёта здесь нет.' }
  },
  {
    id: 'бой-102', date: 2, title: 'Очередь в клуб', participants: { A: 'Вы', B: 'Олег' },
    publicStatus: 'Ожидается второй ответ',
    context: ['Олег: Ты уверен, что твоя очередь?', 'Вы: Давай разберёмся.'],
    sides: { A: side('T','C','y','o'), B: side('P','G','o','y') },
    result: { mechanicalOutcome: 'DRAW', explanation: 'Учебный сценарий: ничья из заранее заданного результата. Голосование не запущено.' }
  },
  {
    id: 'бой-103', date: 3, title: 'Разговор на площади', participants: { A: 'Вы', B: 'Мира' },
    publicStatus: 'Бой раскрыт',
    context: ['Мира: Дело не в громкости.', 'Вы: Тогда отвечай на смысл.'],
    sides: { A: side('N','S','r','o'), B: side('T','C','o','y') },
    result: { mechanicalOutcome: 'A_WIN', explanation: 'Учебный сценарий: механическая победа стороны А задана тестовыми данными.' }
  }
];
FIXTURES[1].sides.A.committed = true;
FIXTURES[2].sides.A.committed = true;
FIXTURES[2].sides.B.committed = true;

export function createState() {
  return { battles: clone(FIXTURES), viewer: 'A', view: 'feed', expandedId: 'бой-101', focusId: null };
}
export function isRevealed(battle) {
  return !!(battle?.sides?.A?.committed && battle?.sides?.B?.committed);
}
export function mySide(battle, viewer) {
  return viewer === 'A' || viewer === 'B' ? viewer : null;
}
export function projectBattle(battle, viewer) {
  if (!battle || !battle.sides || !battle.participants) throw Error('Invalid synthetic battle');
  const revealed = isRevealed(battle);
  const own = mySide(battle, viewer);
  const base = {
    battleId: battle.id, title: battle.title, date: battle.date,
    phase: revealed ? 'revealed' : 'pending',
    publicStatus: revealed ? 'Бой раскрыт' : battle.publicStatus,
    mine: own, revealed,
    committed: { A: !!battle.sides.A.committed, B: !!battle.sides.B.committed }
  };
  if (!revealed && !own) {
    // In the real game, the SERVER, not JS or CSS, must produce this filtered public payload.
    return { battleId: base.battleId, date: base.date, phase: base.phase, publicStatus: base.publicStatus, mine: null, revealed: false };
  }
  if (revealed) {
    return { ...base, participants: clone(battle.participants),
      sides: clone(battle.sides),
      result: clone(battle.result),
      ...(own ? { context: clone(battle.context) } : {}) };
  }
  return { ...base, participants: clone(battle.participants),
    sides: { [own]: clone(battle.sides[own]) },
    context: clone(battle.context) };
}
export function projectFeed(state) { return state.battles.map(b => projectBattle(b, state.viewer)); }
export function disputes(state) { return projectFeed(state); } // Same IDs and source, never separate copies.
export function pendingMyTurn(state) {
  if (!mySide(null, state.viewer)) return 0;
  return state.battles.filter(b => !isRevealed(b) && !b.sides[state.viewer].committed).length;
}
function getOwnedEditable(state, battleId, kind) {
  const battle = state.battles.find(b => b.id === battleId);
  const who = state.viewer;
  if (!battle || !mySide(battle, who) || !ownKinds.includes(kind) || isRevealed(battle) || battle.sides[who].committed) return null;
  return battle.sides[who][kind];
}
export function chooseType(state, battleId, kind, type) {
  const draft = getOwnedEditable(state,battleId,kind);
  if (!draft || !TYPES[kind].some(x => x.id === type)) return false;
  draft.type = type; draft.phraseIndex = 0; draft.text = phrase(kind,type); return true;
}
export function chooseColor(state, battleId, kind, color) {
  const draft = getOwnedEditable(state,battleId,kind);
  if (!draft || !Object.hasOwn(COLORS,color)) return false;
  draft.color = color; return true;
}
export function rotatePhrase(state, battleId, kind) {
  const draft = getOwnedEditable(state,battleId,kind);
  if (!draft) return false;
  const options = TYPES[kind].find(x => x.id === draft.type)?.phrases || [];
  draft.phraseIndex = (draft.phraseIndex + 1) % options.length;
  draft.text = phrase(kind,draft.type,draft.phraseIndex); return true;
}
export function saveText(state, battleId, kind, text) {
  const draft = getOwnedEditable(state,battleId,kind);
  if (!draft || typeof text !== 'string') return false;
  const next = text.trim();
  if (!next || next.length > 280) return false; // blank and oversized text keep the old draft.
  draft.text = next; return true;
}
export function commit(state, battleId) {
  const battle = state.battles.find(b=>b.id===battleId);
  const who = state.viewer;
  if (!battle || !mySide(battle,who) || isRevealed(battle) || battle.sides[who].committed) return false;
  if (ownKinds.some(k=>!battle.sides[who][k].text?.trim())) return false;
  battle.sides[who].committed = true;
  return true;
}
export function initialExpandedId(state) {
  return state.battles.find(b=>!isRevealed(b))?.id || state.battles[0]?.id || null;
}
export function restoreSyntheticState(raw) {
  const fresh = createState();
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.battles)) return fresh;
  // Accept only known synthetic IDs, known enum values and texts. Never treat this as authorization.
  const byId = new Map(raw.battles.map(b => [b?.id,b]));
  for (const baseline of fresh.battles) {
    const stored = byId.get(baseline.id);
    if (!stored?.sides) continue;
    for (const who of ['A','B']) {
      // Simulate confirmed action; this is NOT an authoritative server commit.
      if (typeof stored.sides[who]?.committed === 'boolean') baseline.sides[who].committed = stored.sides[who].committed;
      for (const kind of ownKinds) {
        const candidate = stored.sides[who]?.[kind];
        const draft = baseline.sides[who][kind];
        if (TYPES[kind].some(x=>x.id===candidate?.type)) draft.type = candidate.type;
        if (Object.hasOwn(COLORS,candidate?.color)) draft.color = candidate.color;
        if (Number.isInteger(candidate?.phraseIndex) && candidate.phraseIndex>=0 && candidate.phraseIndex<2) draft.phraseIndex=candidate.phraseIndex;
        if (typeof candidate?.text==='string' && candidate.text.trim() && candidate.text.length<=280) draft.text=candidate.text;
      }
    }
  }
  fresh.viewer = ['A','B','spectator'].includes(raw.viewer) ? raw.viewer : 'A';
  fresh.view = ['feed','disputes'].includes(raw.view) ? raw.view : 'feed';
  fresh.expandedId = raw.expandedId === null ? null : (fresh.battles.some(b=>b.id===raw.expandedId) ? raw.expandedId : initialExpandedId(fresh));
  return fresh;
}

const element = (name, className, text) => {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
function button(label,onClick,className='') {
  const b=element('button',className,label); b.type='button'; b.addEventListener('click',onClick); return b;
}
function optionSelect(options,value,onChange,label) {
  const outer=element('label','bc-select'); outer.append(element('span','sr-only',label));
  const sel=element('select',''); sel.setAttribute('aria-label',label);
  for(const [key,name] of options){const opt=element('option','',name);opt.value=key;sel.append(opt);}
  sel.value=value;sel.addEventListener('change',()=>onChange(sel.value));outer.append(sel);return outer;
}
function makeSlot(projected, side, kind, direction, state, persist, rerender) {
  const slot=element('div',`bc-bubble ${direction}`);
  const visible=projected.sides?.[side]?.[kind];
  const self=projected.mine===side;
  const title=element('div','bc-slot-title',`${self ? 'Вы' : projected.participants?.[side] || 'Оппонент'} · ${kind==='attack'?'Атака':'Защита'}`);
  slot.append(title);
  if (!visible) {slot.append(element('p','bc-secret','Решение скрыто до раскрытия')); return slot;}
  const tone=element('span',`bc-color bc-color-${visible.color}`,COLORS[visible.color] || 'Цвет');
  slot.append(tone);
  const locked=projected.revealed || projected.sides?.[side]?.committed;
  if (self && !locked) {
    const row=element('div','bc-tools');
    row.append(optionSelect(TYPES[kind].map(t=>[t.id,t.label]),visible.type,t=>{
      chooseType(state,projected.battleId,kind,t);persist();rerender();
    },`${kind==='attack'?'Тип атаки':'Тип защиты'}`));
    row.append(optionSelect(Object.entries(COLORS),visible.color,c=>{
      chooseColor(state,projected.battleId,kind,c);persist();rerender();
    },'Цвет реплики'));
    row.append(button('↻',()=>{rotatePhrase(state,projected.battleId,kind);persist();rerender()},'bc-rotate'));
    slot.append(row);
  } else {
    slot.append(element('span','bc-type',TYPES[kind].find(t=>t.id===visible.type)?.label||''));
  }
  const content=element('div','bc-content');content.append(element('p','bc-phrase',visible.text));slot.append(content);
  if (self && !locked) {
    const edit=button('Изменить текст',()=>{
      if (content.querySelector('textarea')) return;
      const old=visible.text;
      const editBox=element('div','bc-edit');
      const area=element('textarea','');area.setAttribute('aria-label','Редактор реплики');area.maxLength=280;area.rows=3;area.value=old;
      const controls=element('div','bc-edit-controls');
      let finished=false;
      const outside=e=>{if(!editBox.contains(e.target))end(true)};
      const end=(save)=>{
        if(finished)return;
        finished=true;
        document.removeEventListener('pointerdown',outside,true);
        if(save) saveText(state,projected.battleId,kind,area.value);
        persist();rerender();
      };
      const ok=button('Сохранить',()=>end(true));const cancel=button('Отменить',()=>end(false));
      controls.append(ok,cancel);editBox.append(area,controls);
      content.replaceChildren(editBox);
      area.addEventListener('keydown',e=>{
        if(e.key==='Escape'){e.preventDefault();end(false)}
        if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();end(true)}
      });
      document.addEventListener('pointerdown',outside,true);
      area.focus();area.select();
    },'bc-edit-button');
    slot.append(edit);
  }
  return slot;
}
function makeCard(proj,state,persist,rerender) {
  const article=element('article',`bc-card ${proj.revealed?'is-revealed':''}`);
  article.dataset.battleId=proj.battleId;
  const heading=element('div','bc-heading');
  const exp=state.expandedId===proj.battleId;
  const toggle=button(`${exp?'▾':'▸'} ${proj.title||'Боевой спор'} · ${proj.publicStatus}`,()=>{
    state.expandedId=exp?null:proj.battleId;persist();rerender();
  },'bc-expand');toggle.setAttribute('aria-expanded',String(exp));toggle.setAttribute('aria-controls',`battle-panel-${proj.battleId}`);
  heading.append(toggle);article.append(heading);
  if (!exp) return article;
  const panel=element('section','bc-panel');panel.id=`battle-panel-${proj.battleId}`;
  if (!proj.mine && !proj.revealed) {
    panel.append(element('p','bc-public','Публичный статус. Чужие решения, цвета и тексты недоступны до раскрытия.'));
  } else {
    if (proj.context?.length){const history=element('div','bc-history');history.append(element('strong','','Предыстория'));for(const line of proj.context)history.append(element('p','',line));panel.append(history)}
    const grid=element('div','bc-dialogue');
    const own=proj.mine||'A';const rival=own==='A'?'B':'A';
    const slots=[ [own,'attack','left'],[rival,'defense','right'],[rival,'attack','right'],[own,'defense','left'] ];
    for(const [side,kind,dir] of slots) grid.append(makeSlot(proj,side,kind,dir,state,persist,rerender));
    panel.append(grid);
    if (proj.revealed) {
      const result=element('section','bc-result');result.append(element('h3','','Механический итог (тестовый)'));
      const outcomes={A_WIN:'Победила сторона А',B_WIN:'Победила сторона Б',DRAW:'Ничья'};
      result.append(element('strong','',outcomes[proj.result.mechanicalOutcome]||'Неизвестно'));
      result.append(element('p','',proj.result.explanation));
      result.append(element('p','bc-notice','Голосование и общественное признание здесь не рассчитываются.'));
      panel.append(result);
    } else if (proj.mine) {
      const mineCommitted=proj.committed[proj.mine];
      const action=element('div','bc-actions');
      if(mineCommitted) action.append(element('p','bc-locked','Ваш ход подтверждён. Ожидаем соперника.'));
      else action.append(button('Подтвердить обе реплики',()=>{if(commit(state,proj.battleId)){persist();rerender()}},'bc-commit'));
      panel.append(action);
    }
  }
  article.append(panel);return article;
}
export function mountPreview(root,{ storage=window.sessionStorage }={}) {
  if (!root) throw Error('Missing preview mount');
  let state;
  try { state=restoreSyntheticState(JSON.parse(storage.getItem(STORAGE_KEY))); }
  catch { state=createState(); }
  const persist=()=>{try{storage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{/* demo remains usable without storage */}};
  const render=()=>{
    root.replaceChildren();
    const header=element('header','bc-header');
    header.append(element('h1','','Боевые карточки V11'));
    header.append(element('p','bc-warning','ИЗОЛИРОВАННЫЙ ПРОТОТИП · ТОЛЬКО ТЕСТОВЫЕ ДАННЫЕ · НЕТ СЕРВЕРА'));
    header.append(optionSelect([['A','Сторона А'],['B','Сторона Б'],['spectator','Зритель']],state.viewer,next=>{
      state.viewer=next;state.expandedId=initialExpandedId(state);persist();render();
    },'Режим просмотра'));
    root.append(header);
    const bar=element('nav','bc-navigation');bar.setAttribute('aria-label','Виды боёв');
    bar.append(button('Общая лента',()=>{state.view='feed';persist();render()},state.view==='feed'?'active':''));
    bar.append(button('Споры',()=>{state.view='disputes';persist();render()},state.view==='disputes'?'active':''));
    if (state.viewer!=='spectator') bar.append(element('span','bc-turn',`Ваш ход: ${pendingMyTurn(state)}`));
    root.append(bar);
    const feed=element('main','bc-feed');feed.id='battle-list';
    for(const proj of state.view==='feed'?projectFeed(state):disputes(state)) {
      if (state.view==='disputes') {
        const wrap=element('div','bc-dispute-row');
        if (proj.mine) wrap.append(button(`К бою: ${proj.title}`,()=>{state.view='feed';state.expandedId=proj.battleId;persist();render();document.querySelector(`[data-battle-id="${proj.battleId}"] .bc-expand`)?.focus()},'bc-jump'));
        else wrap.append(element('span','bc-public-only','Публичный статус без перехода'));
        feed.append(wrap);
      }
      feed.append(makeCard(proj,state,persist,render));
    }
    root.append(feed);
    const foot=element('footer','bc-footer');foot.append(button('Сбросить тестовый сценарий',()=>{
      state=createState();try{storage.removeItem(STORAGE_KEY)}catch{}render();
    }));root.append(foot);
  };
  render();
  return { getState:()=>clone(state), setViewer:(viewer)=>{if(['A','B','spectator'].includes(viewer)){state.viewer=viewer;persist();render()}}, reset:()=>{state=createState();persist();render()} };
}