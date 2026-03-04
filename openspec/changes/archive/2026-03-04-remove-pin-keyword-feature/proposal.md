# Proposal: remove-pin-keyword-feature

## Problem
The "Pin to Homepage" feature was originally designed to prioritize certain keyword search results on the homepage. However, the homepage has since been refactored to an infinite-scroll feed based on time (`updatedSince`), rendering the `isPinned` logic obsolete. Currently, the "Pin" feature only serves as a secondary sorting layer in the Keyword Management dashboard, which adds unnecessary complexity to the database schema, API logic, and UI forms.

## Proposed Change
Remove the `isPinned` field and all associated logic from the codebase to simplify the system architecture and improve maintainability.

### Scope
- **Database**: Remove `isPinned` column from `ScraperKeyword` table.
- **Backend (tRPC)**: 
    - Remove `togglePinKeyword` mutation.
    - Remove `pinnedFirst` logic from `getKeywords` query.
    - Remove `isPinned` inputs from `createKeyword` and `updateKeyword`.
- **Frontend (UI)**:
    - Remove "Pin" column from the Keyword Table.
    - Remove "Pin to Homepage" checkbox from the Add/Edit Keyword dialog.
    - Update form schemas and mock data.

## Implementation Plan
1. **Phase 1: Database Migration**
    - Remove `isPinned` from `schema.prisma` and generate migration.
2. **Phase 2: Backend Cleanup**
    - Update `scraperRouter` to remove pinning-related inputs and procedures.
3. **Phase 3: UI & Type Updates**
    - Remove pinning-related UI components and update `ScraperKeyword` types.
4. **Phase 4: Test & Validation**
    - Update Jest tests and verify dashboard sorting logic.

## Risks & Considerations
- **Sorting Default**: After removing `pinnedFirst`, the default sorting for keywords should be consistently `updatedAt: desc` to ensure users see relevant keywords first.
- **Backward Compatibility**: Since this is a internal-use tool, database column removal is safe without a complex deprecation phase.
