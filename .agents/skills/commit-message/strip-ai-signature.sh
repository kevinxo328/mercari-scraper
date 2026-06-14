#!/usr/bin/env bash
# Removes AI co-author trailers from a commit message.
# Usage: strip-ai-signature.sh <message-file>
#        echo "msg" | strip-ai-signature.sh

set -euo pipefail

AI_PATTERN='Co-[Aa]uthored-[Bb]y:.*([Cc]laude|[Cc]opilot|[Gg][Pp][Tt]|[Gg]emini|[Aa]nthropic)'

if [[ $# -ge 1 && -f "$1" ]]; then
  # File mode: edit in-place (git commit-msg hook style)
  tmp=$(mktemp)
  grep -vE "$AI_PATTERN" "$1" > "$tmp" || true
  # Remove trailing blank lines left after stripping
  awk 'NF { found=1 } found { print }' RS='' ORS='\n\n' "$tmp" | head -c -1 > "$1"
  rm -f "$tmp"
else
  # Stdin mode: filter and print to stdout
  grep -vE "$AI_PATTERN" || true
fi
