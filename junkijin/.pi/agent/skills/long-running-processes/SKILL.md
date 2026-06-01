---
name: long-running-processes
description: Use when a shell process should keep running, serve traffic, watch files, stream logs, remain interactive, or require later inspection/control.
---

Use tmux, not `&`, `nohup`, `disown`, or fire-and-forget spawning. Resolve `scripts/resolve-manager-session.sh` against this skill directory.

```bash
eval "$("<absolute-skill-dir>/scripts/resolve-manager-session.sh" --shell)"
tmux list-windows -t "$LONG_RUNNING_MANAGER_SESSION" -F '#W'
tmux capture-pane -pt "$LONG_RUNNING_MANAGER_SESSION":<window>.0 -S -200
tmux new-session -d -s "$LONG_RUNNING_MANAGER_SESSION" -n <window> -c "$PWD" '<command>'
tmux new-window -t "$LONG_RUNNING_MANAGER_SESSION": -n <window> -c "$PWD" '<command>'
```
