# Mercari Scraper - Claude Code Instructions

## Project Overview

A Turborepo monorepo for scraping Mercari Japan listings.

- **`apps/scraper`** - Playwright-based scraper, runs daily via GitHub Actions
- **`apps/web`** - Next.js admin dashboard (tRPC, NextAuth, TanStack Query, Radix UI)
- **`packages/database`** - Shared Prisma ORM layer (PostgreSQL via Supabase)
- **`packages/config-eslint`** / **`packages/config-typescript`** - Shared configs

## Common Commands

```bash
# Development
pnpm dev             # Start all apps
pnpm dev:mock        # Start web with mocked API

# Build & Lint
pnpm build           # Build all packages
pnpm lint            # Lint all packages
pnpm lint:fix        # Lint + auto-fix
pnpm format          # Prettier format

# Scraper
pnpm scraper         # Run scraper
pnpm scraper:debug   # Debug mode
pnpm scraper:ui      # Playwright UI

# Database
pnpm generate        # Generate Prisma client
pnpm db:migrate:dev  # Create + apply migration (dev)
pnpm db:push         # Push schema without migration
pnpm db:seed         # Seed initial data
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
