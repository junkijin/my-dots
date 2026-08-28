/opt/homebrew/bin/brew shellenv | source

if status is-interactive
    set -gx VISUAL nvim
    set -gx SHELL (command -s fish)
    abbr --add cx codex
    abbr --add th treehouse

    # Treehouse marks its subshell with TREEHOUSE_DIR. Mirror that state into
    # a pane-local tmux option so each pane can render its own indicator.
    function __treehouse_tmux_sync --on-event fish_prompt
        set -q TMUX_PANE; or return

        if set -q TREEHOUSE_DIR
            command tmux set-option -p -t "$TMUX_PANE" \
                @treehouse_dir "$TREEHOUSE_DIR"
        else
            command tmux set-option -p -u -t "$TMUX_PANE" \
                @treehouse_dir 2>/dev/null
        end
    end

    function __treehouse_tmux_clear --on-event fish_exit
        if set -q TMUX_PANE; and set -q TREEHOUSE_DIR
            command tmux set-option -p -u -t "$TMUX_PANE" \
                @treehouse_dir 2>/dev/null
        end
    end
end
