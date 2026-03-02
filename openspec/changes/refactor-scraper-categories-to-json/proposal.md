## Why

The current scraper relies on a database-driven category system that uses internal UUIDs to map to Mercari's category codes. This introduces unnecessary database queries, makes it difficult to maintain category-to-English translations, and complicates the sharing of category data between the scraper and the web application. Moving to a static JSON-based category system improves performance, simplifies the schema, and enables easy updates via automated scraping.

## What Changes

- **BREAKING**: Remove `KeywordCategory` model from Prisma schema.
- **BREAKING**: Change `ScraperKeyword.categoryIds` from `UUID[]` to `String[]` (storing Mercari category codes directly).
- Create a centralized static JSON file containing all Mercari categories with Japanese and English names.
- Implement an automated script to scrape the latest categories and translations from Mercari.
- Update `getMercariUrl` and scraper logic to use the static JSON data instead of database queries.
- Update the web application's category selection UI to use the shared static JSON.

## Capabilities

### New Capabilities
- `mercari-category-sync`: Automated scraping and translation of Mercari categories into a static JSON asset.
- `static-category-resolution`: Resolving category names and structure from static JSON instead of database queries.

### Modified Capabilities
- `parallel-keyword-scraping`: Update URL construction logic to use direct category codes from the database and names from the static JSON.

## Impact

- **Database**: Significant schema changes (removal of one table, type change in another). Requires data migration of existing category UUIDs to codes.
- **Apps**: `apps/scraper` and `apps/web` will now depend on a shared static JSON asset in `packages/database`.
- **Dependencies**: No new external runtime dependencies, but `playwright` will be used in a new maintenance script.
