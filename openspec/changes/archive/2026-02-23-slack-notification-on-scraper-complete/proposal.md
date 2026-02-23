## Why

After the scraper runs daily, there's no proactive way to know it completed successfully or how many new items were found. A Slack notification on completion gives immediate visibility without having to check the web UI or GitHub Actions logs.

## What Changes

- Add optional Slack notification sent at the end of a successful scraper run
- Notification includes the count of newly created items and a link to the production site
- Notification is gated on `SLACK_WEBHOOK_URL` environment variable — if absent, scraping proceeds silently as before
- Add `NEXT_PUBLIC_APP_URL` env var to supply the production link in the message
- Update `.env.example` with the two new optional variables
- Update GitHub Actions workflow to pass the secrets to the scraper job

## Capabilities

### New Capabilities

- `slack-scraper-notification`: Send a Slack message via Incoming Webhook after a successful scraper run, including new item count and production URL

### Modified Capabilities

<!-- none -->

## Impact

- `apps/scraper/tests/scraper.spec.ts` — call notification helper after `ScraperRun` is created
- `apps/scraper/lib/slack.ts` — new utility (fetch-based, no extra dependency)
- `apps/scraper/.env.example` (and root `.env.example`) — document `SLACK_WEBHOOK_URL`, `NEXT_PUBLIC_APP_URL`
- `.github/workflows/scraper.yml` — add two env vars read from GitHub secrets
