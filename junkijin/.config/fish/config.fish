/opt/homebrew/bin/brew shellenv fish | source

if status is-interactive
    set -gx VISUAL nvim
end
