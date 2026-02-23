## Context

The scraper is a Playwright test (`apps/scraper/tests/scraper.spec.ts`) that runs daily via GitHub Actions. After completing, it creates a `ScraperRun` DB record. Currently there is no outbound notification — users must check the web UI or GitHub Actions logs to know the run finished.

## Goals / Non-Goals

**Goals:**
- Send a Slack message on successful scraper completion
- Include new item count and a link to the production site
- Keep the Slack integration fully optional (controlled by env vars)
- Zero new npm dependencies (use native `fetch`)

**Non-Goals:**
- Notify on failure or partial failure
- Support multiple Slack channels or workspaces
- Retry on Slack API errors (failure is silent, not fatal)

## Decisions

### D1: Native `fetch` instead of `@slack/web-api`

The scraper only needs one Slack call (POST to a webhook). Using the official SDK adds ~500 KB of dependencies for minimal benefit. Native `fetch` (available in Node 18+, already used by Playwright's environment) is sufficient.

Alternatives considered:
- `@slack/web-api`: richer types and error handling, but overkill for a single fire-and-forget webhook call

### D2: Incoming Webhook instead of Bot API (`SLACK_WEBHOOK_URL`)

A single Incoming Webhook URL encapsulates the token, channel, and workspace — no need to manage `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` separately. If the var is absent, the helper returns early with no error.

Alternatives considered:
- Bot API (`chat.postMessage`): more flexible (dynamic channel), but requires two separate secrets and a Slack App with scopes

### D3: Non-fatal Slack errors

If the Slack API call fails (network error, invalid token, channel not found), the error is logged to stderr but does not throw. The `ScraperRun` record has already been written to DB — the scraper result should not be invalidated by a notification failure.

### D4: `NEXT_PUBLIC_APP_URL` for production link

The production URL is already a logical env var for the web app. Reusing the same name keeps it consistent. In GitHub Actions it can be added as a secret or a plain env var.

## Risks / Trade-offs

- **Webhook URL leaked in logs** → Mitigation: never log the URL value, only log a generic failure message
- **Slack rate limits** → Mitigation: one message per scraper run (once daily), far below limits
- **Silent failure** → Mitigation: console.error logs the failure reason so it shows in GitHub Actions output

## Migration Plan

1. Add `SLACK_WEBHOOK_URL` and `NEXT_PUBLIC_APP_URL` to repo secrets in GitHub
2. Update GitHub Actions workflow to expose them as env vars
3. Deploy (no DB migration needed)
4. Verify notification in Slack after next scheduled run

Rollback: remove the two secrets — notification silently skips.
