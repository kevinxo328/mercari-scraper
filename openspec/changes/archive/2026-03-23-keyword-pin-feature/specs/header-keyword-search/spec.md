## MODIFIED Requirements

### Requirement: Keyword search combobox allows type-to-filter selection from existing options only

The combobox SHALL display a text input that filters available keywords (fetched from `getKeywords`) as the user types. Only keywords selected from the dropdown may be submitted; free-form text that does not match a dropdown selection is not used for navigation.

Keywords SHALL be displayed in the following order: pinned keywords first (sorted alphabetically among themselves), then non-pinned keywords sorted alphabetically. Pinned keywords SHALL show a filled star icon to their left.

#### Scenario: Dropdown opens on focus

- **WHEN** the user clicks or focuses the input
- **THEN** a dropdown appears showing all available keywords with results

#### Scenario: Options filtered by input

- **WHEN** the user types text into the input
- **THEN** the dropdown shows only keywords that contain the typed text (case-insensitive)
- **THEN** the selected keyword is reset to none (typing invalidates prior selection)

#### Scenario: Option selected from dropdown

- **WHEN** the user clicks a keyword option in the dropdown
- **THEN** the input value is set to that keyword, the keyword is marked as selected, and the dropdown closes

#### Scenario: Pinned keywords appear first in dropdown

- **WHEN** the dropdown is open (unfiltered or filtered)
- **THEN** all pinned keywords appear before all non-pinned keywords
- **THEN** within each group, keywords are sorted alphabetically

#### Scenario: Pinned keyword shows star icon

- **WHEN** a keyword with `pinned = true` appears in the dropdown list
- **THEN** a filled star icon is shown to the left of the keyword text
