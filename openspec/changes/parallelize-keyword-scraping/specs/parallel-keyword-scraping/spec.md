## ADDED Requirements

### Requirement: Keywords are scraped with bounded concurrency
The scraper SHALL process keywords in parallel batches with a maximum concurrency of 2, where each keyword runs in its own Playwright page instance.

#### Scenario: Multiple keywords run concurrently
- **WHEN** there are N keywords to scrape
- **THEN** at most 2 keywords SHALL be running simultaneously at any time

#### Scenario: All keywords complete regardless of individual failures
- **WHEN** one keyword's page throws an error
- **THEN** the remaining keywords SHALL still be processed and their results saved

### Requirement: Modal detection uses condition-based waiting
The scraper SHALL use `waitForSelector` with a timeout instead of a fixed `waitForTimeout` to detect the modal scrim dialog.

#### Scenario: No modal present
- **WHEN** navigating to a keyword search page that has no modal dialog
- **THEN** the scraper SHALL proceed immediately without waiting the full timeout duration

#### Scenario: Modal present
- **WHEN** navigating to a keyword search page that shows a modal dialog
- **THEN** the scraper SHALL detect and dismiss the modal before proceeding to scrape items

### Requirement: Created count is accurately aggregated across concurrent keyword runs
The scraper SHALL correctly total the number of newly created database records across all parallel keyword executions.

#### Scenario: Counts from concurrent keywords are summed
- **WHEN** 2 keywords run in parallel and each creates N new records
- **THEN** the final `createdCount` reported to Slack SHALL equal the sum of all keywords' created counts
