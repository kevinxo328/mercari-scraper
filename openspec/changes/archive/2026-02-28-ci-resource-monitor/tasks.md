## 1. Background Sampler Process

- [x] 1.1 Create `apps/scraper/global-setup.ts` — spawn sampler child process, pass temp file path as argument, write PID to a second temp file for teardown to use
- [x] 1.2 Create `apps/scraper/sampler.ts` — polling loop using `os.freemem()`, `os.totalmem()`, `os.cpus()` every 10 seconds, appending samples as JSON lines to temp file; auto-exit after 30 minutes

## 2. Teardown and Summary

- [x] 2.1 Create `apps/scraper/global-teardown.ts` — read PID file, kill sampler process, read samples file, compute summary (peak RAM, avg RAM, avg CPU %)
- [x] 2.2 Implement summary output: plain text table to stdout always; additionally append Markdown table to `GITHUB_STEP_SUMMARY` when the env var is set
- [x] 2.3 Delete temp files (samples + PID) after summary is printed

## 3. Playwright Config

- [x] 3.1 Add `globalSetup` and `globalTeardown` entries to `playwright.config.ts` pointing to the new files
