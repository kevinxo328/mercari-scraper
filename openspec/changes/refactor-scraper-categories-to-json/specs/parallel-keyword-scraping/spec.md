## MODIFIED Requirements

### Requirement: Keywords are scraped with bounded concurrency
The scraper SHALL process keywords in parallel batches with a maximum concurrency of 2, where each keyword runs in its own Playwright page instance.

#### Scenario: Multiple keywords run concurrently
- **WHEN** there are N keywords to scrape
- **THEN** at most 2 keywords SHALL be running simultaneously at any time

#### Scenario: All keywords complete regardless of individual failures
- **WHEN** one keyword's page throws an error
- **THEN** the remaining keywords SHALL still be processed and their results saved

### Requirement: Created count is accurately aggregated across concurrent keyword runs
The scraper SHALL correctly total the number of newly created database records across all parallel keyword executions.

#### Scenario: Counts from concurrent keywords are summed
- **WHEN** 2 keywords run in parallel and each creates N new records
- **THEN** the final `createdCount` reported to Slack SHALL equal the sum of all keywords' created counts

## ADDED Requirements

### Requirement: URL construction from direct category codes
The scraper SHALL construct Mercari search URLs using category codes stored directly in the `ScraperKeyword` record.

#### Scenario: Generate URL with multiple categories
- **WHEN** a keyword has `categoryIds` ["5", "72"]
- **THEN** the generated URL SHALL include `category_id=5&72`
