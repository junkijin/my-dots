/opt/homebrew/bin/brew shellenv | source

if status is-interactive
    set -gx VISUAL nvim
    set -gx SHELL (command -s fish)

    abbr --add cx codex
    abbr --add 'cx~' 'codex resume'
    abbr --add th treehouse
end

