/opt/homebrew/bin/brew shellenv | source

if status is-interactive
    set -gx SHELL (status fish-path)
    set -gx VISUAL nvim
    abbr --add th treehouse
    abbr --add cld claude
end

