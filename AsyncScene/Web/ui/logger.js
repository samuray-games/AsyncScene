window.Game = window.Game || {};
(function(){
  const Game = window.Game;
  const UI = Game.UI || {};
  const MAX_BATCH = 50;
  const FLUSH_INTERVAL = 2000;
  const BACKOFF_BASE = 1000;
  const BACKOFF_MAX = 20000;
  const STATUS = { CONNECTED: "connected", DISCONNECTED: "disconnected", UNKNOWN: "unknown" };
  const isDevHost = () => {
    try {
      if (typeof location !== "undefined") {
        const host = (location.hostname || "").toLowerCase();
        if (host === "localhost" || host === "127.0.0.1") return true;
      }
      if (Game && Game.Debug && Game.Debug.ENABLE_LOGGER === true) return true;
    } catch (_) {}
    return false;
  };

  const logger = {
    enabled: isDevHost(),
    queue: [],
    timer: null,
    sending: false,
    backoff: BACKOFF_BASE,
    status: STATUS.UNKNOWN,
    listeners: new Set(),
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lastTs: null,
    endpoint: "http://localhost:17321/log",

    init(){
      if (!this.enabled) return;
      this.setStatus(STATUS.DISCONNECTED);
      this.ensureTimer();
    },

    ensureTimer(){
      if (this.timer) return;
      this.timer = setInterval(() => this.flush(false), FLUSH_INTERVAL);
    },

    clearTimer(){
      if (!this.timer) return;
      clearInterval(this.timer);
      this.timer = null;
    },

    log(entry){
      if (!this.enabled || !entry) return;
      const payload = Object.assign({ ts: Date.now(), sessionId: this.sessionId }, entry);
      this.queue.push(payload);
      if (this.queue.length >= MAX_BATCH) {
        this.flush(true);
      }
    },

    flush(force=false){
      if (!this.enabled) return;
      if (this.sending && !force) return;
      if (!this.queue.length) return;
      this.sending = true;
      const batch = this.queue.splice(0, MAX_BATCH);
      const payload = {
        sessionId: this.sessionId,
        ts: Date.now(),
        entries: batch
      };
      fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        this.backoff = BACKOFF_BASE;
        this.setStatus(STATUS.CONNECTED);
      }).catch(() => {
        this.queue = batch.concat(this.queue);
        this.setStatus(STATUS.DISCONNECTED);
        setTimeout(() => this.flush(false), Math.min(this.backoff, BACKOFF_MAX));
        this.backoff = Math.min(BACKOFF_MAX, this.backoff * 2);
      }).finally(() => {
        this.sending = false;
      });
    },

    forceFlush(){
      this.flush(true);
    },

    ping(){
      if (!this.enabled) return Promise.resolve(false);
      return fetch(this.endpoint.replace(/\/log$/, "/ping")).then(res => {
        if (res.ok) {
          this.setStatus(STATUS.CONNECTED);
          return true;
        }
        throw new Error("ping failed");
      }).catch(() => {
        this.setStatus(STATUS.DISCONNECTED);
        return false;
      });
    },

    setStatus(next){
      next = next || STATUS.UNKNOWN;
      if (this.status === next) return;
      this.status = next;
      this.listeners.forEach(fn => {
        try { fn(next); } catch (_) {}
      });
    },

    onStatusChange(fn){
      if (typeof fn === "function") {
        this.listeners.add(fn);
        fn(this.status);
      }
    },

    getStatus(){ return this.status; }
  };

  Game.Logger = logger;
  UI.Logger = logger;
  logger.init();

  const attachHooks = () => {
    if (!Game || !Game.UI) return;
    const ui = Game.UI;
    const origPushChat = ui.pushChat;
    if (typeof origPushChat === "function") {
      ui.pushChat = function(msg){
        logger.log({ type:"chat", name: msg?.name, text: msg?.text, system: !!msg?.system, battleId: msg?.battleId });
        return origPushChat.apply(this, arguments);
      };
    }

    const origEmitDelta = ui.emitStatDelta;
    if (typeof origEmitDelta === "function") {
      ui.emitStatDelta = function(kind, delta, opts){
        logger.log({ type:"stat", kind, delta, meta: opts });
        return origEmitDelta.apply(this, arguments);
      };
    }

    const origDmPushLine = ui.dmPushLine;
    if (typeof origDmPushLine === "function") {
      ui.dmPushLine = function(id, from, text){
        logger.log({ type:"dm", targetId: id, from, text });
        return origDmPushLine.apply(this, arguments);
      };
    }
  };

  if (Game.UI) {
    attachHooks();
  } else {
    setTimeout(() => {
      if (Game.UI) attachHooks();
    }, 0);
  }
})();
