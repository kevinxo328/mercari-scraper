## Context

The scraper runs a single Playwright test that iterates over all keywords sequentially using one shared `page` object. GitHub Actions `ubuntu-latest` runners are in the US, causing ~120-150ms RTT to `jp.mercari.com` vs ~30-50ms locally. With 10 keywords running sequentially, this compounds to a 5x total slowdown. The runner has 2 CPU cores, which sets a practical upper bound on concurrency.

Current flow:
```
for keyword of keywords:
  page.goto(mercariUrl)
  waitForTimeout(3000)   ← fixed delay
  scrapeItems()
  dbUpsert()             ← N+1 queries
```

## Goals / Non-Goals

**Goals:**
- Reduce CI execution time from ~10 min to ~5 min
- Process 2 keywords concurrently, each with its own `page` instance
- Replace fixed `waitForTimeout` with condition-based waiting

**Non-Goals:**
- Changing the database schema or adding batched DB writes
- Modifying the GitHub Actions workflow YAML
- Increasing concurrency beyond 2 (constrained by 2-core CI runner)
- Handling Mercari rate-limiting (not currently an issue)

## Decisions

### D1: Promise.all with manual batching over Playwright workers

**Decision**: Use `Promise.all` with a concurrency limiter inside the existing single `test()`, rather than splitting into multiple test cases and increasing `workers`.

**Rationale**: Splitting into `test.each` would require extracting shared state (`codeMap`, `createdCount`) and restructuring `beforeAll`/`afterAll` hooks significantly. Manual batching achieves the same parallelism with minimal restructuring. The `workers: 1` CI config can remain unchanged.

**Alternative considered**: `test.each` per keyword + `workers: 2` — cleaner long-term but larger refactor scope.

### D2: Concurrency = 2

**Decision**: Run at most 2 keywords in parallel.

**Rationale**: GitHub Actions free tier provides 2 CPU cores. Each Chromium instance is CPU-bound during page rendering. Running 3+ instances would cause CPU contention and likely slow things down. Two workers maps directly to available cores.

### D3: Replace `waitForTimeout(3000)` with `waitForSelector` + timeout catch

**Decision**: Instead of unconditionally waiting 3 seconds, attempt to detect the modal scrim with a short timeout and skip if absent.

**Rationale**: The 3s wait is a workaround for an uncertain modal presence. With `waitForSelector({ timeout: 3000 })`, the code proceeds immediately if the modal is absent, and still handles it if present. Saves ~3s per keyword where no modal appears.

## Risks / Trade-offs

- **Mercari rate limiting**: Two concurrent requests may increase detection risk. → Mitigation: start at concurrency=2 and monitor; can reduce to 1 if issues arise.
- **Shared `createdCount`**: Counter is shared across concurrent keyword handlers. → Mitigation: use atomic increment pattern or sum results after `Promise.all` resolves.
- **Flakier error handling**: If one keyword's page throws, it should not cancel other in-flight keywords. → Mitigation: wrap each keyword handler in try/catch and collect errors.

## Migration Plan

1. Implement batched parallel scraping in `scraper.spec.ts`
2. Test locally with `pnpm run scraper`
3. Trigger `workflow_dispatch` on CI to measure actual time improvement
4. If time doesn't improve or errors occur, revert to sequential for loop (trivial rollback)
