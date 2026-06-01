#!/bin/zsh
set -euo pipefail

TMUX_BIN="/opt/homebrew/bin/tmux"
SESSION_NAME="${KITTY_TMUX_SESSION:-main}"

# Avoid trying to attach/create tmux from inside an existing tmux client.
if [[ -n "${TMUX-}" ]]; then
  exec /bin/zsh -l
fi

if [[ ! -x "$TMUX_BIN" ]]; then
  print -u2 "tmux not found: $TMUX_BIN"
  exec /bin/zsh -l
fi

exec "$TMUX_BIN" new-session -A -s "$SESSION_NAME"
