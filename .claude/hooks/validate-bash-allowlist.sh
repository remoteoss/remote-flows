#!/usr/bin/env bash
set -u

command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0

allow() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

if [[ "$cmd" =~ ^git\ fetch\ origin$ ]]; then
  allow "fetch origin, no refspec/flags"
fi

if [[ "$cmd" =~ ^git\ fetch\ origin\ refs/pull/[0-9]+/head$ ]]; then
  allow "fetch a PR ref for review"
fi

if [[ "$cmd" =~ ^mkdir\ -p\ /tmp/[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  allow "scratch dir under /tmp"
fi

if [[ "$cmd" =~ ^cat\ \>\ /tmp/[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  allow "scratch file write (no payload) under /tmp"
fi

# the delimiter must be the sole match and the final line, or bash would end the heredoc early and run whatever follows as a second command
first_line="${cmd%%$'\n'*}"
if [[ "$first_line" != "$cmd" ]]; then
  header_re="^cat > /tmp/[A-Za-z0-9][A-Za-z0-9._-]*[[:space:]]<<[[:space:]]*('[A-Za-z_][A-Za-z0-9_]*'|\"[A-Za-z_][A-Za-z0-9_]*\")\$"
  if [[ "$first_line" =~ $header_re ]]; then
    delim="${BASH_REMATCH[1]}"
    delim="${delim#[\'\"]}"
    delim="${delim%[\'\"]}"
    body="${cmd#*$'\n'}"
    n=0
    delim_count=0
    delim_last_pos=0
    while IFS= read -r line || [[ -n "$line" ]]; do
      n=$((n + 1))
      if [[ "$line" == "$delim" ]]; then
        delim_count=$((delim_count + 1))
        delim_last_pos=$n
      fi
    done <<<"$body"
    if [[ "$delim_count" -eq 1 && "$delim_last_pos" -eq "$n" ]]; then
      allow "scratch file heredoc write under /tmp"
    fi
  fi
fi

exit 0
