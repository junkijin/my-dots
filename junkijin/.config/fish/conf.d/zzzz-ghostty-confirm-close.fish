if status is-interactive
    and set --query GHOSTTY_RESOURCES_DIR
    and set --query TREEHOUSE_DIR
    and status test-feature mark-prompt

    set --local fish_path (status fish-path)
    exec $fish_path --features=no-mark-prompt
end
