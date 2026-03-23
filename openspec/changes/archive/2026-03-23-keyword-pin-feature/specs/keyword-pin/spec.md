## ADDED Requirements

### Requirement: Authenticated users can toggle pin state on a keyword

The system SHALL expose a `pinKeyword` tRPC mutation (protected, requires authentication) that toggles the `pinned` boolean on a `ScraperKeyword` by its ID. The mutation SHALL be idempotent for the same call direction (pinning an already-pinned keyword is a no-op toggle to unpinned, not an error).

#### Scenario: Pin an unpinned keyword

- **WHEN** an authenticated user calls `pinKeyword` with the ID of a keyword where `pinned = false`
- **THEN** the keyword's `pinned` field is set to `true`
- **THEN** the mutation returns success

#### Scenario: Unpin a pinned keyword

- **WHEN** an authenticated user calls `pinKeyword` with the ID of a keyword where `pinned = true`
- **THEN** the keyword's `pinned` field is set to `false`
- **THEN** the mutation returns success

#### Scenario: Unauthenticated user cannot pin

- **WHEN** an unauthenticated user calls `pinKeyword`
- **THEN** the mutation returns an authentication error

### Requirement: Dashboard keyword table shows a dedicated Pin column

The dashboard keyword table SHALL display a Pin column (second column, after Keyword) containing an icon button that reflects and controls the pin state of each keyword row.

#### Scenario: Unpinned keyword shows outline star

- **WHEN** a keyword has `pinned = false`
- **THEN** the Pin column shows an outline star icon button

#### Scenario: Pinned keyword shows filled star

- **WHEN** a keyword has `pinned = true`
- **THEN** the Pin column shows a filled star icon button

#### Scenario: Clicking pin button toggles state optimistically

- **WHEN** the user clicks the star icon button on a keyword row
- **THEN** the icon switches immediately (optimistic update) without waiting for server response
- **THEN** `pinKeyword` mutation is called with that keyword's ID
- **THEN** on mutation failure, the icon reverts to its previous state

### Requirement: `getKeywords` includes `pinned` field in its response

The `getKeywords` tRPC query SHALL include `pinned: boolean` in each keyword object it returns.

#### Scenario: pinned field returned for all keywords

- **WHEN** `getKeywords` is called
- **THEN** each keyword in the `data` array includes a `pinned` boolean field
