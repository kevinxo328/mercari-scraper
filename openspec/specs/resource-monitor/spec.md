# Resource Monitor

## Purpose

Monitors RAM and CPU usage during a scraper run by sampling system resources at a fixed interval in a background process, then printing a summary after the run completes.

## Requirements

### Requirement: Background sampling during scraper run
The monitor SHALL start a background child process that samples RAM and CPU usage at a fixed 10-second interval for the duration of the scraper run.

#### Scenario: Sampling starts before scraper tests begin
- **WHEN** Playwright's globalSetup hook executes
- **THEN** a background sampler process is spawned and begins recording samples immediately

#### Scenario: Sampling stops after scraper tests finish
- **WHEN** Playwright's globalTeardown hook executes
- **THEN** the background sampler process is terminated and no further samples are recorded

#### Scenario: Sampler auto-exits if teardown never runs
- **WHEN** the sampler has been running for 30 minutes without being terminated
- **THEN** the sampler process exits on its own

### Requirement: Resource metrics collected per sample
Each sample SHALL record timestamp, available RAM, total RAM, and per-core CPU idle/total ticks using the Node.js `os` module.

#### Scenario: RAM data captured per sample
- **WHEN** a sample is taken
- **THEN** `os.freemem()` and `os.totalmem()` values are recorded in bytes

#### Scenario: CPU data captured per sample
- **WHEN** two consecutive samples are taken
- **THEN** CPU usage percentage is calculated as `(1 - deltaIdle / deltaTotal) * 100` across all cores

### Requirement: Summary output after scraper completes
The monitor SHALL print a resource summary after all samples are collected, including peak RAM usage, average RAM usage, and average CPU percentage.

#### Scenario: Console output on local run
- **WHEN** `GITHUB_STEP_SUMMARY` environment variable is not set
- **THEN** the summary is printed to stdout as a formatted text table

#### Scenario: Step Summary output on GitHub Actions
- **WHEN** `GITHUB_STEP_SUMMARY` environment variable is set to a file path
- **THEN** the summary is appended to that file as a Markdown table
- **THEN** the summary is also printed to stdout

### Requirement: Samples persisted via temp file
Samples SHALL be written to a JSON file in `os.tmpdir()` so that the teardown process (a separate Node.js process) can read them.

#### Scenario: Temp file created on setup
- **WHEN** globalSetup runs
- **THEN** a timestamped temp file path is passed to the sampler process as an argument

#### Scenario: Temp file read on teardown
- **WHEN** globalTeardown runs
- **THEN** the temp file is read, parsed, and used to compute the summary

#### Scenario: Temp file deleted after teardown
- **WHEN** globalTeardown finishes printing the summary
- **THEN** the temp file is deleted from `os.tmpdir()`
