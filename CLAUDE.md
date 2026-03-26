# Mercari Scraper - Claude Code Instructions

## Project Overview

A Turborepo monorepo for scraping Mercari Japan listings.

- **`apps/scraper`** - Playwright-based scraper, runs daily via GitHub Actions
- **`packages/database`** - Shared Prisma ORM layer (PostgreSQL via Supabase)
- **`packages/config-typescript`** - Shared TypeScript config

## Common Commands

```bash
# Development
pnpm dev             # Start all apps

# Build & Lint
pnpm build           # Build all packages
pnpm check           # Lint (oxlint) + type-check all packages
pnpm lint            # Lint all packages (oxlint)
pnpm lint:fix        # Lint + auto-fix (oxlint)
pnpm format          # Format code (oxfmt)

# Scraper (run directly in apps/scraper, not via Turbo)
pnpm --filter scraper scraper         # Run scraper
pnpm --filter scraper scraper:debug   # Debug mode
pnpm --filter scraper scraper:ui      # Playwright UI

# Database (run directly in packages/database, not via Turbo)
pnpm generate                                              # Generate Prisma client (all packages)
pnpm --filter @mercari-scraper/database db:migrate:dev    # Create + apply migration (dev)
pnpm --filter @mercari-scraper/database db:push           # Push schema without migration
pnpm --filter @mercari-scraper/database db:seed           # Seed initial data
```

## Code Style & Conventions

- **Language**: TypeScript everywhere; strict mode enabled
- **Comments and UI text**: English only
- **Package manager**: pnpm — do not use npm or yarn
- **Monorepo runner**: Turbo — always run scripts from the repo root

### Formatting (oxfmt)
- `printWidth: 80`, `trailingComma: "none"`, `singleQuote: true`

### Linting (oxlint)
- Config per package via `.oxlintrc.json`
- Run with `--deny-warnings` (warnings are treated as errors)

## Branch Strategy
- `main` — production, triggers scheduled scraper (daily, UTC 04:00)
- `dev` — active development, default PR target
