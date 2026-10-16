// Pure asynchronous lifecycle for tactical_v1. This file is intentionally not
// imported by the active runtime and does not read clocks, storage, DOM, or RNG.
(function (root) {
  "use strict";

  const VERSION = 1;
  const RULES_VERSION = "tactical_v1";
  const COLORS = new Set(["y", "o", "r", "k"]);
  const ATTACKS = new Set(["N", "P", "T"]);
  const DEFENSES = new Set(["S", "C", "G"]);
  const PHASES = new Set(["created", "waiting", "committed", "final", "expired"]);
  const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const isRecord = value => !!value && typeof value === "object" && !Array.isArray(value);

  function copyJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function canonical(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    return "{" + Object.keys(value).sort().map(key =>
      JSON.stringify(key) + ":" + canonical(value[key])
    ).join(",") + "}";
  }

  function error(code, detail) {
    return { ok: false, error: code, detail };
  }

  function participantSide(state, participantId) {
    if (participantId === state.participants.A.id) return "A";
    if (participantId === state.participants.B.id) return "B";
    return null;
  }

  function validateSelection(selection, expectedRole) {
    if (!isRecord(selection)) return "selection must be an object";
    const keys = ["attackColor", "defenseColor", "attackType", "defenseType", "role"];
    for (const key of keys) {
      if (!hasOwn(selection, key)) return "selection." + key + " is required";
      if (typeof selection[key] !== "string") return "selection." + key + " must be a string";
    }
    if (!COLORS.has(selection.attackColor) || !COLORS.has(selection.defenseColor)) {
      return "selection colors are unsupported";
    }
    if (!ATTACKS.has(selection.attackType) || !DEFENSES.has(selection.defenseType)) {
      return "selection tactics are unsupported";
    }
    if (!selection.role.trim() || selection.role.trim() !== selection.role) {
      return "selection.role must be a non-empty role identifier";
    }
    if (selection.role !== expectedRole) return "selection.role does not match participant";
    if (selection.role !== "mafia" && (selection.attackColor === "k" || selection.defenseColor === "k")) {
      return "black color requires mafia role";
    }
    return null;
  }

  function eventId(state, version, type) {
    return state.battleId + ":v" + version + ":" + type;
  }

  function appendEvent(state, version, type, payload) {
    const event = {
      eventId: eventId(state, version, type),
      battleId: state.battleId,
      version,
      type,
      payload: copyJson(payload)
    };
    state.events.push(event);
    return event.eventId;
  }

  function cloneState(state) {
    return copyJson(state);
  }

  function publicView(state, participantId) {
    const side = participantSide(state, participantId);
    if (!side) return error("UNKNOWN_PARTICIPANT", "participantId is not part of this battle");
    const other = side === "A" ? "B" : "A";
    const revealed = state.phase === "final";
    const result = {
      schemaVersion: state.schemaVersion,
      battleId: state.battleId,
      version: state.version,
      rulesVersion: state.rulesVersion,
      phase: state.phase,
      deadlineAt: state.deadlineAt,
      participants: {
        self: state.participants[side].id,
        opponent: state.participants[other].id
      },
      selfCommitted: hasOwn(state.commits, side),
      opponentCommitted: hasOwn(state.commits, other),
      revealed
    };
    if (revealed) {
      result.selections = {
        A: copyJson(state.commits.A.selection),
        B: copyJson(state.commits.B.selection)
      };
      result.mechanicalOutcome = state.mechanicalOutcome;
      result.resolution = copyJson(state.resolution);
    }
    if (state.phase === "expired") {
      result.expiredAt = state.expiredAt;
      result.expiredStage = state.expiredStage;
      result.missingParticipants = state.missingParticipants.slice();
    }
    return result;
  }

  function validateState(state) {
    if (!isRecord(state) || state.schemaVersion !== VERSION) return "unsupported state schema";
    if (typeof state.battleId !== "string" || !state.battleId.trim()) return "battleId is invalid";
    if (state.rulesVersion !== RULES_VERSION) return "unsupported rulesVersion";
    if (!Number.isSafeInteger(state.version) || state.version < 0) return "version is invalid";
    if (!PHASES.has(state.phase)) return "phase is invalid";
    if (!Number.isSafeInteger(state.deadlineAt)) return "deadlineAt is invalid";
    if (!isRecord(state.participants) || !isRecord(state.participants.A) || !isRecord(state.participants.B) ||
        typeof state.participants.A.id !== "string" || typeof state.participants.B.id !== "string" ||
        state.participants.A.id === state.participants.B.id ||
        typeof state.participants.A.role !== "string" || typeof state.participants.B.role !== "string") {
      return "participants are invalid";
    }
    if (!isRecord(state.commits) || !Array.isArray(state.events) || !isRecord(state.commandReceipts)) {
      return "state collections are invalid";
    }
    for (const side of ["A", "B"]) {
      if (hasOwn(state.commits, side)) {
        const commit = state.commits[side];
        if (!isRecord(commit) || !Number.isSafeInteger(commit.version) ||
            validateSelection(commit.selection, state.participants[side].role)) return "commit is invalid";
      }
    }
    const count = Number(hasOwn(state.commits, "A")) + Number(hasOwn(state.commits, "B"));
    if ((state.phase === "created" && count !== 0) ||
        (state.phase === "waiting" && count !== 1) ||
        (["committed", "final"].includes(state.phase) && count !== 2)) return "phase does not match commits";
    const seenEvents = new Set();
    for (const event of state.events) {
      if (!isRecord(event) || typeof event.eventId !== "string" || seenEvents.has(event.eventId)) {
        return "events are invalid or duplicated";
      }
      seenEvents.add(event.eventId);
    }
    if (state.phase === "final" && (!state.resolution || !["A_WIN", "B_WIN", "DRAW"].includes(state.mechanicalOutcome))) {
      return "final resolution is invalid";
    }
    if (state.phase !== "final" && (state.mechanicalOutcome !== null || state.resolution !== null)) {
      return "unrevealed state contains a resolution";
    }
    for (const [id, receipt] of Object.entries(state.commandReceipts)) {
      if (!id || !isRecord(receipt) || typeof receipt.fingerprint !== "string" || typeof receipt.code !== "string") {
        return "command receipt is invalid";
      }
    }
    return null;
  }

  function createLifecycle(resolver) {
    if (!resolver || typeof resolver.resolve !== "function") {
      throw new TypeError("a tactical_v1 resolver with resolve() is required");
    }

    function createBattle(options) {
      if (!isRecord(options) || typeof options.battleId !== "string" || !options.battleId.trim() ||
          !Number.isSafeInteger(options.deadlineAt)) {
        return error("INVALID_CREATE", "battleId and integer deadlineAt are required");
      }
      const participants = options.participants;
      if (!isRecord(participants) || !isRecord(participants.A) || !isRecord(participants.B) ||
          typeof participants.A.id !== "string" || !participants.A.id.trim() ||
          typeof participants.B.id !== "string" || !participants.B.id.trim() ||
          participants.A.id === participants.B.id ||
          typeof participants.A.role !== "string" || !participants.A.role.trim() ||
          typeof participants.B.role !== "string" || !participants.B.role.trim()) {
        return error("INVALID_CREATE", "two distinct participant ids and roles are required");
      }
      const state = {
        schemaVersion: VERSION,
        battleId: options.battleId,
        version: 0,
        rulesVersion: RULES_VERSION,
        phase: "created",
        createdAt: Number.isSafeInteger(options.createdAt) ? options.createdAt : null,
        deadlineAt: options.deadlineAt,
        participants: copyJson(participants),
        commits: {},
        mechanicalOutcome: null,
        resolution: null,
        expiredAt: null,
        expiredStage: null,
        missingParticipants: [],
        events: [],
        commandReceipts: {}
      };
      appendEvent(state, 0, "battle.created", {
        participants: { A: participants.A.id, B: participants.B.id },
        rulesVersion: RULES_VERSION,
        deadlineAt: options.deadlineAt
      });
      return { ok: true, state };
    }

    function expire(state, at) {
      const stage = state.phase;
      const missing = ["A", "B"].filter(side => !hasOwn(state.commits, side));
      state.version += 1;
      state.phase = "expired";
      state.expiredAt = at;
      state.expiredStage = stage;
      state.missingParticipants = missing.map(side => state.participants[side].id);
      const id = appendEvent(state, state.version, "battle.timed_out", {
        stage,
        deadlineAt: state.deadlineAt,
        expiredAt: at,
        missingParticipants: state.missingParticipants
      });
      return { eventIds: [id], code: "TIMED_OUT" };
    }

    function execute(currentState, command) {
      const stateError = validateState(currentState);
      if (stateError) return error("INVALID_STATE", stateError);
      if (!isRecord(command) || typeof command.commandId !== "string" || !command.commandId.trim() ||
          !Number.isSafeInteger(command.expectedVersion) || !Number.isSafeInteger(command.at)) {
        return error("INVALID_COMMAND", "commandId, expectedVersion, and integer at are required");
      }
      let fingerprint;
      try { fingerprint = canonical(command); } catch (_) {
        return error("INVALID_COMMAND", "command is not canonical JSON data");
      }
      const prior = currentState.commandReceipts[command.commandId];
      if (prior) {
        if (prior.fingerprint !== fingerprint) {
          return error("COMMAND_ID_REUSE", "commandId was already used with different content");
        }
        return {
          ok: true,
          code: prior.code,
          replayed: true,
          eventIds: prior.eventIds.slice(),
          state: cloneState(currentState)
        };
      }
      if (command.expectedVersion !== currentState.version) {
        return error("VERSION_CONFLICT", "expectedVersion does not match current state version");
      }
      if (command.at >= currentState.deadlineAt && !["final", "expired"].includes(currentState.phase)) {
        const timed = cloneState(currentState);
        const expired = expire(timed, command.at);
        timed.commandReceipts[command.commandId] = {
          fingerprint, code: expired.code, eventIds: expired.eventIds.slice()
        };
        return { ok: true, code: expired.code, replayed: false, eventIds: expired.eventIds, state: timed };
      }
      if (currentState.phase === "expired") return error("BATTLE_EXPIRED", "battle lifecycle has expired");
      if (currentState.phase === "final") return error("BATTLE_FINAL", "battle is already final");
      if (command.type === "commit") {
        const side = participantSide(currentState, command.participantId);
        if (!side) return error("UNKNOWN_PARTICIPANT", "participantId is not part of this battle");
        if (hasOwn(currentState.commits, side)) {
          if (canonical(currentState.commits[side].selection) !== canonical(command.selection)) {
            return error("COMMIT_IMMUTABLE", "confirmed selection cannot be changed");
          }
          const duplicate = cloneState(currentState);
          duplicate.version += 1;
          duplicate.commandReceipts[command.commandId] = { fingerprint, code: "ALREADY_COMMITTED", eventIds: [] };
          return { ok: true, code: "ALREADY_COMMITTED", replayed: false, eventIds: [], state: duplicate };
        }
        const roleError = validateSelection(command.selection, currentState.participants[side].role);
        if (roleError) return error("INVALID_SELECTION", roleError);
        const next = cloneState(currentState);
        next.version += 1;
        next.commits[side] = { selection: copyJson(command.selection), version: next.version };
        next.phase = Object.keys(next.commits).length === 2 ? "committed" : "waiting";
        const id = appendEvent(next, next.version, "battle.selection_committed", {
          side,
          participantId: next.participants[side].id
        });
        next.commandReceipts[command.commandId] = { fingerprint, code: "COMMITTED", eventIds: [id] };
        return { ok: true, code: "COMMITTED", replayed: false, eventIds: [id], state: next };
      }
      if (command.type === "reveal") {
        if (currentState.phase !== "committed") {
          return error("REVEAL_NOT_READY", "both participants must commit before reveal");
        }
        const a = currentState.commits.A.selection;
        const b = currentState.commits.B.selection;
        const resolution = resolver.resolve(a, b, RULES_VERSION);
        if (!resolution || resolution.ok !== true || resolution.rulesVersion !== RULES_VERSION) {
          return error("RESOLUTION_FAILED", "tactical_v1 resolver rejected committed selections");
        }
        const next = cloneState(currentState);
        next.version += 1;
        next.phase = "final";
        next.resolution = copyJson(resolution);
        next.mechanicalOutcome = resolution.mechanicalOutcome;
        const revealId = appendEvent(next, next.version, "battle.revealed", {
          selections: { A: a, B: b }
        });
        const finalId = appendEvent(next, next.version, "battle.finalized", {
          mechanicalOutcome: next.mechanicalOutcome,
          resolution: next.resolution
        });
        next.commandReceipts[command.commandId] = {
          fingerprint, code: "FINALIZED", eventIds: [revealId, finalId]
        };
        return { ok: true, code: "FINALIZED", replayed: false, eventIds: [revealId, finalId], state: next };
      }
      if (command.type === "expire") {
        if (command.at < currentState.deadlineAt) return error("DEADLINE_NOT_REACHED", "deadline has not been reached");
        const next = cloneState(currentState);
        const expired = expire(next, command.at);
        next.commandReceipts[command.commandId] = {
          fingerprint, code: expired.code, eventIds: expired.eventIds.slice()
        };
        return { ok: true, code: expired.code, replayed: false, eventIds: expired.eventIds, state: next };
      }
      return error("UNKNOWN_COMMAND", "supported commands are commit, reveal, and expire");
    }

    function serialize(state) {
      const stateError = validateState(state);
      if (stateError) return error("INVALID_STATE", stateError);
      return JSON.stringify(state);
    }

    function restore(serialized) {
      if (typeof serialized !== "string") return error("INVALID_SERIALIZATION", "serialized state must be a string");
      let state;
      try { state = JSON.parse(serialized); } catch (_) {
        return error("INVALID_SERIALIZATION", "serialized state is not valid JSON");
      }
      const stateError = validateState(state);
      if (stateError) return error("INVALID_STATE", stateError);
      return { ok: true, state };
    }

    function getPublicView(state, participantId) {
      const stateError = validateState(state);
      if (stateError) return error("INVALID_STATE", stateError);
      return publicView(state, participantId);
    }

    function getInternalSnapshot(state) {
      const stateError = validateState(state);
      if (stateError) return error("INVALID_STATE", stateError);
      return { ok: true, state: cloneState(state) };
    }

    return Object.freeze({ createBattle, execute, serialize, restore, getPublicView, getInternalSnapshot });
  }

  // Contract only: this interface is descriptive and deliberately has no
  // storage implementation. State and its event outbox must commit atomically.
  const persistenceAdapterContract = Object.freeze({
    load: "load({ battleId }) -> { state: serialized internal state, version } | null",
    compareAndSwap: "compareAndSwap({ battleId, expectedVersion, serializedState, events }) -> { ok, version }",
    requirements: Object.freeze([
      "compareAndSwap must atomically reject stale expectedVersion values",
      "state and all supplied events must be committed in the same transaction",
      "eventId must have a durable unique constraint for outbox deduplication",
      "a retry after an uncertain response must return the already committed event ids",
      "participant reads must use getPublicView, never the internal serialized state",
      "do not use localStorage or create a second store"
    ])
  });
  const api = Object.freeze({
    createLifecycle, schemaVersion: VERSION, rulesVersion: RULES_VERSION, persistenceAdapterContract
  });
  if (typeof module === "object" && module && module.exports) module.exports = api;
  if (root) root.TacticalCombatLifecycleV1 = api;
})(typeof globalThis === "object" ? globalThis : this);
