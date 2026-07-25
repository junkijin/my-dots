#!/bin/zsh
set -euo pipefail

TMUX_BIN="/opt/homebrew/bin/tmux"
SHELL_BIN="/opt/homebrew/bin/fish"
SESSION_NAME="${KITTY_TMUX_SESSION:-main}"
TEMP_SESSION_PREFIX="${KITTY_TMUX_TEMP_PREFIX:-tmp}"

# Avoid trying to attach/create tmux from inside an existing tmux client.
if [[ -n "${TMUX-}" ]]; then
  exec "$SHELL_BIN" -l
fi

if [[ ! -x "$TMUX_BIN" ]]; then
  print -u2 "tmux not found: $TMUX_BIN"
  exec "$SHELL_BIN" -l
fi

# If the main session is already attached elsewhere, open a disposable
# temporary session instead of attaching another client to the same session.
if "$TMUX_BIN" has-session -t "=$SESSION_NAME" 2>/dev/null; then
  attached="$($TMUX_BIN display-message -p -t "=$SESSION_NAME:" '#{session_attached}')"

  if (( attached > 0 )); then
    temp_session="${TEMP_SESSION_PREFIX}-$(date '+%Y%m%d-%H%M%S')-$$"

    "$TMUX_BIN" new-session -d -s "$temp_session"
    "$TMUX_BIN" set-hook -t "=$temp_session:" client-attached "set-option -t =$temp_session: destroy-unattached on"
    exec "$TMUX_BIN" attach-session -t "=$temp_session"
  fi

  exec "$TMUX_BIN" attach-session -t "=$SESSION_NAME"
fi

exec "$TMUX_BIN" new-session -s "$SESSION_NAME"
