---
name: commit-message
description: >-
  Write Conventional Commit messages. Use when the user asks to draft or revise a
  commit message, asks to commit changes, or supplies a diff or change description
  specifically for creating a commit message.
metadata:
  version: "1.2.0"
---

# Commit Message Skill

Write a Conventional Commit message from verified change context. The description states **What** changed. Add a body when the motivation, previous behavior, or trade-off is not evident from the description.

## Workflow

1. Establish the intended change set from the user's request, supplied diff, or repository state. When a repository is available, inspect the relevant diff and recent commit subjects before choosing wording.
2. Classify the primary intent, scope, breaking change, and supported footers. Account for every changed concern; flag unrelated concerns and suggest separate commits.
3. Draft only claims supported by the request or inspected changes. If missing information would change the type, breaking-change status, or rationale, ask one focused question. Otherwise state the assumption and keep the draft conservative.
4. Validate the result against the format, the project's recent conventions, and the style rules below.

Completion criterion: every claim is evidence-backed, the type matches the primary intent, every changed concern is accounted for, and the output is a ready-to-copy message.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**type** (required). The following are common defaults, not an exhaustive Conventional Commits list:

| Type       | Description                    |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting, no logic change    |
| `refactor` | Restructure, not a feat or fix |
| `perf`     | Performance improvement        |
| `test`     | Adding or updating tests       |
| `chore`    | Build process or tooling       |
| `revert`   | Reverting a previous commit    |
| `ci`       | CI/CD pipeline changes         |
| `build`    | Build system changes           |

**scope** (optional) — area affected, e.g. `auth`, `api`, `db`, or package name in a monorepo. Prefer the repository's established scope names.

**description** (required) — short, specific summary. As the repository default style, keep it under 50 characters, use imperative mood (`add` not `added`), and omit a trailing period unless the repository uses another convention.

**body** (optional) — begin after one blank line. As the repository default style, wrap at 72 characters and explain motivation or context rather than repeating the description.

**footer** (optional) — issue refs (`Closes #123`), or breaking changes:

- `BREAKING CHANGE: <description>` in footer, or
- append `!` to type/scope: `feat!:` / `feat(api)!:`

## Output Rules

1. Present the message in a code block.
2. When cleaning an existing message or running a commit hook, strip recognized AI signatures with `strip-ai-signature.sh`:
   ```bash
   echo "$MSG" | ./skills/commit-message/strip-ai-signature.sh
   ```
   This removes `Co-Authored-By:` trailer lines naming Claude, Copilot, GPT, Gemini, or Anthropic. Newly drafted messages should contain only relevant trailers supported by the request.

## Examples

```
fix(auth): redirect to login when session token expires

Previously crashed with an unhandled promise rejection. Now
gracefully redirects and clears the stale session data.

Closes #234
```

```
feat(api): add pagination to GET /users endpoint

Refs #189
```

```
feat(db)!: replace Prisma with Drizzle ORM

BREAKING CHANGE: All database query APIs have changed.
See docs/migration-drizzle.md for the migration guide.
```
