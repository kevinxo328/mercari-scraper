#!/usr/bin/env bash
# Removes recognized AI co-author trailers from a commit message.
# Usage: strip-ai-signature.sh <message-file>
#        echo "msg" | strip-ai-signature.sh

set -euo pipefail

AI_PATTERN='^[[:space:]]*Co-[Aa]uthored-[Bb]y:[[:space:]].*([Cc]laude|[Cc]opilot|[Gg][Pp][Tt]|[Gg]emini|[Aa]nthropic)'

filter_stream() {
  local status=0

  grep -Eiv "$AI_PATTERN" || status=$?
  [[ $status -eq 0 || $status -eq 1 ]]
}

trim_trailing_blank_lines() {
  awk '
    { lines[++count] = $0 }
    END {
      while (count > 0 && lines[count] ~ /^[[:space:]]*$/) count--
      for (i = 1; i <= count; i++) print lines[i]
    }
  '
}

if [[ $# -gt 1 ]]; then
  printf 'usage: %s [message-file]\n' "$0" >&2
  exit 2
fi

if [[ $# -eq 1 ]]; then
  if [[ ! -f "$1" ]]; then
    printf 'error: message file not found: %s\n' "$1" >&2
    exit 2
  fi

  # File mode: edit in-place (git commit-msg hook style)
  tmp=$(mktemp)
  trap 'rm -f "$tmp"' EXIT
  filter_stream < "$1" | trim_trailing_blank_lines > "$tmp"
  cat "$tmp" > "$1"
  rm -f "$tmp"
  trap - EXIT
else
  # Stdin mode: filter and print to stdout
  filter_stream | trim_trailing_blank_lines
fi
