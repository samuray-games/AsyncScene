#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
REMOTE_NAME="${STAGE715_REMOTE_NAME:-origin}"
PR_NUMBER="403"
PR_REF="refs/pull/${PR_NUMBER}/head"
EVIDENCE_ROOT="${STAGE715_EVIDENCE_ROOT:-$ROOT/output/stage715-external-acceptance}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
EVIDENCE_DIR="$EVIDENCE_ROOT/$RUN_ID"
WORKTREE="$(mktemp -d "${TMPDIR:-/tmp}/asyncscene-stage715-candidate.XXXXXX")"
PORT="${STAGE715_PORT:-}"
SERVER_PID=""
SERVER_EXIT_STATUS="unknown"

cleanup() {
  set +e
  if [[ -n "$SERVER_PID" ]]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi
  if [[ -d "$WORKTREE" ]]; then git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || rm -rf "$WORKTREE"; fi
}
trap cleanup EXIT INT TERM

mkdir -p "$EVIDENCE_DIR"
INVOKING_SHA="$(git rev-parse HEAD)"
git fetch --no-tags "$REMOTE_NAME" "$PR_REF" > "$EVIDENCE_DIR/fetch.log" 2>&1 || {
  echo "FAIL: unable to fetch current PR #$PR_NUMBER head from $REMOTE_NAME" >&2
  exit 20
}
REMOTE_SHA="$(git rev-parse FETCH_HEAD^{commit})"
[[ "$REMOTE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "FAIL: fetched PR #$PR_NUMBER head is not a full commit SHA" >&2; exit 21; }
printf '%s\n' "pr=$PR_NUMBER" "remote=$REMOTE_NAME" "remoteRef=$PR_REF" "invokingCheckout=$INVOKING_SHA" "candidate=$REMOTE_SHA" "root=$ROOT" "worktree=$WORKTREE" "evidence=$EVIDENCE_DIR" > "$EVIDENCE_DIR/runner-start.txt"

git worktree add --detach "$WORKTREE" "$REMOTE_SHA" >/dev/null
[[ "$(git -C "$WORKTREE" rev-parse HEAD)" == "$REMOTE_SHA" ]] || { echo "FAIL: isolated checkout SHA mismatch" >&2; exit 22; }
[[ -z "$(git -C "$WORKTREE" status --porcelain)" ]] || { echo "FAIL: isolated checkout is dirty" >&2; exit 23; }
[[ -d "$WORKTREE/AsyncScene/Web" && -f "$WORKTREE/AsyncScene/Web/index.html" ]] || { echo "FAIL: wrong AsyncScene document root" >&2; exit 24; }

MIRRORS=(
  "AsyncScene/Web/ui/ui-stage7-first-experience.js:docs/ui/ui-stage7-first-experience.js"
  "AsyncScene/Web/ui/ui-battles.js:docs/ui/ui-battles.js"
  "AsyncScene/Web/ui/ui-dm.js:docs/ui/ui-dm.js"
  "AsyncScene/Web/ui/ui-events.js:docs/ui/ui-events.js"
)
for pair in "${MIRRORS[@]}"; do
  left="${pair%%:*}"; right="${pair#*:}"
  cmp "$WORKTREE/$left" "$WORKTREE/$right" || { echo "FAIL: mirror mismatch $pair" >&2; exit 25; }
done

python3 "$ROOT/tools/test_stage7_15_boot_mirror_contract.py" "$WORKTREE" > "$EVIDENCE_DIR/ui-boot-mirror-contract.txt"

CRITICAL=(
  "AsyncScene/Web/index.html"
  "AsyncScene/Web/ui/ui-boot.js"
  "AsyncScene/Web/ui/ui-stage7-first-experience.js"
  "AsyncScene/Web/ui/ui-battles.js"
  "AsyncScene/Web/ui/ui-dm.js"
  "AsyncScene/Web/ui/ui-events.js"
  "AsyncScene/Web/conflict/conflict-core.js"
  "AsyncScene/Web/conflict/conflict-api.js"
)
{
  printf '{"candidateCommit":"%s","documentRoot":"%s","files":{' "$REMOTE_SHA" "$WORKTREE/AsyncScene/Web"
  first=1
  for rel in "${CRITICAL[@]}"; do
    [[ $first -eq 1 ]] || printf ','
    first=0
    hash="$(shasum -a 256 "$WORKTREE/$rel" | awk '{print $1}')"
    printf '\"%s\":\"%s\"' "$(printf '%s' "$rel" | sed 's/"/\\"/g')" "$hash"
  done
  printf '}}\n'
} > "$EVIDENCE_DIR/candidate-hashes.json"

if [[ -z "$PORT" ]]; then
  PORT="$(python3 -c 'import socket; s=socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()')"
fi
[[ "$PORT" =~ ^[1-9][0-9]{1,4}$ ]] || { echo "FAIL: selected server port is invalid: $PORT" >&2; exit 26; }
printf '%s\n' "$PORT" > "$EVIDENCE_DIR/server.requested-port"

(cd "$WORKTREE/AsyncScene/Web" && exec python3 -u dev/dev-server.py "$PORT") > "$EVIDENCE_DIR/server.log" 2>&1 &
SERVER_PID=$!
printf '%s\n' "$SERVER_PID" > "$EVIDENCE_DIR/server.pid"
printf '%s\n' "(cd $WORKTREE/AsyncScene/Web && exec python3 -u dev/dev-server.py $PORT)" > "$EVIDENCE_DIR/server.command"
READY=0
for _ in $(seq 1 100); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    set +e
    wait "$SERVER_PID"
    SERVER_EXIT_STATUS=$?
    set -e
    break
  fi
  if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/index.html" -o "$EVIDENCE_DIR/readiness-index.html" 2>"$EVIDENCE_DIR/readiness-curl.last-error"; then
    READY=1
    break
  fi
  sleep 0.2
done
printf '%s\n' "$PORT" > "$EVIDENCE_DIR/server.port"
if [[ "$READY" != "1" ]]; then
  set +e
  if [[ "$SERVER_EXIT_STATUS" == "unknown" ]] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
    wait "$SERVER_PID"
    SERVER_EXIT_STATUS=$?
  fi
  ps -o pid=,ppid=,stat=,command= -p "$SERVER_PID" > "$EVIDENCE_DIR/server.process-state.txt" 2>&1
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN > "$EVIDENCE_DIR/server.port-state.txt" 2>&1
  printf '%s\n' "$SERVER_EXIT_STATUS" > "$EVIDENCE_DIR/server.exit-status"
  set -e
  echo "FAIL: local HTTP server did not become ready (pid=$SERVER_PID port=$PORT exit=$SERVER_EXIT_STATUS)" >&2
  exit 26
fi

for rel in "${CRITICAL[@]}"; do
  served="$EVIDENCE_DIR/served-${rel//\//_}"
  curl -fsS "http://127.0.0.1:$PORT/${rel#AsyncScene/Web/}" -o "$served"
  cmp "$WORKTREE/$rel" "$served" || { echo "FAIL: served bytes differ for $rel" >&2; exit 27; }
done

{
  printf '{"candidateCommit":"%s","files":{' "$REMOTE_SHA"
  first=1
  for rel in "${CRITICAL[@]}"; do
    [[ $first -eq 1 ]] || printf ','
    first=0
    served="$EVIDENCE_DIR/served-${rel//\//_}"
    hash="$(shasum -a 256 "$served" | awk '{print $1}')"
    printf '\"%s\":\"%s\"' "$(printf '%s' "$rel" | sed 's/"/\\"/g')" "$hash"
  done
  printf '}}\n'
} > "$EVIDENCE_DIR/served-hashes.json"

export STAGE715_CANDIDATE_SHA="$REMOTE_SHA"
export STAGE715_CANDIDATE_ROOT="$WORKTREE/AsyncScene/Web"
export STAGE715_EVIDENCE_DIR="$EVIDENCE_DIR"
export STAGE715_START_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export NODE_PATH="$ROOT/node_modules${NODE_PATH:+:$NODE_PATH}"
node "$ROOT/tools/run_stage715_external_acceptance.mjs" "http://127.0.0.1:$PORT/index.html?stage715demo=1"
