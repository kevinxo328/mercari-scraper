## ADDED Requirements

### Requirement: Notify Slack on successful scraper completion
After a scraper run completes successfully, the system SHALL send a Slack message if `SLACK_WEBHOOK_URL` environment variable is present.

#### Scenario: Notification sent when webhook URL is configured
- **WHEN** the scraper finishes and `SLACK_WEBHOOK_URL` is set
- **THEN** a message is POSTed to the webhook URL containing the count of newly created items and a link constructed from `NEXT_PUBLIC_APP_URL`

#### Scenario: Notification silently skipped when webhook URL is absent
- **WHEN** `SLACK_WEBHOOK_URL` is not set
- **THEN** no HTTP call is made and the scraper exits normally without error

### Requirement: Notification content
The Slack message SHALL include the count of newly created `ScraperResult` records from the current run and a clickable link to the production site.

#### Scenario: Message includes item count
- **WHEN** the notification is sent
- **THEN** the message text contains the `createdCount` value (e.g., "42 new items found")

#### Scenario: Message includes production URL
- **WHEN** `NEXT_PUBLIC_APP_URL` is set
- **THEN** the message includes a link using that URL

#### Scenario: Message omits link when URL is not set
- **WHEN** `NEXT_PUBLIC_APP_URL` is not set
- **THEN** the message is still sent without a link

### Requirement: Non-fatal Slack errors
A failure in the Slack notification (network error, invalid token, bad channel) SHALL NOT cause the scraper process to exit with a non-zero code or prevent the `ScraperRun` record from being written.

#### Scenario: Slack API error is logged but not thrown
- **WHEN** the Slack API returns an error or the request fails
- **THEN** the error is logged to stderr and the scraper exits successfully
