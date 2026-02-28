## 1. Refactor Keyword Loop to Parallel Batches

- [x] 1.1 Extract per-keyword scraping logic into a standalone async function `scrapeKeyword(page, record, codeMap)` that returns `createdCount`
- [x] 1.2 Implement a batch helper that processes an array of keywords with max concurrency 2 using `Promise.all`
- [x] 1.3 Replace the existing `for` loop in the test with the batched parallel execution
- [x] 1.4 Aggregate `createdCount` by summing results returned from each `scrapeKeyword` call

## 2. Fix Modal Waiting Logic

- [x] 2.1 Replace `page.waitForTimeout(3000)` with `page.waitForSelector('[data-testid="merModalBaseScrim"]', { timeout: 3000 }).catch(() => {})`
- [x] 2.2 Remove the subsequent `page.waitForTimeout(1000)` after modal dismissal (rely on click settling naturally or use `waitForLoadState`)

## 3. Validate and Test

- [x] 3.1 Run scraper locally with `pnpm run scraper` and confirm all keywords complete successfully
- [ ] 3.2 Trigger `workflow_dispatch` on CI and record the new execution time
- [ ] 3.3 Confirm Slack notification reports the correct `createdCount`
