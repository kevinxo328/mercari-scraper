## Context

The scraper runs as a Playwright test suite (`tests/scraper.spec.ts`) with no existing global lifecycle hooks. It runs locally via `pnpm scraper` and in GitHub Actions via `ubuntu-latest`. No monitoring currently exists — resource consumption is invisible in both environments.

Playwright supports `globalSetup` and `globalTeardown` hooks in `playwright.config.ts`, which run once before and after the entire test suite. These are the natural integration points for cross-cutting concerns like resource monitoring.

## Goals / Non-Goals

**Goals:**
- Sample RAM and CPU usage throughout the full scraper run
- Output a readable summary after each run
- Work identically on macOS (local) and Linux (GitHub Actions) without configuration
- Display richer output in GitHub Actions Step Summary when available

**Non-Goals:**
- Per-keyword or per-test resource breakdowns
- Persistent storage of metrics across runs
- Alerting or thresholds (no failure on high usage)
- Windows support

## Decisions

### Use Playwright `globalSetup` / `globalTeardown` (vs. `beforeAll` / `afterAll`)

`globalSetup` runs once per process, before any test worker spawns. `beforeAll` runs per worker. Since monitoring should track total process-level resources (not per-worker), `globalSetup`/`globalTeardown` is correct.

Alternatives considered:
- **Inline in `scraper.spec.ts`**: Mixes monitoring with scraper logic, harder to disable or extract.
- **Separate shell wrapper script**: Requires platform-specific commands (`free` on Linux, `vm_stat` on macOS). Fragile.

### Use Node.js `os` module (vs. shell commands or third-party packages)

`os.freemem()`, `os.totalmem()`, `os.cpus()` are built-in, cross-platform, and zero-dependency. CPU % requires two samples and a diff of `idle` vs `total` ticks — straightforward to implement.

Alternatives considered:
- **`pidusage` / `systeminformation` npm packages**: Additional dependency for functionality we can implement in ~30 lines.
- **Shell commands (`free`, `top`, `vm_stat`)**: Not cross-platform between macOS and Linux.

### Store sampler state in a temp file (vs. in-memory / IPC)

Playwright runs `globalSetup` and `globalTeardown` as separate Node.js processes. In-memory state is not shared between them. The sampler must be a persistent background process, or state must be passed via file or environment.

Decision: the sampler runs as a **child process** (`node --input-type=module`) spawned by `globalSetup`, writes samples to a temp JSON file, and is terminated by `globalTeardown` which reads the file to compute the summary.

Alternatives considered:
- **Single long-running process**: Not possible — `globalSetup` exits after setup completes.
- **Environment variable**: Can store a PID, but not accumulated samples.

### Sampling interval: 10 seconds

A typical scraper run is 3–6 minutes. At 10s intervals, we get 18–36 samples — enough for a meaningful trend. Shorter intervals add noise; longer intervals risk missing spikes.

## Risks / Trade-offs

- **`os.loadavg()` is always `[0,0,0]` on Windows** → Not a concern for this project (macOS + Linux only).
- **Temp file cleanup on crash** → If the scraper process is killed mid-run, the temp file may persist. Risk is low (small file, OS cleans up on reboot). Mitigation: use `os.tmpdir()` path with a timestamped filename.
- **Child process orphaning** → If `globalTeardown` never runs, the sampler process keeps running. Mitigation: sampler auto-exits after a maximum duration (e.g., 30 minutes).

## Migration Plan

1. Add `global-setup.ts` and `global-teardown.ts` to `apps/scraper/`
2. Register both in `playwright.config.ts`
3. No environment variables required; no secrets needed
4. Rollback: remove the two `globalSetup`/`globalTeardown` entries from config
