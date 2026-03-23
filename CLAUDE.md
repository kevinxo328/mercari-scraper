# Mercari Scraper - Claude Code Instructions

## Project Overview

A Turborepo monorepo for scraping Mercari Japan listings.

- **`apps/scraper`** - Playwright-based scraper, runs daily via GitHub Actions
- **`packages/database`** - Shared Prisma ORM layer (PostgreSQL via Supabase)
- **`packages/config-eslint`** / **`packages/config-typescript`** - Shared configs

## Common Commands

```bash
# Development
pnpm dev             # Start all apps

# Build & Lint
pnpm build           # Build all packages
pnpm lint            # Lint all packages
pnpm lint:fix        # Lint + auto-fix
pnpm format          # Prettier format

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

### Formatting (Prettier)
- `printWidth: 80`, `trailingComma: "none"`, `singleQuote: true`

### ESLint
- Shared config from `packages/config-eslint`
- All ESLint issues are warnings (not errors) via `eslint-plugin-only-warn`

## Branch Strategy
- `main` — production, triggers scheduled scraper (daily, UTC 04:00)
- `dev` — active development, default PR target
