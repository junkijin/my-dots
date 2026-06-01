#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/resolve-manager-session.sh [--shell|--json|--help]

Resolve the deterministic workspace-scoped tmux manager session name for
long-running processes.

Outputs:
  default   Manager session name only
  --shell   Shell assignments suitable for eval
  --json    JSON object with manager/workspace metadata

Environment:
  PI_LONG_RUNNING_MANAGER  Optional explicit manager session name override.
                           Must match: [A-Za-z0-9_.-]+ and must not contain ':'.
EOF
}

mode="name"
case "${1:-}" in
  "") mode="name" ;;
  --shell) mode="shell" ;;
  --json) mode="json" ;;
  --help|-h) usage; exit 0 ;;
  *) echo "Error: unknown option: $1" >&2; usage >&2; exit 2 ;;
esac

resolve_workspace() {
  local root
  if root="$(git rev-parse --show-toplevel 2>/dev/null)" && [ -n "$root" ]; then
    (cd "$root" && pwd -P)
  else
    pwd -P
  fi
}

sha1_8() {
  if command -v sha1sum >/dev/null 2>&1; then
    printf '%s' "$1" | sha1sum | awk '{print substr($1, 1, 8)}'
  elif command -v shasum >/dev/null 2>&1; then
    printf '%s' "$1" | shasum -a 1 | awk '{print substr($1, 1, 8)}'
  else
    echo "Error: neither sha1sum nor shasum is available" >&2
    exit 3
  fi
}

slugify() {
  local value="$1"
  value="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
  value="$(printf '%s' "$value" | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"
  if [ -z "$value" ]; then
    value="workspace"
  fi
  printf '%s' "$value"
}

validate_manager_name() {
  local value="$1"
  if [ -z "$value" ]; then
    echo "Error: manager session name is empty" >&2
    exit 4
  fi
  if [[ "$value" == *:* ]]; then
    echo "Error: manager session name must not contain ':' (tmux target separator): $value" >&2
    exit 4
  fi
  if [[ ! "$value" =~ ^[A-Za-z0-9_.-]+$ ]]; then
    echo "Error: manager session name must match [A-Za-z0-9_.-]+: $value" >&2
    exit 4
  fi
}

shell_quote() {
  local value="$1"
  printf "'"
  printf '%s' "$value" | sed "s/'/'\\''/g"
  printf "'"
}

json_escape() {
  local value="$1"
  value=${value//\\/\\\\}
  value=${value//"/\\"}
  value=${value//$'\n'/\\n}
  value=${value//$'\r'/\\r}
  value=${value//$'\t'/\\t}
  printf '%s' "$value"
}

workspace="$(resolve_workspace)"
workspace_base="$(basename "$workspace")"
workspace_slug="$(slugify "$workspace_base")"
workspace_hash="$(sha1_8 "$workspace")"
manager_source="derived"

if [ -n "${PI_LONG_RUNNING_MANAGER:-}" ]; then
  manager_session="$PI_LONG_RUNNING_MANAGER"
  manager_source="override"
else
  manager_session="pi-${workspace_slug}-${workspace_hash}"
fi

validate_manager_name "$manager_session"

case "$mode" in
  name)
    printf '%s\n' "$manager_session"
    ;;
  shell)
    printf 'LONG_RUNNING_MANAGER_SESSION=%s\n' "$(shell_quote "$manager_session")"
    printf 'LONG_RUNNING_WORKSPACE=%s\n' "$(shell_quote "$workspace")"
    printf 'LONG_RUNNING_WORKSPACE_SLUG=%s\n' "$(shell_quote "$workspace_slug")"
    printf 'LONG_RUNNING_WORKSPACE_HASH=%s\n' "$(shell_quote "$workspace_hash")"
    printf 'LONG_RUNNING_MANAGER_SOURCE=%s\n' "$(shell_quote "$manager_source")"
    ;;
  json)
    printf '{\n'
    printf '  "managerSession": "%s",\n' "$(json_escape "$manager_session")"
    printf '  "workspace": "%s",\n' "$(json_escape "$workspace")"
    printf '  "workspaceSlug": "%s",\n' "$(json_escape "$workspace_slug")"
    printf '  "workspaceHash": "%s",\n' "$(json_escape "$workspace_hash")"
    printf '  "managerSource": "%s"\n' "$(json_escape "$manager_source")"
    printf '}\n'
    ;;
esac
