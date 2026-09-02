function cx --description 'Run Codex in a clean alternate screen'
    if not isatty stdout
        command codex $argv
        return $status
    end

    tput smcup
    tput clear

    command codex $argv
    set -l codex_status $status

    tput rmcup
    return $codex_status
end
