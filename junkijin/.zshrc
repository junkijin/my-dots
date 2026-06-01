# Only auto-switch the initial login zsh to fish.
# This keeps an explicitly started interactive `zsh` as zsh.
if [[ -o interactive && -o login ]]; then
  exec fish
fi
