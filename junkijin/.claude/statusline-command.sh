#!/bin/bash
# Claude Code status line: shows the session name on the left and, aligned to
# the right edge, the actual project name (not the folder name), suffixed with
# "::wt" when the session is running inside a Claude Code worktree, and the
# current git branch name.
#
# The project name is resolved in this order, because a worktree folder's
# name is generated arbitrarily by Claude Code and does not identify the
# project on its own:
#   1. workspace.repo.name  - the repo name from the git "origin" remote
#   2. worktree.original_cwd - the directory Claude was in before entering
#                               the worktree (present only in worktree
#                               sessions)
#   3. workspace.project_dir - the project root directory
#   4. workspace.current_dir / cwd - final fallback

input=$(cat)

dir=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')

session_name=$(echo "$input" | jq -r '.session_name // empty')
repo_name=$(echo "$input" | jq -r '.workspace.repo.name // empty')
original_cwd=$(echo "$input" | jq -r '.worktree.original_cwd // empty')
project_dir=$(echo "$input" | jq -r '.workspace.project_dir // empty')
worktree_name=$(echo "$input" | jq -r '.worktree.name // empty')

if [ -n "$repo_name" ]; then
  project="$repo_name"
elif [ -n "$original_cwd" ]; then
  project=$(basename "$original_cwd")
elif [ -n "$project_dir" ]; then
  project=$(basename "$project_dir")
else
  project=$(basename "$dir")
fi

branch=$(git -C "$dir" --no-optional-locks branch --show-current 2>/dev/null)

# Bash's ${#text} counts characters, which undercounts Hangul, CJK, and emoji
# because a terminal draws each of them two columns wide. The ranges below are
# the East Asian Wide and emoji blocks as decimal code points. Combining marks
# and emoji joined by ZWJ are counted per code point, so such text can
# misalign.
jq_column_width='
  def column_width:
    if (. >= 4352 and . <= 4447)
      or (. >= 11904 and . <= 42191)
      or (. >= 44032 and . <= 55203)
      or (. >= 63744 and . <= 64255)
      or (. >= 65072 and . <= 65103)
      or (. >= 65280 and . <= 65376)
      or (. >= 65504 and . <= 65510)
      or (. >= 127744 and . <= 129791)
      or (. >= 131072 and . <= 262141)
    then 2 else 1 end;'

# Prints the number of terminal columns that the given text occupies.
display_width() {
  jq -rn --arg text "$1" "$jq_column_width"'
    [$text | explode[] | column_width] | add // 0'
}

# Prints the longest prefix of the text ($1) that fits in the given number of
# terminal columns ($2).
fit_to_width() {
  jq -rn --arg text "$1" --argjson max_columns "$2" "$jq_column_width"'
    reduce ($text | explode[]) as $code_point (
      {columns: 0, kept: [], full: false};
      ($code_point | column_width) as $width
      | if .full or .columns + $width > $max_columns
        then .full = true
        else .columns += $width | .kept += [$code_point]
        end
    ) | .kept | implode'
}

fmt="\033[96m%s\033[0m"
args=("$project")
project_text="$project"

if [ -n "$worktree_name" ]; then
  fmt="$fmt\033[90m::wt\033[0m"
  project_text="$project_text::wt"
fi

if [ -n "$branch" ]; then
  fmt="$fmt \033[92m(%s)\033[0m"
  args+=("$branch")
  project_text="$project_text ($branch)"
fi

# Claude Code pads the footer row that holds the status line by two columns on
# each side.
footer_padding_columns=4
session_name_gap=2

row_columns=$(( ${COLUMNS:-0} - footer_padding_columns ))
project_columns=$(display_width "$project_text")
session_name_columns=$(display_width "$session_name")

# Claude Code cuts a row that is too wide from its end, which would hide the
# branch first, so the session name gives up its columns instead. Without
# COLUMNS the row width is unknown and the name is left as it is.
max_session_name_columns=$(( row_columns - project_columns - session_name_gap ))
if [ "${COLUMNS:-0}" -gt 0 ] && [ "$session_name_columns" -gt "$max_session_name_columns" ]; then
  if [ "$max_session_name_columns" -ge 2 ]; then
    session_name="$(fit_to_width "$session_name" $(( max_session_name_columns - 1 )))…"
  else
    session_name=""
  fi
  session_name_columns=$(display_width "$session_name")
fi

min_gap=0
if [ -n "$session_name" ]; then
  min_gap=$session_name_gap
fi

gap=$(( row_columns - session_name_columns - project_columns ))
if [ "$gap" -lt "$min_gap" ]; then
  gap=$min_gap
fi

# Claude Code trims whitespace from both ends of each status line row, so the
# leading reset sequence keeps the padding in place when there is no session
# name.
printf "\033[0m\033[97m%s\033[0m%*s$fmt" "$session_name" "$gap" "" "${args[@]}"
