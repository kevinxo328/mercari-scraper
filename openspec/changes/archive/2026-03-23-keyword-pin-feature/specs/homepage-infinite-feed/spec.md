## MODIFIED Requirements

### Requirement: Homepage displays a unified chronological feed of the latest scraper run

The homepage SHALL display only results from the most recent scraper run, ordered so that results associated with at least one pinned keyword appear first, followed by all remaining results. Within each group, results are ordered by `updatedAt` descending.

The "most recent scraper run" is defined as results whose `updatedAt` is greater than or equal to the previous `ScraperRun.completedAt`. This uses the second-to-last run as the lower bound so that results updated during the latest run are captured correctly (the `ScraperRun` record is created after results are upserted). If only one run exists, no date filter is applied.

The two-phase ordering is implemented server-side in `infiniteResults` using a phase-encoded cursor (`"pinned:<uuid>"` or `"regular:<uuid>"`). The homepage client does not need to change its query call signature.

#### Scenario: Initial load shows latest run results with pinned first

- **WHEN** a user visits the homepage and at least one keyword is pinned
- **THEN** results associated with any pinned keyword appear before results with no pinned keyword
- **THEN** within each group results are ordered by `updatedAt` descending

#### Scenario: Initial load with no pinned keywords

- **WHEN** a user visits the homepage and no keywords are pinned
- **THEN** results are displayed in a single group ordered by `updatedAt` descending (identical to pre-pin behavior)

#### Scenario: Only one scraper run exists

- **WHEN** there has been exactly one scraper run
- **THEN** `sinceDate` is null and no date filter is applied, showing all results

#### Scenario: Loading skeleton shown while fetching

- **WHEN** the initial fetch is in progress
- **THEN** skeleton placeholder cards are shown in the grid layout

#### Scenario: Empty state

- **WHEN** no results exist in the database
- **THEN** a "No results found" message is shown
