---
name: commit-message
description: >-
  Write high-quality Git commit messages following the Conventional Commits specification.
  Use this skill whenever the user provides a git diff, describes code changes, or asks
  for help writing a commit message. Triggers include: write a commit, commit message,
  git commit, how do I commit this, what should my commit say, or when the user pastes
  a diff or describes what they changed. Always use this skill proactively, even if the
  user just describes what they changed without explicitly asking for a commit message.
metadata:
  version: "1.0.0"
---

# Commit Message Skill

Write commit messages following Conventional Commits v1.0.0. Always capture **What** changed and **Why** — not just a summary of the diff.

## Format

```
<type>[optional scope]: <subject>

[optional body]

[optional footer(s)]
```

**type** (required):

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

**scope** (optional) — area affected, e.g. `auth`, `api`, `db`, or package name in a monorepo.

**subject** (required) — max 50 chars, imperative mood (`add` not `added`), no trailing period.

**body** (optional) — blank line after subject, wrap at 72 chars. Explain _why_, not just what.

**footer** (optional) — issue refs (`Closes #123`), or breaking changes:

- `BREAKING CHANGE: <description>` in footer, or
- append `!` to type/scope: `feat!:` / `feat(api)!:`

## Output Rules

1. Always output a ready-to-copy message in a code block.
2. If context is insufficient, produce a best-guess then ask for adjustments.
3. If changes cover unrelated concerns, flag it and suggest splitting into separate commits.

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
