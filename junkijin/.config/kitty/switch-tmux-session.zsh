#!/bin/zsh
set -euo pipefail

TMUX_BIN="/opt/homebrew/bin/tmux"
FZF_BIN="/opt/homebrew/bin/fzf"

if [[ ! -x "$TMUX_BIN" ]]; then
  print -u2 "tmux not found: $TMUX_BIN"
  exit 1
fi

if [[ ! -x "$FZF_BIN" ]]; then
  print -u2 "fzf not found: $FZF_BIN"
  exit 1
fi

sessions="$($TMUX_BIN list-sessions -F '#{session_name}' 2>/dev/null || true)"

if [[ -z "$sessions" ]]; then
  print -u2 "No tmux sessions found."
  exit 0
fi

selected="$(printf '%s\n' "$sessions" | "$FZF_BIN" \
  --ansi \
  --prompt='tmux session> ' \
  --preview="$TMUX_BIN list-windows -t {} -F '#{window_index}:#{window_name}#{?window_active,*, } #{window_panes} panes'; echo; $TMUX_BIN capture-pane -p -e -t {} -S -2000 -E - | tail -n 40" \
  --preview-window='right:70%:wrap')"

if [[ -z "$selected" ]]; then
  exit 0
fi

exec "$TMUX_BIN" attach-session -t "$selected"
