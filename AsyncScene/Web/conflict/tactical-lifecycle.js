// Pure asynchronous lifecycle for tactical_v1. This file is intentionally not
// imported by the active runtime and does not read clocks, storage, DOM, or RNG.
(function (root) {
  "use strict";

  const VERSION = 1;
  const RULES_VERSION = "tactical_v1";
  const COLORS = new Set(["y", "o", "r", "k"]);
  const ATTACKS = new Set(["N", "P", "T"]);
  const DEFENSES = new Set(["S", "C", "G"]);
  const PHASES = new Set(["created", "waiting", "committed", "revealed", "final", "expired"]);
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
    if (Object.keys(selection).some(key => !keys.includes(key))) return "selection contains unsupported fields";
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
    if (type === "battle.finalized") return state.battleId + ":final";
    return state.battleId + ":v" + version + ":" + type;
  }

  function hasReceipt(receipts, commandId) {
    return hasOwn(receipts, commandId);
  }

  function writeReceipt(receipts, commandId, receipt) {
    Object.defineProperty(receipts, commandId, {
      value: receipt, enumerable: true, configurable: true, writable: true
    });
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
    const revealed = state.phase === "revealed" || state.phase === "final";
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
      result.socialOutcome = state.socialOutcome;
      result.recognizedOutcome = state.recognizedOutcome;
      result.socialVoteTrigger = state.socialVoteTrigger ??
        (state.mechanicalOutcome === "DRAW" ? "DRAW" : "NONE");
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
        (["committed", "revealed", "final"].includes(state.phase) && count !== 2)) {
      return "phase does not match commits";
    }
    const hasReveal = state.phase === "revealed" || state.phase === "final";
    const seenEvents = new Set();
    for (const event of state.events) {
      if (!isRecord(event) || typeof event.eventId !== "string" || seenEvents.has(event.eventId)) {
        return "events are invalid or duplicated";
      }
      seenEvents.add(event.eventId);
    }
    const finalEvents = state.events.filter(event => event.type === "battle.finalized");
    const revealEvents = state.events.filter(event => event.type === "battle.revealed");
    if (state.phase === "final") {
      if (finalEvents.length !== 1 || finalEvents[0].eventId !== state.battleId + ":final") {
        return "stable final event is missing or duplicated";
      }
    } else if (finalEvents.length !== 0) {
      return "non-final state contains a final event";
    }
    if (hasReveal ? revealEvents.length !== 1 : revealEvents.length !== 0) {
      return "reveal event count does not match phase";
    }
    if (hasReveal && (!state.resolution || !["A_WIN", "B_WIN", "DRAW"].includes(state.mechanicalOutcome))) {
      return "revealed resolution is invalid";
    }
    if (!hasReveal && (state.mechanicalOutcome !== null || state.resolution !== null)) {
      return "unrevealed state contains a resolution";
    }
    if (state.phase === "revealed") {
      const trigger = state.socialVoteTrigger ??
        (state.mechanicalOutcome === "DRAW" ? "DRAW" : "NONE");
      const triggerValid = ["DRAW", "AUTHORED_TEXT", "BOTH", "NONE"].includes(trigger) &&
        ((trigger === "DRAW" || trigger === "BOTH") === (state.mechanicalOutcome === "DRAW")) &&
        (trigger !== "AUTHORED_TEXT" || state.mechanicalOutcome !== "DRAW");
      if (!triggerValid || state.recognizedOutcome !== "PENDING" ||
          state.socialOutcome !== (trigger === "NONE" ? "NONE" : "PENDING")) {
        return "revealed social state is invalid";
      }
    }
    if (state.phase === "final") {
      const trigger = state.socialVoteTrigger ??
        (state.mechanicalOutcome === "DRAW" ? "DRAW" : "NONE");
      if (trigger !== "NONE" || state.mechanicalOutcome === "DRAW" ||
          state.recognizedOutcome !== state.mechanicalOutcome || state.socialOutcome !== "NONE") {
        return "final recognition state is invalid";
      }
    }
    if (!hasReveal && (state.recognizedOutcome !== null || state.socialOutcome !== null ||
        hasOwn(state, "socialVoteTrigger"))) {
      return "pre-reveal state contains a social result";
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
        socialOutcome: null,
        recognizedOutcome: null,
        expiredAt: null,
        expiredStage: null,
        missingParticipants: [],
        events: [],
        commandReceipts: Object.create(null)
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

    function execute(currentState, command, trustedNowMs) {
      const stateError = validateState(currentState);
      if (stateError) return error("INVALID_STATE", stateError);
      if (!isRecord(command) || typeof command.commandId !== "string" || !command.commandId.trim() ||
          typeof command.type !== "string" || !Number.isSafeInteger(command.expectedVersion) ||
          !Number.isSafeInteger(trustedNowMs)) {
        return error("INVALID_COMMAND", "commandId, type, expectedVersion, and trustedNowMs are required");
      }
      if (hasOwn(command, "at") || hasOwn(command, "now") || hasOwn(command, "trustedNowMs")) {
        return error("UNTRUSTED_TIME_FIELD", "time must be supplied separately by the trusted caller");
      }
      const allowedKeysByType = new Map([
        ["commit", new Set(["commandId", "expectedVersion", "type", "actorId", "participantId", "selection"])],
        ["reveal", new Set(["commandId", "expectedVersion", "type", "actorId", "participantId", "socialVoteTrigger"])],
        ["expire", new Set(["commandId", "expectedVersion", "type", "actorId", "participantId"])],
        ["finalize", new Set(["commandId", "expectedVersion", "type", "actorId", "participantId", "recognizedOutcome"])]
      ]);
      const allowedKeys = allowedKeysByType.get(command.type);
      if (!allowedKeys) return error("UNKNOWN_COMMAND", "supported commands are commit, reveal, expire, and finalize");
      if (Object.keys(command).some(key => !allowedKeys.has(key))) {
        return error("INVALID_COMMAND", "command contains unsupported fields");
      }
      if (typeof command.actorId !== "string" ||
          (command.participantId !== undefined && command.participantId !== null &&
           typeof command.participantId !== "string")) {
        return error("INVALID_COMMAND", "actorId and participantId are invalid");
      }
      let fingerprint;
      try { fingerprint = canonical(command); } catch (_) {
        return error("INVALID_COMMAND", "command is not canonical JSON data");
      }
      if (hasReceipt(currentState.commandReceipts, command.commandId)) {
        const prior = currentState.commandReceipts[command.commandId];
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
      if (currentState.phase === "expired") return error("BATTLE_EXPIRED", "battle lifecycle has expired");
      if (currentState.phase === "final") return error("BATTLE_FINAL", "battle is already final");

      let side = null;
      if (command.type === "commit") {
        side = participantSide(currentState, command.participantId);
        if (!side) return error("UNKNOWN_PARTICIPANT", "participantId is not part of this battle");
        if (command.actorId !== command.participantId) {
          return error("ACTOR_MISMATCH", "a participant may commit only as their own actor");
        }
        if (!["created", "waiting", "committed"].includes(currentState.phase)) {
          return error("COMMITS_CLOSED", "battle is no longer accepting commits");
        }
        const roleError = validateSelection(command.selection, currentState.participants[side].role);
        if (roleError) return error("INVALID_SELECTION", roleError);
        if (hasOwn(currentState.commits, side) &&
            canonical(currentState.commits[side].selection) !== canonical(command.selection)) {
          return error("COMMIT_IMMUTABLE", "confirmed selection cannot be changed");
        }
      } else {
        if (command.actorId !== "system" ||
            (command.participantId !== undefined && command.participantId !== null)) {
          return error("ACTOR_MISMATCH", "this lifecycle command requires the trusted system actor");
        }
        if (command.type === "reveal" && currentState.phase !== "committed") {
          return error("REVEAL_NOT_READY", "both participants must commit before reveal");
        }
        if (command.type === "expire" && !["created", "waiting"].includes(currentState.phase)) {
          return error("TIMEOUT_NOT_APPLICABLE", "timeout applies only before both commits are accepted");
        }
        if (command.type === "finalize") {
          if (currentState.phase !== "revealed") {
            return error("FINALIZATION_NOT_READY", "mechanical outcome must be revealed first");
          }
          const trigger = currentState.socialVoteTrigger ??
            (currentState.mechanicalOutcome === "DRAW" ? "DRAW" : "NONE");
          if (currentState.mechanicalOutcome === "DRAW" || currentState.socialOutcome === "PENDING" ||
              trigger !== "NONE") {
            return error("FINALIZATION_GATE_REQUIRED", "a required social outcome must resolve before finalization");
          }
          if (command.recognizedOutcome !== currentState.mechanicalOutcome) {
            return error("INVALID_RECOGNITION", "final recognized outcome must match the mechanical result");
          }
        }
      }

      // Deadline is the commit window only. It can expire an incomplete battle,
      // never a battle whose two commits were accepted on time.
      const preCommitPhase = ["created", "waiting"].includes(currentState.phase);
      const lateCommit = command.type === "commit" && preCommitPhase && trustedNowMs >= currentState.deadlineAt;
      const explicitTimeout = command.type === "expire" && trustedNowMs >= currentState.deadlineAt;
      if (command.type === "expire" && !explicitTimeout) {
        return error("DEADLINE_NOT_REACHED", "deadline has not been reached");
      }
      if (lateCommit || explicitTimeout) {
        const timed = cloneState(currentState);
        const expired = expire(timed, trustedNowMs);
        writeReceipt(timed.commandReceipts, command.commandId, {
          fingerprint, code: expired.code, eventIds: expired.eventIds.slice()
        });
        return { ok: true, code: expired.code, replayed: false, eventIds: expired.eventIds, state: timed };
      }

      if (command.type === "commit") {
        if (hasOwn(currentState.commits, side)) {
          const duplicate = cloneState(currentState);
          duplicate.version += 1;
          writeReceipt(duplicate.commandReceipts, command.commandId, {
            fingerprint, code: "ALREADY_COMMITTED", eventIds: []
          });
          return { ok: true, code: "ALREADY_COMMITTED", replayed: false, eventIds: [], state: duplicate };
        }
        const next = cloneState(currentState);
        next.version += 1;
        next.commits[side] = { selection: copyJson(command.selection), version: next.version };
        next.phase = Object.keys(next.commits).length === 2 ? "committed" : "waiting";
        const id = appendEvent(next, next.version, "battle.selection_committed", {
          side, participantId: next.participants[side].id
        });
        writeReceipt(next.commandReceipts, command.commandId, {
          fingerprint, code: "COMMITTED", eventIds: [id]
        });
        return { ok: true, code: "COMMITTED", replayed: false, eventIds: [id], state: next };
      }
      if (command.type === "reveal") {
        const a = currentState.commits.A.selection;
        const b = currentState.commits.B.selection;
        const resolution = resolver.resolve(a, b, RULES_VERSION);
        if (!resolution || resolution.ok !== true || resolution.rulesVersion !== RULES_VERSION) {
          return error("RESOLUTION_FAILED", "tactical_v1 resolver rejected committed selections");
        }
        const trigger = command.socialVoteTrigger ??
          (resolution.mechanicalOutcome === "DRAW" ? "DRAW" : "NONE");
        if (!["DRAW", "AUTHORED_TEXT", "BOTH", "NONE"].includes(trigger) ||
            ((trigger === "DRAW" || trigger === "BOTH") !== (resolution.mechanicalOutcome === "DRAW")) ||
            (trigger === "AUTHORED_TEXT" && resolution.mechanicalOutcome === "DRAW")) {
          return error("INVALID_SOCIAL_VOTE_TRIGGER", "reveal trigger does not match the mechanical result");
        }
        const next = cloneState(currentState);
        next.version += 1;
        next.phase = "revealed";
        next.resolution = copyJson(resolution);
        next.mechanicalOutcome = resolution.mechanicalOutcome;
        next.socialVoteTrigger = trigger;
        next.socialOutcome = trigger === "NONE" ? "NONE" : "PENDING";
        next.recognizedOutcome = "PENDING";
        const id = appendEvent(next, next.version, "battle.revealed", {
          selections: { A: a, B: b }, socialVoteTrigger: trigger
        });
        writeReceipt(next.commandReceipts, command.commandId, {
          fingerprint, code: "REVEALED", eventIds: [id]
        });
        return { ok: true, code: "REVEALED", replayed: false, eventIds: [id], state: next };
      }
      if (command.type === "finalize") {
        const next = cloneState(currentState);
        next.version += 1;
        next.phase = "final";
        next.socialOutcome = "NONE";
        next.recognizedOutcome = command.recognizedOutcome;
        const id = appendEvent(next, next.version, "battle.finalized", {
          mechanicalOutcome: next.mechanicalOutcome,
          socialOutcome: next.socialOutcome,
          recognizedOutcome: next.recognizedOutcome
        });
        writeReceipt(next.commandReceipts, command.commandId, {
          fingerprint, code: "FINALIZED", eventIds: [id]
        });
        return { ok: true, code: "FINALIZED", replayed: false, eventIds: [id], state: next };
      }
      return error("TIMEOUT_NOT_APPLICABLE", "timeout command was not applicable");
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
  // storage implementation. The adapter authenticates actors and supplies
  // server-authoritative time separately from the replayable command payload.
  // Reusing a commandId with the same command body is idempotent even when a
  // retry obtains a new trustedNowMs value.
  const persistenceAdapterContract = Object.freeze({
    load: "load({ battleId }) -> { state: serialized internal state, version } | null",
    compareAndSwap: "compareAndSwap({ battleId, expectedVersion, serializedState, events }) -> { ok, version }",
    requirements: Object.freeze([
      "compareAndSwap must atomically reject stale expectedVersion values",
      "state and all supplied events must be committed in the same transaction",
      "eventId must have a durable unique constraint for outbox deduplication",
      "a retry after an uncertain response must return the already committed event ids",
      "authenticate participant actors before execute and use actorId=system only for trusted lifecycle commands",
      "call execute(state, command, trustedNowMs) with server-authoritative integer milliseconds; never trust command.at",
      "trustedNowMs is excluded from the commandId fingerprint so clock regeneration does not break retries",
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