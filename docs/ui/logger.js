window.Game = window.Game || {};
(function(){
  const Game = window.Game;
  const UI = Game.UI || {};
  const MAX_BATCH = 50;
  const FLUSH_INTERVAL = 2000;
  const BACKOFF_BASE = 1000;
  const BACKOFF_MAX = 20000;
  const STATUS = { CONNECTED: "connected", DISCONNECTED: "disconnected", UNKNOWN: "unknown" };
  const LOG_SINK_QUERY_FLAGS = ["enableLogSink", "logSink", "enableLogSinkDev"];
  const LOG_SINK_DISABLE_MARKER = "DEV_LOG_SINK_DISABLED";

  const hasLogSinkFlag = () => {
    try {
      if (Game && Game.__D && Game.__D.ENABLE_LOGGER === true) return true;
      if (typeof window !== "undefined" && window.__ENABLE_LOG_SINK__ === true) return true;
      if (typeof location !== "undefined") {
        const params = new URLSearchParams(location.search || "");
        for (const key of LOG_SINK_QUERY_FLAGS) {
          if (params.get(key) === "1" || params.get(key) === "true") return true;
        }
      }
    } catch (_) {}
    return false;
  };

  const shouldEnableLogger = () => hasLogSinkFlag();

  const logger = {
    enabled: shouldEnableLogger(),
    queue: [],
    timer: null,
    sending: false,
    backoff: BACKOFF_BASE,
    status: STATUS.UNKNOWN,
    listeners: new Set(),
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lastTs: null,
    endpoint: "http://localhost:17321/log",
    sinkDisabled: false,
    disableLogged: false,

    init(){
      if (!this.enabled) return;
      this.setStatus(STATUS.DISCONNECTED);
      this.runInitialProbe();
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
      if (!this.enabled || this.sinkDisabled) return;
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
        this.disableSink("connect_fail");
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

    runInitialProbe(){
      if (!this.enabled || this.sinkDisabled) return;
      this.ping().then(ok => {
        if (!ok) this.disableSink("connect_fail");
      }).catch(() => {
        this.disableSink("connect_fail");
      });
    },

    disableSink(reason){
      if (this.sinkDisabled) return;
      this.sinkDisabled = true;
      this.enabled = false;
      this.clearTimer();
      this.setStatus(STATUS.DISCONNECTED);
      this.queue = [];
      if (!this.disableLogged) {
        this.disableLogged = true;
        try {
          console.warn(`${LOG_SINK_DISABLE_MARKER} reason=${reason} url=${this.endpoint}`);
        } catch (_) {}
      }
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
