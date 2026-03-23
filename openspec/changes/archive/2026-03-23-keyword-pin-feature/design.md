## Context

The app currently sorts scraper results purely by `updatedAt desc` on both the homepage and in keyword dropdowns. There is no way to elevate specific keywords so their results appear first. The `infiniteResults` tRPC endpoint uses cursor-based pagination with a single `id`-based cursor. `ScraperKeyword` and `ScraperResult` share a many-to-many relation via an implicit Prisma join table.

## Goals / Non-Goals

**Goals:**
- Persist pin state per keyword in the database
- Surface pinned-keyword results at the top of the homepage feed
- Sort pinned keywords first in all keyword dropdowns
- Allow authenticated admins to toggle pin state from the dashboard

**Non-Goals:**
- Custom ordering among pinned keywords (pin is binary, not ranked)
- Per-user pin state (pin is global, shared across all sessions)
- Pinning individual results (only keywords can be pinned)

## Decisions

### D1: Store pin state as `pinned Boolean @default(false)` on `ScraperKeyword`

Simplest schema change. A boolean is sufficient; there is no need to track when a keyword was pinned. An integer rank field was rejected as over-engineering for a binary toggle.

### D2: Two-phase cursor strategy for `infiniteResults`

Prisma's `orderBy` on relation aggregates only supports `_count`, not `_max`/`_min` on boolean fields (verified against Prisma docs and GitHub issue #8190). Raw SQL was also rejected to preserve type safety and ORM consistency.

The two-phase approach:
- **Phase 1 (pinned)**: `WHERE keywords.some.pinned = true ORDER BY updatedAt DESC`
- **Phase 2 (regular)**: `WHERE keywords.none.pinned = true ORDER BY updatedAt DESC`

Cursor is encoded as `"pinned:<uuid>"` or `"regular:<uuid>"`. On first request (no cursor), phase 1 starts. When phase 1 is exhausted within a single page response, the remainder of the limit is filled from phase 2 and the cursor switches to `"regular:<uuid>"`. Subsequent requests with a `regular:` cursor skip phase 1 entirely.

If no keywords are pinned, phase 1 returns 0 results and the query falls through to phase 2 immediately — identical to current behavior.

### D3: Client-side sort for keyword dropdowns

The `KeywordSearch` and `ScraperSearchForm` components already fetch all keywords client-side (up to 100). Sorting pinned-first then alphabetically in the component avoids a new server-side sort parameter and keeps the tRPC contract stable.

### D4: Optimistic update for pin toggle in KeywordTable

The pin button in the dashboard table uses a `useMutation` optimistic update: the star icon toggles immediately in the UI and rolls back on error. This avoids a visible delay since the table re-fetches on success anyway.

## Risks / Trade-offs

- **Two DB queries per `infiniteResults` page (during pinned phase transition)**: Only occurs on the page where the pinned results are exhausted. Acceptable given typical pin count (1–5 keywords).
- **Cursor encodes phase, not a stable sort key**: If the set of pinned keywords changes mid-scroll, a user could see duplicate or missing results at the phase boundary. Acceptable edge case for this use pattern.
- **`keywords.none.pinned = true` excludes results with no keyword associations**: Results with zero keywords are treated as "regular". This is correct behavior.

## Migration Plan

1. Run `prisma migrate dev` to add `pinned Boolean @default(false)` — non-breaking, all existing rows default to `false`
2. Deploy new tRPC endpoints and updated frontend
3. No rollback concerns: removing the column later requires another migration, but the boolean field has no destructive side effects
