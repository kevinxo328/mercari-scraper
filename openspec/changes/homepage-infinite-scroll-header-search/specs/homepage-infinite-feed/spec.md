## ADDED Requirements

### Requirement: Homepage displays a unified chronological feed
The homepage SHALL display all scraper results from all keywords in a single grid, ordered by `updatedAt` descending (most recent first), replacing the previous grouped-by-keyword layout.

#### Scenario: Initial load shows latest results
- **WHEN** a user visits the homepage
- **THEN** the page fetches the first page of results via `infiniteResults` with no keyword filter and `orderby: desc`
- **THEN** results are displayed in a responsive grid (2/3/4/6 columns based on viewport width)

#### Scenario: Loading skeleton shown while fetching
- **WHEN** the initial fetch is in progress
- **THEN** skeleton placeholder cards are shown in the grid layout

#### Scenario: Empty state
- **WHEN** no results exist in the database
- **THEN** a "No results found" message is shown

### Requirement: Homepage feed uses virtual list rendering
The homepage feed SHALL use row-level virtualization so only the rows currently visible in the viewport (plus overscan) are present in the DOM.

#### Scenario: DOM rows are limited to visible area
- **WHEN** the user has scrolled past many rows
- **THEN** rows that are far above the viewport are removed from the DOM
- **THEN** the scroll position and total height are maintained correctly

#### Scenario: Row height measurement
- **WHEN** a row is first rendered
- **THEN** its actual rendered height is measured and used for subsequent layout calculations

### Requirement: Homepage feed supports infinite scroll
The homepage SHALL automatically fetch the next page of results as the user scrolls near the bottom of the loaded items.

#### Scenario: Next page fetched near bottom
- **WHEN** the user has scrolled such that the last rendered virtual row is within 3 grid rows of the total loaded item count
- **THEN** `fetchNextPage` is called if `hasNextPage` is true and a fetch is not already in progress

#### Scenario: End of results
- **WHEN** there are no more pages to fetch
- **THEN** no further fetch requests are made

### Requirement: Authenticated users can delete items from the feed
The homepage feed SHALL show a delete button on each card when the user is authenticated, using the existing delete flow.

#### Scenario: Delete button visible when authenticated
- **WHEN** the user is signed in
- **THEN** each result card shows a delete button

#### Scenario: Delete removes item from feed
- **WHEN** the user confirms deletion
- **THEN** the item is removed and the query cache is invalidated
