#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only process JS/TS files
if [[ ! "$FILE_PATH" =~ \.(js|jsx|ts|tsx)$ ]]; then
  exit 0
fi

# 1. oxfmt
pnpm exec oxfmt "$FILE_PATH" 2>/dev/null

# 2. ESLint
pnpm exec eslint --fix "$FILE_PATH" 2>/dev/null

# 3. TypeScript type-check (via turbo for cache)
# Output errors to stderr + exit 2 so Claude sees them as feedback
TSC_OUTPUT=$(pnpm type-check 2>&1)
if echo "$TSC_OUTPUT" | grep -q "error TS"; then
  echo "$TSC_OUTPUT" | grep "error TS" | head -10 >&2
  exit 2
fi

exit 0
