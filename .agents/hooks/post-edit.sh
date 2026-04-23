#!/bin/bash

set -u

INPUT=$(cat)
declare -a TARGETS=()
TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.toolName // empty' 2>/dev/null)
TOOL_ARGS_JSON=$(printf '%s' "$INPUT" | jq -c '
  (.toolArgs // empty)
  | if . == empty then {}
    elif type == "string" then (fromjson? // {})
    elif type == "object" then .
    else {}
    end
' 2>/dev/null)

is_supported_file() {
  [[ "$1" =~ \.(js|jsx|ts|tsx)$ ]]
}

add_target() {
  local candidate="$1"
  local normalized

  if [[ -z "$candidate" ]]; then
    return
  fi

  normalized="${candidate#./}"
  if [[ "$normalized" == a/* || "$normalized" == b/* ]]; then
    normalized="${normalized#?/}"
  fi

  if [[ -f "$normalized" ]] && is_supported_file "$normalized"; then
    TARGETS+=("$normalized")
  fi
}

collect_git_targets() {
  local git_root
  if ! git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
    return
  fi

  while IFS= read -r candidate; do
    add_target "$candidate"
  done < <(
    {
      git -C "$git_root" diff --name-only --diff-filter=ACMR
      git -C "$git_root" diff --cached --name-only --diff-filter=ACMR
      git -C "$git_root" ls-files --others --exclude-standard
    } | sed '/^$/d' | sort -u
  )
}

if [[ -n "$TOOL_NAME" ]] && [[ ! "$TOOL_NAME" =~ ^(edit|create|apply_patch|multi_edit)$ ]]; then
  exit 0
fi

FILE_PATH=$(printf '%s' "$TOOL_ARGS_JSON" | jq -r '.file_path // .path // empty' 2>/dev/null)
if [[ -n "$FILE_PATH" ]]; then
  add_target "$FILE_PATH"
fi

PATCH_TEXT=$(printf '%s' "$TOOL_ARGS_JSON" | jq -r '.input // .patch // empty' 2>/dev/null)
if [[ -n "$PATCH_TEXT" ]]; then
  while IFS= read -r line; do
    CANDIDATE=$(printf '%s\n' "$line" | sed -nE 's/^\*\*\* (Update|Add|Delete) File: (.+)$/\2/p')
    if [[ -n "$CANDIDATE" ]]; then
      add_target "$CANDIDATE"
    fi
  done <<<"$PATCH_TEXT"
fi

CLAUDE_FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
if [[ -n "$CLAUDE_FILE_PATH" ]]; then
  add_target "$CLAUDE_FILE_PATH"
fi

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  collect_git_targets
fi

if [[ ${#TARGETS[@]} -eq 0 ]]; then
  exit 0
fi

declare -a UNIQUE_TARGETS=()
while IFS= read -r candidate; do
  UNIQUE_TARGETS+=("$candidate")
done < <(printf '%s\n' "${TARGETS[@]}" | sed '/^$/d' | sort -u)
TARGETS=("${UNIQUE_TARGETS[@]}")

pnpm exec oxfmt "${TARGETS[@]}" >/dev/null 2>&1
pnpm exec eslint --fix "${TARGETS[@]}" >/dev/null 2>&1

TSC_OUTPUT=$(pnpm type-check 2>&1)
if printf '%s\n' "$TSC_OUTPUT" | grep -q 'error TS'; then
  printf '%s\n' "$TSC_OUTPUT" | grep 'error TS' | head -10 >&2
  exit 2
fi

exit 0
