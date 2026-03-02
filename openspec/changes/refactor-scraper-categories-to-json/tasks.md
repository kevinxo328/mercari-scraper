## 1. Static Category Asset Generation

- [ ] 1.1 Implement `apps/scraper/scripts/generate-categories.ts` script to crawl Mercari's categories.
- [ ] 1.2 Implement hierarchical and flat-map JSON structure in the script.
- [ ] 1.3 Add English translation logic to the sync script.
- [ ] 1.4 Generate `packages/database/src/data/mercari-categories.json`.

## 2. Shared Data Export

- [ ] 2.1 Export the generated JSON and its types from `@repo/database`.
- [ ] 2.2 Update `packages/database/package.json` to include the new data file in the build.

## 3. Database Migration

- [ ] 3.1 Create a backup of existing `KeywordCategory` table and `ScraperKeyword` records.
- [ ] 3.2 Add temporary `categoryCodes` field to `ScraperKeyword` in Prisma schema.
- [ ] 3.3 Create a migration script to map existing UUIDs to Mercari codes for each keyword.
- [ ] 3.4 Execute data migration script to populate `categoryCodes`.
- [ ] 3.5 Update Prisma schema: remove `KeywordCategory` and rename `categoryCodes` back to `categoryIds` (String[]).

## 4. Scraper Logic Update

- [ ] 4.1 Update `getMercariUrl` in `apps/scraper/lib/utils.ts` to use codes directly.
- [ ] 4.2 Update `apps/scraper/tests/scraper.spec.ts` to resolve category names from the static JSON instead of DB.
- [ ] 4.3 Verify scraper URL generation with unit tests.

## 5. UI Integration

- [ ] 5.1 Update category selector in `apps/web` to use the shared static JSON.
- [ ] 5.2 Ensure category tree displays translated English names based on user preference.

## 6. Cleanup

- [ ] 6.1 Remove unused Prisma client queries for categories.
- [ ] 6.2 Delete temporary migration scripts.
