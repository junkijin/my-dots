/opt/homebrew/bin/brew shellenv | source

if status is-interactive
    set -gx VISUAL nvim
    set -gx SHELL (command -s fish)
end
