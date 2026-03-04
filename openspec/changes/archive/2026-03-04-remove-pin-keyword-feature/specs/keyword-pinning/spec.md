## REMOVED Requirements

### Requirement: Pin Keyword to Homepage
The system SHALL allow users to pin or unpin specific keywords to be prioritized on the homepage.
**Reason**: The homepage has been refactored to a time-based infinite scroll feed, rendering the pinning logic obsolete.
**Migration**: Users will see the latest updated results from all keywords by default on the homepage.

#### Scenario: User toggles pin status
- **WHEN** user clicks the pin icon in the Keyword Table
- **THEN** the system SHALL NO LONGER update any `isPinned` state and the toggle option SHALL be removed from the UI.

### Requirement: Sort Keywords by Pinned Status
The system SHALL provide an option to sort the keyword management list by pinned status first.
**Reason**: Pinning is no longer a supported feature.
**Migration**: The keyword list SHALL default to `updatedAt: desc` sorting.

#### Scenario: User visits keyword management dashboard
- **WHEN** user views the keyword list
- **THEN** the system SHALL display keywords sorted by their last update time, and the "Pin" column SHALL NOT be present.
