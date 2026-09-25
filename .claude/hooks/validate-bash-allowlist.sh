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
elif [[ "$cmd" =~ ^git\ fetch\ origin\ refs/pull/[0-9]+/head$ ]]; then
  allow "fetch a PR ref for review"
elif [[ "$cmd" =~ ^mkdir\ -p\ /tmp/[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  allow "scratch dir under /tmp"
elif [[ "$cmd" =~ ^cat\ \>\ /tmp/[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  allow "scratch file write under /tmp"
fi

exit 0
