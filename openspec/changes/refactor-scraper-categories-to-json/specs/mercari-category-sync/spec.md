## ADDED Requirements

### Requirement: Automated category scraping
The system SHALL provide a script to scrape all top-level, sub-, and sub-sub categories from Mercari's category index.

#### Scenario: Script successfully crawls all levels
- **WHEN** the category sync script is executed
- **THEN** it SHALL visit https://jp.mercari.com/categories and navigate through all hierarchical levels

### Requirement: English translation generation
The system SHALL automatically generate English translations for every scraped Japanese category name.

#### Scenario: Translation is included in output
- **WHEN** a Japanese category name is scraped
- **THEN** an English `enName` SHALL be generated and stored alongside the original Japanese name

### Requirement: Static JSON asset generation
The scraped and translated category data SHALL be saved as a static JSON file in `packages/database`.

#### Scenario: JSON file structure is valid
- **WHEN** the sync script completes
- **THEN** `packages/database/src/data/mercari-categories.json` SHALL exist and contain a hierarchical and a flat map of all categories
