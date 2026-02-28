## Why

When the Playwright scraper runs on GitHub Actions, resource usage is completely opaque. Chromium is a heavyweight process, and when scrapes fail or slow down, there's no way to determine if RAM exhaustion or CPU saturation is the cause. Local development also lacks a consistent way to observe resource consumption.

## What Changes

- Add `global-setup.ts`: starts a background sampler when the scraper launches, polling RAM and CPU every 10 seconds via Node.js `os` module
- Add `global-teardown.ts`: stops the sampler when the scraper finishes and prints a summary (peak RAM, CPU trend)
- Modify `playwright.config.ts` to register the new globalSetup and globalTeardown
- Output adapts to environment: console table locally, additionally writes Markdown to `GITHUB_STEP_SUMMARY` on GitHub Actions

## Capabilities

### New Capabilities
- `resource-monitor`: Background resource sampling during scraper runs, with environment-aware summary output (console vs GitHub Actions Step Summary)

### Modified Capabilities

## Impact

- `apps/scraper/` — 2 new files (`global-setup.ts`, `global-teardown.ts`), 1 modified file (`playwright.config.ts`)
- No new dependencies — uses only Node.js built-ins (`os`, `fs`)
- No changes to scraper logic or database interactions
