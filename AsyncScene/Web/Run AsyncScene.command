#!/bin/bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$ROOT_DIR/Web"
TOOLS_DIR="$ROOT_DIR/tools"
LOGGER_JS="$TOOLS_DIR/logger.js"
LOG_DIR="$ROOT_DIR/AsyncSceneLogs"

mkdir -p "$LOG_DIR"

echo "▶ AsyncScene launcher"
echo "▶ Root: $ROOT_DIR"
echo "▶ Logger: $LOGGER_JS"

# ---- start logger ----
if lsof -i :17321 >/dev/null 2>&1; then
  echo "▶ Logger already running on :17321"
else
  if [ ! -f "$LOGGER_JS" ]; then
    echo "❌ logger.js not found at $LOGGER_JS"
  else
    echo "▶ Starting logger..."
    node "$LOGGER_JS" >> "$LOG_DIR/logger.out.log" 2>&1 &
    LOGGER_PID=$!
    sleep 0.5
    if ps -p $LOGGER_PID > /dev/null; then
      echo "▶ Logger started (pid=$LOGGER_PID)"
    else
      echo "❌ Logger failed to start, see $LOG_DIR/logger.out.log"
    fi
  fi
fi

# ---- start web server ----
if lsof -i :8080 >/dev/null 2>&1; then
  echo "▶ Web server already running on :8080"
else
  echo "▶ Starting web server..."
  cd "$WEB_DIR"
  python3 -m http.server 8080 >> "$LOG_DIR/web.out.log" 2>&1 &
  echo "▶ Web server started"
fi

sleep 0.3

URL="http://localhost:8080/index.html?dev=1"
echo "▶ Opening browser: $URL"
open -n "$URL"

echo "▶ Done"
