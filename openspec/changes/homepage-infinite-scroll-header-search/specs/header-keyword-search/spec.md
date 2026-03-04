## ADDED Requirements

### Requirement: Header shows a keyword search combobox on non-search pages
The app header SHALL render a keyword search combobox centered between the logo and the avatar/login area, with a maximum width of 500px, on all pages except `/search`.

#### Scenario: Combobox visible on homepage
- **WHEN** the user is on the homepage (`/`)
- **THEN** the keyword search combobox is visible in the header

#### Scenario: Combobox hidden on search page
- **WHEN** the current pathname is `/search`
- **THEN** the keyword search combobox is not rendered

### Requirement: Keyword search combobox allows type-to-filter selection
The combobox SHALL display a text input that filters available keywords (fetched from `getKeywords`) as the user types, showing matching options in a dropdown.

#### Scenario: Dropdown opens on focus
- **WHEN** the user clicks or focuses the input
- **THEN** a dropdown appears showing all available keywords with results

#### Scenario: Options filtered by input
- **WHEN** the user types text into the input
- **THEN** the dropdown shows only keywords that contain the typed text (case-insensitive)

#### Scenario: Option selected from dropdown
- **WHEN** the user clicks a keyword option in the dropdown
- **THEN** the input value is set to that keyword and the dropdown closes

### Requirement: Keyword search navigates to search page
The combobox SHALL navigate to `/search?keywords=<value>` when the user submits, or to `/search` when the input is empty.

#### Scenario: Navigate with keyword via Enter key
- **WHEN** the user has typed or selected a keyword and presses Enter
- **THEN** the browser navigates to `/search?keywords=<encoded-keyword>`

#### Scenario: Navigate with keyword via magnifying glass button
- **WHEN** the user clicks the magnifying glass (🔍) button
- **THEN** the browser navigates to `/search?keywords=<encoded-keyword>` if input is non-empty, or `/search` if empty

#### Scenario: Navigate to all results when input is empty
- **WHEN** the user presses Enter or clicks the magnifying glass with an empty input
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
