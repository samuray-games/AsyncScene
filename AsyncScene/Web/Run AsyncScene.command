#!/bin/zsh
set -euo pipefail

PORT="${PORT:-8080}"
PRIVATE="${PRIVATE:-1}"
CLEAR_CACHE="${CLEAR_CACHE:-1}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_WEB_DIR="/Users/User/Documents/created apps/AsyncScene/AsyncScene/Web"

WEB_DIR="${WEB_DIR:-$SCRIPT_DIR}"
if [[ ! -f "${WEB_DIR}/index.html" ]]; then
  WEB_DIR="$DEFAULT_WEB_DIR"
fi

LOG="/tmp/asyncscene.launch.log"
: > "${LOG}"

log(){ print -r -- "$@" | tee -a "${LOG}"; }

if [[ ! -f "${WEB_DIR}/index.html" ]]; then
  log "[fail] index.html не найден."
  read -r "?нажми Enter чтобы закрыть это окно... "
  exit 1
fi

URL="http://localhost:${PORT}/index.html?v=$(date +%s)"

log "[run] web_dir: ${WEB_DIR}"
log "[run] port: ${PORT}"
log "[run] url: ${URL}"
log "[run] private: ${PRIVATE}"
log "[run] clear_cache: ${CLEAR_CACHE}"
log ""

if [[ "${CLEAR_CACHE}" == "1" ]]; then
  log "[run] quitting Safari (for cache clean)..."
  osascript >>"${LOG}" 2>&1 <<'OSA' || true
tell application "Safari"
  if it is running then quit
end tell
OSA

  for i in {1..80}; do
    if ! pgrep -x "Safari" >/dev/null 2>&1; then break; fi
    sleep 0.05
  done

  log "[run] clearing Safari/WebKit caches..."
  rm -rf \
    "$HOME/Library/Caches/com.apple.Safari" \
    "$HOME/Library/Caches/com.apple.WebKit.Networking" \
    "$HOME/Library/Caches/com.apple.WebKit.WebContent" \
    "$HOME/Library/Caches/com.apple.WebKit.GPU" \
    "$HOME/Library/Caches/com.apple.WebKit.WebContentExtension" \
    "$HOME/Library/Caches/com.apple.Safari.SafeBrowsing" \
    >/dev/null 2>&1 || true
fi

PIDS="$(lsof -ti tcp:${PORT} 2>/dev/null || true)"
if [[ -n "${PIDS}" ]]; then
  log "[run] killing existing on port ${PORT}: ${PIDS}"
  kill -9 ${PIDS} 2>/dev/null || true
fi

log "[run] starting server..."
python3 -m http.server "${PORT}" --directory "${WEB_DIR}" >>/tmp/asyncscene.server.log 2>&1 &
SERVER_PID=$!
disown

for i in {1..120}; do
  if lsof -ti tcp:${PORT} >/dev/null 2>&1; then break; fi
  sleep 0.05
done

open_private_safari() {
  osascript >>"${LOG}" 2>&1 <<OSA
set theURL to "${URL}"

tell application "Safari" to activate
delay 0.25

tell application "System Events"
  tell process "Safari"
    set frontmost to true
    delay 0.25

    -- Attempt 1: menu (English)
    try
      click menu item "New Private Window" of menu "File" of menu bar 1
      delay 0.25
    end try

    -- Attempt 2: menu (Russian)
    try
      click menu item "Новое приватное окно" of menu "Файл" of menu bar 1
      delay 0.25
    end try

    -- Attempt 3: hotkey Shift+Cmd+N
    try
      keystroke "n" using {command down, shift down}
      delay 0.25
    end try
  end tell
end tell

tell application "Safari"
  try
    set URL of front document to theURL
  on error
    open location theURL
  end try
end tell
OSA
}

if [[ "${PRIVATE}" == "1" ]]; then
  log "[run] opening Safari (try Private Window)..."
  open_private_safari || true
else
  log "[run] opening Safari..."
  open -a "Safari" "${URL}"
fi

log ""
log "[ok] server pid: ${SERVER_PID}"
log "[ok] logs: /tmp/asyncscene.server.log"
log "[ok] launcher log: ${LOG}"
log ""

log "[hint] Если приватное окно не открылось:"
log " - проверь System Settings -> Privacy & Security -> Automation -> Terminal -> Safari (галочка)"
log " - и что пункт 'New Private Window' доступен в Safari вручную"
log ""

read -r "?нажми Enter чтобы закрыть это окно... "
