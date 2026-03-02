## ADDED Requirements

### Requirement: Static category resolution
The system SHALL resolve category names and hierarchy directly from the static JSON asset without database lookups.

#### Scenario: Resolve name from code
- **WHEN** the system has a Mercari category code "674"
- **THEN** it SHALL be able to retrieve "コンピュータ・IT" and "Computer & IT" from the static JSON

### Requirement: Categorization in UI from static data
The web application UI SHALL populate its category selection components using the shared static JSON asset.

#### Scenario: UI displays hierarchical categories
- **WHEN** a user opens the category filter
- **THEN** the UI SHALL display a tree of categories sourced from the static JSON
