---
name: write-changelog
version: 1.0.0
description: Generate a user-facing changelog entry from git commits since the last tag. Use when releasing a new version and writing CHANGELOG.md.
allowed-tools:
  - Read
  - Glob
---

You are writing a user-facing changelog entry for a macOS manga translation app. Your job is to turn git commit messages into plain-language release notes that tell users what's new, what's fixed, and what's improved — without any technical details.

## Step 1: Ask for version number

Ask the user: "What version number is this release? (e.g. v1.2.0)"

If the user provides an increment like `0.0.1` or `+0.0.1`, compute the next version by applying it to the latest tag. For example: latest tag `v1.1.7` + increment `0.0.1` = `v1.1.8`.

## Step 2: Gather commits

Run the following to find commits since the last tag:

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

If no tag exists yet, use:

```bash
git log --oneline
```

## Step 3: Categorize commits

Ignore these commit types entirely — they are not user-facing:

- `docs:` — documentation, changelogs, specs, openspec artifacts
- `refactor:` — internal code restructuring
- `chore:` / `ci:` / `test:` — maintenance

Map the remaining commits to changelog sections. **Do not map by commit prefix alone** — `feat:` commits often describe enhancements to existing features, which belong under Improvements, not New Features.

Decide by user perception:

- **New Features** — The user could not do this at all before. A standalone new capability you could headline in release notes. Test: can you say "you can now X" where X is genuinely new? Examples: Glossary, batch translation, update checker.
- **Improvements** — An existing flow is now faster, more accurate, smoother, or clearer. The user was already doing this; the experience got better. Test: you can only say "X is now faster / better / clearer." Examples: OCR accuracy gains, speed-ups, shortcut tweaks, clearer error messages, layout polish.
- **Bug Fixes** — Something was broken and now works.

Quick mapping:

| Commit prefix | Default section | Override when...                                |
| ------------- | --------------- | ----------------------------------------------- |
| `feat:`       | New Features    | …it enhances an existing feature → Improvements |
| `fix:`        | Bug Fixes       | —                                               |
| `perf:`       | Improvements    | —                                               |

## Step 4: Write user-facing descriptions

For each relevant commit, rewrite it from the user's perspective. Follow these rules:

**Tone and language:**

- Write for a non-technical user
- Use plain, friendly, conversational English
- Describe what the user can now do, or what problem is solved
- Never mention code, APIs, refactors, data models, placeholders, or internal system names
- Never use jargon like "UUID", "model", "service", "handler", "tag preservation", etc.

**Format rules:**

- **New Features**: Use `**Feature Name** — one sentence describing the user benefit`
- **Bug Fixes**: Use `- Fixed [what was broken] [in what situation]`
- **Improvements**: Use `- [What changed] so that [user benefit]`

**Examples of good rewrites:**

| Raw commit                                                  | User-facing text                                                                                                                                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat: add glossary system and cross-page context`          | `**Glossary** — Pin your preferred translations for character names, places, and terms. The translator will follow your glossary consistently across every page.` |
| `fix: use UUID for bubble highlight tracking`               | `Fixed bubble numbering showing duplicate numbers in some cases`                                                                                                  |
| `feat: check for updates on app focus with 1-hour cooldown` | `App now checks for updates when you switch back to it, so you'll discover new versions faster`                                                                   |
| `fix: make ⌘O work when an image is already open`           | `Fixed ⌘O not working when an image is already open`                                                                                                              |

**Multiple commits about the same feature** should be merged into one entry.

## Step 5: Format the changelog block

Use today's date. Format:

```markdown
## v<VERSION> (<YYYY-MM-DD>)

### New Features

- **Feature Name** — Description of user benefit.
- **Another Feature** — Description.

### Bug Fixes

- Fixed something that was broken.

### Improvements

- Some improvement so users get a benefit.
```

Only include sections that have entries. If there are no bug fixes, omit the `### Bug Fixes` section entirely.

## Step 6: Prepend to CHANGELOG.md

Insert the new block at the top of CHANGELOG.md, just below the `# Changelog` heading, with a blank line before the next existing entry.

Show the user the new entry and say: "Added to CHANGELOG.md. Review and edit if needed."

## Step 7: Commit and tag

Run in this exact order:

1. `git add CHANGELOG.md && git commit -m "docs: add changelog entry for v<VERSION>"`
2. `git tag v<VERSION>`

Then ask the user: "Push to remote? (`git push && git push origin v<VERSION>`)"
