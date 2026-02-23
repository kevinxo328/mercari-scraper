## 1. Slack Utility

- [x] 1.1 Create `apps/scraper/lib/slack.ts` with a `notifySlack({ createdCount, appUrl })` function that POSTs to `SLACK_WEBHOOK_URL` via native `fetch`, returns early if `SLACK_WEBHOOK_URL` is missing, and catches errors with `console.error`

## 2. Scraper Integration

- [x] 2.1 Import and call `notifySlack` in `apps/scraper/tests/scraper.spec.ts` after `prisma.scraperRun.create`, passing `createdCount` and `process.env.NEXT_PUBLIC_APP_URL`

## 3. Environment Configuration

- [x] 3.1 Add `SLACK_WEBHOOK_URL` and `NEXT_PUBLIC_APP_URL` (both optional) to `.env.example` with comments explaining their purpose
- [x] 3.2 Update `.github/workflows/scraper.yml` to expose `SLACK_WEBHOOK_URL` and `NEXT_PUBLIC_APP_URL` from GitHub secrets as environment variables in the scraper job
