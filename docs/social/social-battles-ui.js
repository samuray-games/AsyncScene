// Social battles UI (K1 contract). Temporary home: its own panel next to «баттл»;
// the final unified feed (Chat04.1/04.7) will reuse these cards.
// Renders only server projections. Never computes outcomes, never stores opponent data.
// All player/server text is written with textContent.
(function (root) {
  "use strict";

  const doc = root.document;
  const POLL_MS = 3000;
  const LIST_POLL_MS = 10000;
  const MAX_TEXT = 280;
  const DRAFT_PREFIX = "asynchronia.socialBattles.draft.";

  const ATTACK_TYPES = [["N", "Наезд"], ["P", "Предъява"], ["T", "Подкол"]];
  const DEFENSE_TYPES = [["S", "Спокойная защита"], ["C", "Контратака"], ["G", "Агрессия"]];
  const TYPE_LABEL = Object.fromEntries([...ATTACK_TYPES, ...DEFENSE_TYPES]);
  const COLOR_LABEL = { y: "Жёлтый", o: "Оранжевый", r: "Красный", k: "Чёрный" };
  const ERROR_TEXT = {
    NETWORK_ERROR: "Нет связи с сервером. Попробуй ещё раз.",
    COLOR_NOT_ALLOWED: "Этот цвет тебе пока недоступен.",
    COMMIT_IMMUTABLE: "Ход уже подтверждён.",
    BATTLE_EXPIRED: "Время на ход вышло.",
    NOT_FOUND: "Бой не найден.",
    INVALID_INPUT: "Ход не принят: проверь выбор.",
    IDEMPOTENCY_CONFLICT: "Этот запрос уже был отправлен с другими данными. Попробуй ещё раз.",
    RESERVATION_CONFLICT: "У тебя или у соперника уже идёт бой. Дождись его окончания.",
    UNAUTHORIZED: "Сессия недействительна. Войди заново."
  };

  const el = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const button = (label, onClick, className) => {
    const b = el("button", className || "", label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  };
  const uuid = () => (root.crypto && root.crypto.randomUUID) ? root.crypto.randomUUID()
    : Array.from(root.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

  // ---------- drafts: own side only, this tab only, removed after commit ----------
  // A draft belongs to one (API origin, actor, side, battle). Drafts of any other account or API
  // are purged as soon as the current actor is known, so switching accounts in one tab never
  // shows or sends another account's draft.
  const draftScopePrefix = (scope) => DRAFT_PREFIX + encodeURIComponent(scope.apiOrigin) + "|" + encodeURIComponent(scope.actorId) + "|";
  const draftKey = (scope, side, battleId) => draftScopePrefix(scope) + side + "|" + battleId;
  function loadDraft(scope, side, battleId) {
    try {
      const draft = JSON.parse(root.sessionStorage.getItem(draftKey(scope, side, battleId)) || "null");
      if (!draft || draft.apiOrigin !== scope.apiOrigin || draft.actorId !== scope.actorId ||
          draft.side !== side || draft.battleId !== battleId) return null;
      return draft;
    } catch (_) { return null; }
  }
  function saveDraft(scope, side, battleId, draft) {
    Object.assign(draft, { apiOrigin: scope.apiOrigin, actorId: scope.actorId, side, battleId });
    try { root.sessionStorage.setItem(draftKey(scope, side, battleId), JSON.stringify(draft)); } catch (_) {}
  }
  function dropDraft(scope, side, battleId) {
    try { root.sessionStorage.removeItem(draftKey(scope, side, battleId)); } catch (_) {}
  }
  function purgeForeignDrafts(scope) {
    try {
      const keep = scope ? draftScopePrefix(scope) : null;
      for (let i = root.sessionStorage.length - 1; i >= 0; i--) {
        const key = root.sessionStorage.key(i);
        if (key && key.startsWith(DRAFT_PREFIX) && (!keep || !key.startsWith(keep))) root.sessionStorage.removeItem(key);
      }
    } catch (_) {}
  }

  function offersFor(view, channel, type) {
    const all = (view.readyTextOffers && Array.isArray(view.readyTextOffers.offers)) ? view.readyTextOffers.offers : [];
    const forChannel = all.filter((o) => o.channel === channel);
    const typed = forChannel.filter((o) => o.tacticType === type);
    // Older catalogs have no tactic type: cycle every phrase of the channel.
    return typed.length ? typed : forChannel.filter((o) => !o.tacticType);
  }

  function freshSlot(view, channel, type, color) {
    const offer = offersFor(view, channel, type)[0] || null;
    return { type, color, offerId: offer ? offer.offerId : null, text: offer ? offer.text : "" };
  }

  function initialDraft(view, me) {
    const color = (me.allowedColors && me.allowedColors[0]) || "y";
    return { attack: freshSlot(view, "attack", "P", color), defense: freshSlot(view, "defense", "S", color) };
  }

  function validDraft(draft, view, me) {
    if (!draft || !draft.attack || !draft.defense) return false;
    for (const [channel, types] of [["attack", ATTACK_TYPES], ["defense", DEFENSE_TYPES]]) {
      const slot = draft[channel];
      if (!types.some(([id]) => id === slot.type)) return false;
      if (!(me.allowedColors || []).includes(slot.color)) return false;
      if (!offersFor(view, channel, slot.type).some((o) => o.offerId === slot.offerId)) return false;
      if (typeof slot.text !== "string" || !slot.text.trim() || slot.text.length > MAX_TEXT) return false;
    }
    return true;
  }

  // ---------- inline WYSIWYG editor on the plate itself (Tactical V1 §17 V9) ----------
  function makeEditablePlate(plate, getText, onSave, onEditingChange) {
    let editing = false;
    let original = "";
    let cancelBtn = null;
    const finish = (save) => {
      if (!editing) return;
      editing = false;
      doc.removeEventListener("pointerdown", outside, true);
      const value = plate.textContent.replace(/\s+/g, " ").trim();
      plate.removeAttribute("contenteditable");
      plate.classList.remove("is-editing");
      if (cancelBtn) { cancelBtn.remove(); cancelBtn = null; }
      if (save && value && value.length <= MAX_TEXT && value !== original) onSave(value);
      else plate.textContent = original; // empty, too long or cancelled → previous text
      onEditingChange(false);
    };
    const outside = (event) => {
      if (event.target === plate || plate.contains(event.target) || event.target === cancelBtn) return;
      finish(true);
    };
    plate.addEventListener("click", () => {
      if (editing) return;
      editing = true;
      original = getText();
      onEditingChange(true);
      plate.setAttribute("contenteditable", "plaintext-only");
      if (plate.contentEditable !== "plaintext-only") plate.setAttribute("contenteditable", "true");
      plate.classList.add("is-editing");
      cancelBtn = button("✕", (e) => { e.stopPropagation(); finish(false); }, "sb-cancel-edit");
      cancelBtn.setAttribute("aria-label", "Отменить правку");
      plate.after(cancelBtn);
      doc.addEventListener("pointerdown", outside, true);
      plate.focus();
      const range = doc.createRange();
      range.selectNodeContents(plate);
      range.collapse(false);
      const sel = root.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
    plate.addEventListener("keydown", (event) => {
      if (!editing) return;
      if (event.key === "Enter" && !event.isComposing) { event.preventDefault(); finish(true); }
      else if (event.key === "Escape") { event.preventDefault(); finish(false); }
    });
    plate.addEventListener("paste", (event) => {
      if (!editing) return;
      event.preventDefault();
      const text = (event.clipboardData && event.clipboardData.getData("text/plain")) || "";
      doc.execCommand("insertText", false, text.replace(/\s+/g, " "));
    });
    plate.setAttribute("role", "textbox");
    plate.setAttribute("aria-label", "Реплика, нажми чтобы изменить");
    plate.tabIndex = 0;
  }

  // ---------- controller ----------
  const DISPOSED = Object.freeze({ code: "DISPOSED" });

  function createController({ api: rawApi, mount, apiOrigin }) {
    // After dispose() nothing of this controller may touch the DOM, drafts or the network result:
    // late responses of the previous session are dropped here.
    let disposed = false;
    const api = Object.fromEntries(Object.keys(rawApi).map((name) => [name, (...args) => rawApi[name](...args).then(
      (value) => { if (disposed) throw DISPOSED; return value; },
      (error) => { throw disposed ? DISPOSED : error; })]));
    const state = {
      me: null, players: [], battles: [], awaiting: 0,
      views: new Map(), expanded: null, error: null, editing: 0, busy: new Set(), pendingCreate: null
    };
    let pollTimer = null;
    let listTimer = null;
    const scope = () => ({ apiOrigin, actorId: state.me.actorId });
    const load = (view) => loadDraft(scope(), view.selfSide, view.battleId);
    const save = (view, draft) => { if (!disposed) saveDraft(scope(), view.selfSide, view.battleId, draft); };
    // Any change to the draft starts a new command: the previous commandId may only be retried
    // with exactly the payload it was first sent with (K1 §4.2).
    const touch = (view, draft) => { delete draft.commandId; save(view, draft); };

    const setError = (error) => {
      if (error === DISPOSED) return;
      state.error = error ? (ERROR_TEXT[error.code] || "Ошибка: " + (error.code || "UNKNOWN")) : null;
    };

    async function refreshList() {
      const data = await api.listBattles();
      state.battles = Array.isArray(data.battles) ? data.battles : [];
      state.awaiting = Number(data.awaitingMyAction) || 0;
      if (!state.expanded) {
        const pending = state.battles.find((b) => b.awaitingMyAction) || state.battles[0];
        state.expanded = pending ? pending.battleId : null;
      }
    }

    async function refreshBattle(battleId) {
      const view = await api.getBattle(battleId);
      state.views.set(battleId, view);
      return view;
    }

    async function refreshAll() {
      try {
        await refreshList();
        if (state.expanded) await refreshBattle(state.expanded);
        setError(null);
      } catch (error) {
        setError(error);
      }
      render();
    }

    async function start() {
      try {
        state.me = await api.me();
        purgeForeignDrafts(scope());
        const players = await api.players();
        state.players = Array.isArray(players.players) ? players.players : [];
      } catch (error) {
        setError(error);
        render();
        return;
      }
      await refreshAll();
      if (disposed) return;
      pollTimer = root.setInterval(pollExpanded, POLL_MS);
      listTimer = root.setInterval(() => { if (!state.editing && !doc.hidden) refreshAll(); }, LIST_POLL_MS);
    }

    async function pollExpanded() {
      if (state.editing || doc.hidden || !state.expanded) return;
      const view = state.views.get(state.expanded);
      if (view && (view.phase === "final" || view.phase === "expired")) return;
      try {
        const before = view ? view.version : null;
        const next = await refreshBattle(state.expanded);
        if (next.version !== before) { await refreshList(); render(); }
      } catch (_) { /* next tick retries */ }
    }

    async function challenge(opponentActorId) {
      if (!opponentActorId) return;
      if (!state.pendingCreate || state.pendingCreate.opponentActorId !== opponentActorId) {
        state.pendingCreate = { opponentActorId, clientOperationId: uuid() };
      }
      try {
        const res = await api.createBattle(opponentActorId, state.pendingCreate.clientOperationId);
        state.pendingCreate = null;
        state.expanded = res.battleId;
        await refreshAll();
      } catch (error) {
        if (error && error.code === "IDEMPOTENCY_CONFLICT") state.pendingCreate = null;
        setError(error);
        render();
      }
    }

    async function commit(battleId) {
      const view = state.views.get(battleId);
      const draft = view ? load(view) : null;
      if (!view || !validDraft(draft, view, state.me) || state.busy.has(battleId)) return;
      state.busy.add(battleId);
      render();
      const commandId = draft.commandId || uuid();
      draft.commandId = commandId;
      save(view, draft);
      const textIntent = {};
      for (const channel of ["attack", "defense"]) {
        const slot = draft[channel];
        const offer = offersFor(view, channel, slot.type).find((o) => o.offerId === slot.offerId);
        textIntent[channel] = { offerId: slot.offerId };
        if (!offer || offer.text !== slot.text) textIntent[channel].finalText = slot.text;
      }
      const selection = {
        attackColor: draft.attack.color, defenseColor: draft.defense.color,
        attackType: draft.attack.type, defenseType: draft.defense.type, role: state.me.role
      };
      try {
        await api.commit(battleId, commandId, selection, textIntent);
        dropDraft(scope(), view.selfSide, battleId);
        setError(null);
      } catch (error) {
        setError(error);
      }
      state.busy.delete(battleId);
      await refreshAll();
    }

    // ---------- rendering ----------
    function render() {
      if (disposed) return;
      if (state.editing) return; // never replace DOM under an open inline editor
      mount.body.replaceChildren();
      mount.count.textContent = String(state.awaiting);
      if (state.error) mount.body.append(el("p", "sb-error", state.error));
      if (!state.me) return;
      mount.body.append(renderChallenge());
      if (!state.battles.length) mount.body.append(el("p", "sb-empty", "Боёв с людьми пока нет. Вызови кого-нибудь."));
      for (const summary of state.battles) mount.body.append(renderCard(summary));
    }

    function renderChallenge() {
      const row = el("div", "sb-challenge");
      const select = el("select", "sb-opponent");
      select.setAttribute("aria-label", "Соперник");
      select.append(new Option("Кого вызвать?", ""));
      for (const p of state.players) select.append(new Option(p.displayName, p.actorId));
      select.value = state.selectedOpponent || "";
      select.addEventListener("change", () => { state.selectedOpponent = select.value; });
      const go = button("Вызвать", () => challenge(select.value), "sb-challenge-btn");
      row.append(select, go);
      return row;
    }

    function outcomeForMe(outcome, selfSide) {
      if (outcome === "DRAW") return "Ничья";
      if (outcome === "A_WIN" || outcome === "B_WIN") return outcome[0] === selfSide ? "Победа" : "Поражение";
      return "Ожидается";
    }

    function renderCard(summary) {
      const id = summary.battleId;
      const view = state.views.get(id);
      const card = el("article", "sb-card");
      card.dataset.battleId = id;
      const expanded = state.expanded === id;
      const status = summary.awaitingMyAction ? "Твой ход" : (summary.statusText || phaseText(summary.phase));
      const head = button((expanded ? "▾ " : "▸ ") + "Бой: " + (summary.opponentName || "соперник") + " · " + status, async () => {
        state.expanded = expanded ? null : id;
        if (!expanded) { try { await refreshBattle(id); } catch (e) { setError(e); } }
        render();
      }, "sb-card-head");
      head.setAttribute("aria-expanded", String(expanded));
      card.append(head);
      if (!expanded || !view) return card;
      card.append(renderBattleBody(view));
      return card;
    }

    function phaseText(phase) {
      return { created: "Ждём ходы", waiting: "Ждём соперника", committed: "Раскрываем",
        revealed: "Раскрыт", final: "Завершён", expired: "Время вышло" }[phase] || "";
    }

    function renderBattleBody(view) {
      const body = el("section", "sb-body");
      const self = view.selfSide;
      const rival = self === "A" ? "B" : "A";
      const names = view.participantNames || {};
      if (view.phase === "expired") {
        body.append(el("p", "sb-status", "Время на ход вышло. Бой не состоялся."));
        return body;
      }
      const draftable = !view.revealed && !view.selfCommitted;
      let draft = null;
      if (draftable) {
        draft = load(view);
        if (!validDraft(draft, view, state.me)) { draft = initialDraft(view, state.me); save(view, draft); }
      }
      const grid = el("div", "sb-dialogue");
      const slots = [[self, "attack", "left"], [rival, "defense", "right"], [rival, "attack", "right"], [self, "defense", "left"]];
      for (const [side, channel, dir] of slots) {
        const who = side === self ? "Ты" : (names.opponent || "Соперник");
        grid.append(renderSlot(view, side === self, channel, dir, who, draft, side));
      }
      body.append(grid);
      if (view.revealed) body.append(renderResult(view, names));
      else if (view.selfCommitted) body.append(el("p", "sb-status", "Твой ход подтверждён. Ждём ход соперника."));
      else {
        const busy = state.busy.has(view.battleId);
        const ready = button(busy ? "Отправляем…" : "Готово", () => commit(view.battleId), "sb-commit");
        ready.disabled = busy;
        body.append(ready);
      }
      return body;
    }

    function renderSlot(view, isSelf, channel, dir, who, draft, side) {
      const slot = el("div", "sb-slot sb-" + dir);
      slot.append(el("div", "sb-slot-title", who + " · " + (channel === "attack" ? "Атака" : "Защита")));
      if (view.revealed) {
        const sel = view.selections && view.selections[side];
        const texts = view.committedTexts && view.committedTexts[side];
        const color = sel ? sel[channel + "Color"] : null;
        const type = sel ? sel[channel + "Type"] : null;
        slot.append(el("span", "sb-type", TYPE_LABEL[type] || ""));
        slot.append(el("div", "sb-plate sb-c-" + (color || "hidden"), texts && texts[channel] ? texts[channel].text : ""));
        return slot;
      }
      if (!isSelf) {
        slot.append(el("div", "sb-plate sb-c-hidden", "Скрыто до раскрытия"));
        return slot;
      }
      if (!draft) { // own side already committed: own choice stays visible to me only
        slot.append(el("div", "sb-plate sb-c-hidden", "Ход подтверждён"));
        return slot;
      }
      const d = draft[channel];
      const tools = el("div", "sb-tools");
      const typeSelect = el("select", "sb-type-select");
      typeSelect.setAttribute("aria-label", channel === "attack" ? "Тип атаки" : "Тип защиты");
      for (const [id, label] of (channel === "attack" ? ATTACK_TYPES : DEFENSE_TYPES)) typeSelect.append(new Option(label, id));
      typeSelect.value = d.type;
      typeSelect.addEventListener("change", () => {
        draft[channel] = freshSlot(view, channel, typeSelect.value, d.color);
        touch(view, draft); render();
      });
      const colorSelect = el("select", "sb-color-select");
      colorSelect.setAttribute("aria-label", "Цвет реплики");
      for (const c of state.me.allowedColors || []) colorSelect.append(new Option(COLOR_LABEL[c] || c, c));
      colorSelect.value = d.color;
      colorSelect.addEventListener("change", () => { d.color = colorSelect.value; touch(view, draft); render(); });
      const rotate = button("↻", () => {
        const options = offersFor(view, channel, d.type);
        if (!options.length) return;
        const at = options.findIndex((o) => o.offerId === d.offerId);
        const next = options[(at + 1) % options.length];
        d.offerId = next.offerId; d.text = next.text;
        touch(view, draft); render();
      }, "sb-rotate");
      rotate.setAttribute("aria-label", "Другая готовая фраза");
      tools.append(typeSelect, colorSelect, rotate);
      slot.append(tools);
      const plateRow = el("div", "sb-plate-row");
      const plate = el("div", "sb-plate sb-own sb-c-" + d.color, d.text);
      makeEditablePlate(plate, () => d.text, (value) => { d.text = value; touch(view, draft); },
        // No re-render when editing ends: the plate already shows the saved text, and replacing
        // the DOM here would swallow the click that closed the editor (e.g. on «Готово»).
        (on) => { if (!disposed) state.editing += on ? 1 : -1; });
      plateRow.append(plate);
      slot.append(plateRow);
      return slot;
    }

    function renderResult(view, names) {
      const box = el("section", "sb-result");
      box.append(el("h3", "sb-outcome", outcomeForMe(view.mechanicalOutcome, view.selfSide)));
      const r = view.resolution || {};
      const self = view.selfSide;
      const rival = self === "A" ? "B" : "A";
      const opp = names.opponent || "Соперник";
      const myHit = r["hit" + self];
      const theirHit = r["hit" + rival];
      const lines = [];
      lines.push(myHit ? "Твоя атака пробила защиту соперника." : "Твоя атака не пробила защиту соперника.");
      lines.push(theirHit ? "Атака соперника пробила твою защиту." : "Атака соперника не пробила твою защиту.");
      if (myHit && theirHit) {
        const mine = r["pressure" + self];
        const theirs = r["pressure" + rival];
        lines.push(mine === theirs ? "Давление равное." : (mine > theirs ? "Твоё давление оказалось сильнее." : "Давление соперника оказалось сильнее."));
      }
      box.append(el("p", "sb-explain", lines.join(" ")));
      const details = el("div", "sb-details");
      details.hidden = true;
      details.append(el("p", "", "Давление: ты " + r["pressure" + self] + ", " + opp + " " + r["pressure" + rival] + "."));
      details.append(el("p", "", "Защита: ты " + r["defense" + self] + ", " + opp + " " + r["defense" + rival] + "."));
      const why = button("Почему?", () => { details.hidden = !details.hidden; }, "sb-why");
      box.append(why, details);
      if (view.socialVoteTrigger && view.socialVoteTrigger !== "NONE") {
        box.append(el("p", "sb-social", view.socialOutcome === "PENDING"
          ? "Толпа решает. Признанный итог появится после голосования."
          : "Поддержка толпы: " + view.socialOutcome));
      }
      return box;
    }

    function dispose() {
      disposed = true;
      root.clearInterval(pollTimer);
      root.clearInterval(listTimer);
      state.editing = 0;
    }

    return { start, render, refresh: refreshAll, state, dispose, get disposed() { return disposed; } };
  }

  function ensureMount() {
    let block = doc.getElementById("socialBattlesBlock");
    if (block) return { block, body: block.querySelector(".sb-root"), count: block.querySelector("[data-social-count]") };
    const anchor = doc.getElementById("battlesBlock");
    if (!anchor || !anchor.parentNode) return null;
    block = el("div", "block panel sb-block");
    block.id = "socialBattlesBlock";
    const header = el("div", "blockHeader panelHeader");
    const title = el("div", "");
    title.append(el("span", "battleTitleText", "Бои с людьми"));
    const turn = el("span", "sb-turn");
    turn.append(doc.createTextNode(" · Твой ход: "));
    const count = el("span", "", "0");
    count.setAttribute("data-social-count", "");
    turn.append(count);
    title.append(turn);
    header.append(title);
    const body = el("div", "blockBody panelBody scroll sb-root");
    body.id = "socialBattlesRoot";
    block.append(header, body);
    anchor.parentNode.insertBefore(block, anchor.nextSibling);
    return { block, body, count };
  }

  // One live controller per page. A session change (login as someone else, logout, another tab)
  // disposes it, wipes the panel and boots again for the new session without a reload.
  let active = null;
  let bootSeq = 0;
  let listening = false;

  function teardown(mount) {
    if (active) { active.dispose(); active = null; }
    root.Game.SocialBattles.controller = null;
    if (mount) { mount.body.replaceChildren(); mount.count.textContent = "0"; }
  }

  async function boot() {
    const config = root.Game && root.Game.SocialConfig ? root.Game.SocialConfig.read() : { enabled: false };
    if (!config.enabled) return null; // flag off: no DOM, no network
    const mount = ensureMount();
    if (!mount) return null;
    if (!listening && root.Game.SocialSession && root.Game.SocialSession.SESSION_EVENT) {
      listening = true;
      root.addEventListener(root.Game.SocialSession.SESSION_EVENT, () => { boot(); });
    }
    const seq = ++bootSeq;
    teardown(mount);
    const session = await root.Game.SocialSession.getSession(config.apiOrigin).catch(() => null);
    if (seq !== bootSeq) return null; // a newer session change already took over
    if (!session) {
      purgeForeignDrafts(null);
      mount.body.replaceChildren(el("p", "sb-empty", "Бои с людьми доступны после входа по приглашению."));
      return null;
    }
    const api = root.Game.SocialApi.create({ apiOrigin: config.apiOrigin, sessionId: session.sessionId });
    const controller = createController({ api, mount, apiOrigin: config.apiOrigin });
    active = controller;
    root.Game.SocialBattles.controller = controller;
    await controller.start();
    return controller.disposed ? null : controller;
  }

  root.Game = root.Game || {};
  root.Game.SocialBattles = { boot, controller: null, purgeForeignDrafts };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", () => { boot(); });
  else boot();
})(window);
