/opt/homebrew/bin/brew shellenv | source

if status is-interactive
    set -gx SHELL (status fish-path)
    set -gx VISUAL nvim
    abbr --add cx codex
    abbr --add 'cx~' 'codex resume'
    abbr --add th treehouse
end

