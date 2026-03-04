## Context

The `isPinned` feature is currently used as a sorting layer in the Keyword Management dashboard, but it has no functional purpose on the homepage anymore. This design outlines the systematic removal of this field across the database, tRPC router, and React UI.

## Goals / Non-Goals

**Goals:**
- Completely eliminate `isPinned` from the database schema and application code.
- Ensure the Keyword Table defaults to a sensible sorting order (`updatedAt: desc`) after removal.
- Clean up unused tRPC procedures and frontend components.

**Non-Goals:**
- Implementing a new sorting feature.
- Changing any scraping logic (as `isPinned` is not used in `apps/scraper`).

## Decisions

### 1. Unified Default Sorting
**Decision:** All keyword-related queries will default to `updatedAt: desc` order.
**Rationale:** Since pinning is no longer an option, sorting by most recently updated keywords provides the best user experience in the management dashboard.

### 2. Immediate Database Column Removal
**Decision:** Use `prisma migrate dev` to drop the column immediately.
**Rationale:** This is a private, internal-use application with a single deployment environment. We do not need a multi-phase deprecation (e.g., `ignore` -> `drop`) for database migrations.

### 3. Cleanup of Mock Data and Tests
**Decision:** All faker-based mocks and existing Jest snapshots will be updated to reflect the new `ScraperKeyword` schema.
**Rationale:** This ensures CI/CD pipelines remain green and accurately reflect the current data model.

## Risks / Trade-offs

- **[Risk] Data Loss**: Dropping the `isPinned` column is irreversible without a database backup.
- **[Mitigation]**: This column is purely metadata for sorting and its value is no longer critical for any application logic.
- **[Risk] Broken UI**: Existing UI components might expect `isPinned` in the data object returned by tRPC.
- **[Mitigation]**: The removal will be done top-down, starting from the types and schema, ensuring TypeScript flags all broken references.
