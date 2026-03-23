# Capability: Header Keyword Search

## Purpose

The app header exposes a keyword search combobox that allows users to filter-select from existing keywords and navigate to the search page.

## Requirements

### Requirement: Header shows a keyword search combobox on non-search pages

The app header SHALL render a keyword search combobox centered between the logo and the avatar/login area, with a maximum width of 500px, on all pages except `/search`.

#### Scenario: Combobox visible on homepage

- **WHEN** the user is on the homepage (`/`)
- **THEN** the keyword search combobox is visible in the header

#### Scenario: Combobox hidden on search page

- **WHEN** the current pathname is `/search`
- **THEN** the keyword search combobox is not rendered

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

### Requirement: Keyword search navigates to search page using selected option only

The combobox SHALL navigate to `/search?keywords=<selected>` when the user submits with a selected keyword, or to `/search` when no keyword is selected.

#### Scenario: Navigate with selected keyword via Enter key

- **WHEN** the user has selected a keyword from the dropdown and presses Enter
- **THEN** the browser navigates to `/search?keywords=<encoded-keyword>`

#### Scenario: Navigate with selected keyword via magnifying glass button

- **WHEN** the user clicks the magnifying glass (🔍) button with a selected keyword
- **THEN** the browser navigates to `/search?keywords=<encoded-keyword>`

#### Scenario: Navigate to all results when no keyword is selected

- **WHEN** the user presses Enter or clicks the magnifying glass without having selected a keyword from the dropdown
- **THEN** the browser navigates to `/search`

### Requirement: Combobox input can be cleared

The combobox SHALL show a clear (×) button when the input has a value, allowing the user to reset the input to empty.

#### Scenario: Clear button visible when input has value

- **WHEN** the input contains text
- **THEN** a × button is shown inside the input area

#### Scenario: Clear button resets input

- **WHEN** the user clicks the × button
- **THEN** the input value is cleared and the × button disappears

#### Scenario: Clear button not shown when input is empty

- **WHEN** the input is empty
- **THEN** no × button is shown
