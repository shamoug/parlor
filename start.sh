#!/usr/bin/env sh
# The Parlor - start a local server and open the games in your browser.
cd "$(dirname "$0")" || exit 1
PORT=8120
open_browser() {
  sleep 1
  if command -v open >/dev/null 2>&1; then open "http://localhost:$PORT/"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:$PORT/"
  fi
}
if command -v python3 >/dev/null 2>&1; then open_browser & python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then open_browser & python -m http.server "$PORT"
else
  echo "Python not found - opening index.html directly."
  if command -v open >/dev/null 2>&1; then open index.html; else xdg-open index.html; fi
fi
