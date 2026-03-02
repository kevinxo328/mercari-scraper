## Context

The system currently uses a PostgreSQL table `KeywordCategory` to store Mercari categories. This table maps internal UUIDs to Mercari's numeric category codes. Scraper keywords reference these UUIDs. This architecture is suboptimal because categories are essentially static reference data that change rarely and are best managed as a versioned code asset.

## Goals / Non-Goals

**Goals:**
- Decouple category metadata from the database.
- Store categories in a shared static JSON file with EN/JP translations.
- Migrate existing `ScraperKeyword.categoryIds` from UUIDs to direct Mercari codes.
- Provide a maintenance script for updating categories.

**Non-Goals:**
- Implementing a real-time translation proxy (translations are pre-generated).
- Supporting custom user-defined categories (only Mercari official categories are supported).

## Decisions

### 1. Static JSON Structure
**Decision:** Use a combined "Tree + Map" structure in a single JSON file.
**Rationale:** The tree is efficient for UI rendering (category pickers), while the map (by code) allows O(1) lookups for the scraper and detail views.
**Alternatives Considered:** Two separate files (Map and Tree). Rejected to simplify asset management and ensure they never get out of sync.

### 2. Migration of Existing Data
**Decision:** A one-time migration script will map existing UUIDs to codes and update the `ScraperKeyword` records.
**Rationale:** Since we are removing the `KeywordCategory` table, we must translate existing references to ensure current scraper keywords continue to work.

### 3. Automated Translation
**Decision:** Use LLM-based translation during the scraping process to generate `enName`.
**Rationale:** Provides high-quality translations for domain-specific categories (e.g., Japanese-specific fashion or collectibles) that generic translation APIs might miss.

### 4. Shared Package Asset
**Decision:** Place the JSON in `packages/database/src/data` and export it via the package index.
**Rationale:** Both `apps/scraper` and `apps/web` already depend on `@repo/database`, making it the natural location for shared data schemas and assets.

## Risks / Trade-offs

- **[Risk] Category ID collision** → [Mitigation] Mercari's IDs are unique strings (numeric codes), but we will treat them as strings to avoid any precision or formatting issues.
- **[Risk] Scraper failure due to missing category in JSON** → [Mitigation] The scraper will fall back to using the code directly even if it's missing from the JSON metadata.
- **[Risk] Large JSON file size** → [Mitigation] The total number of categories is estimated to be < 2000, which results in a JSON file < 500KB, acceptable for both server-side and client-side usage.

## Migration Plan

1. **Phase 1: Extraction**: Run a script to generate the JSON from current DB + new scrape.
2. **Phase 2: Transition**: Add `categoryCodes` column to `ScraperKeyword` (temporary).
3. **Phase 3: Migration**: Script to populate `categoryCodes` from UUIDs.
4. **Phase 4: Cleanup**: Update Prisma schema to remove `KeywordCategory` and rename `categoryCodes` to `categoryIds` (String[]).
