#!/bin/sh
set -eu

# Reorder the current tmux window by one slot, shifting intervening windows.
# Usage: reorder-window.sh left|right <session_id> <window_id>

direction=${1:-}
session_id=${2:-}
window_id=${3:-}

if [ -z "$direction" ] || [ -z "$session_id" ] || [ -z "$window_id" ]; then
  exit 0
fi

windows=$(tmux list-windows -t "$session_id" -F '#{window_id}' 2>/dev/null) || exit 0

# window_id values are tmux ids such as @3, so plain word splitting is safe.
# shellcheck disable=SC2086
set -- $windows
count=$#

if [ "$count" -le 1 ]; then
  exit 0
fi

current_pos=0
i=1
for id do
  if [ "$id" = "$window_id" ]; then
    current_pos=$i
    break
  fi
  i=$((i + 1))
done

if [ "$current_pos" -eq 0 ]; then
  exit 0
fi

nth_window() {
  target_pos=$1
  shift

  i=1
  for id do
    if [ "$i" -eq "$target_pos" ]; then
      printf '%s\n' "$id"
      return 0
    fi
    i=$((i + 1))
  done

  return 1
}

case "$direction" in
  left)
    if [ "$current_pos" -eq 1 ]; then
      target=$(nth_window "$count" "$@") || exit 0
      tmux move-window -a -s "$window_id" -t "$target"
    else
      target=$(nth_window "$((current_pos - 1))" "$@") || exit 0
      tmux move-window -b -s "$window_id" -t "$target"
    fi
    ;;
  right)
    if [ "$current_pos" -eq "$count" ]; then
      target=$(nth_window 1 "$@") || exit 0
      tmux move-window -b -s "$window_id" -t "$target"
    else
      target=$(nth_window "$((current_pos + 1))" "$@") || exit 0
      tmux move-window -a -s "$window_id" -t "$target"
    fi
    ;;
  *)
    exit 0
    ;;
esac

# Keep window indexes contiguous even when the move used explicit window ids.
tmux move-window -r -t "$session_id" >/dev/null 2>&1 || true

# Keep focus on the moved window after indexes are renumbered.
tmux select-window -t "$window_id" >/dev/null 2>&1 || true
