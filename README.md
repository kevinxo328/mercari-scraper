# Mercari Scraper

[![Scrape Mercari](https://github.com/kevinxo328/mercari-scraper/actions/workflows/scraper.yml/badge.svg?branch=main)](https://github.com/kevinxo328/mercari-scraper/actions/workflows/scraper.yml)

Personal-use Mercari scraper that periodically crawls product listings and stores results for tracking new items.

## What's inside?

### Apps and packages

- `web-tanstack`: TanStack Start app (deploy to Vercel)
- `scraper`: Playwright scraper
- `@mercari-scraper/database`: Prisma ORM
- `@mercari-scraper/typescript-config`

### Utilities

- TypeScript, OxLint, OxFmt
- Vitest
- Prisma ORM

## Getting started

```bash
git clone https://github.com/kevinxo328/mercari-scraper.git
cd mercari-scraper
```

### 2. Set up Supabase

This project uses [Supabase](https://supabase.com/) as the database backend. Create a project and get the connection string.

**Warning:** Scraper data will keep growing. Set up a scheduled cleanup (e.g., Supabase Scheduled Jobs / cron) to delete old records. Example:

```sql
DELETE FROM "ScraperResult"
WHERE "updatedAt" < NOW() - INTERVAL '7 days';
```

### 3. Setup environment variables

Once the database is ready, copy the `.env.example` file to `.env` in each of the following directories:

```bash
# Copy example files to .env in each package
cp ./packages/database/.env.example ./packages/database/.env
cp ./apps/web-tanstack/.env.example ./apps/web-tanstack/.env
cp ./apps/scraper/.env.example ./apps/scraper/.env
```

For `web-tanstack`, also set Google OAuth and auth secrets (see `.env.example` for required vars):

- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `AUTH_ALLOW_EMAILS`
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

### 4. Migrate your database

Once your database is running, create and apply migrations to set up the tables:

```bash
pnpm --filter @mercari-scraper/database db:migrate:dev
```

> **Note:** For production, use `prisma migrate deploy`.
>
> **Supabase setup:** Supabase does not allow automatic shadow database creation, which is required by `prisma migrate dev`. Create a second Supabase project to use as the shadow database and set `SHADOW_DATABASE_URL` in `packages/database/.env` to its direct connection string.

### 5. Generate Prisma Client

After running migrations (or any time `prisma/schema.prisma` changes), regenerate the Prisma client:

```bash
pnpm generate
```

### 6. Seed your database (optional)

Edit `packages/database/src/seed.ts`, then run:

```bash
pnpm --filter @mercari-scraper/database db:seed
```

### 7. Verify your code (Lint & Type Check)

To ensure code quality and type safety across all packages, run:

```bash
# Runs lint and type-check simultaneously
pnpm check
```

This command uses Turbo to run both OxLint and TypeScript's `tsc` check. It is highly recommended to run this before committing any changes.

### 8. Build your application

To build all apps and packages in the monorepo, run:

```bash
# Using pnpm
pnpm run build
```

### 9. Start the application

Finally, start your application with:

```bash
pnpm run dev
```

Your app will be running at `http://localhost:3000`.

## Deploy

### 1. Deploy `scraper` with GitHub Actions

The `scraper` app is set up to run automatically on a schedule using GitHub Actions.

**Steps:**

1. Make sure the file `.github/workflows/scraper.yml` exists in the project root directory. This file is configured with a schedule (e.g., cron).
2. To adjust the schedule frequency, edit the `schedule` block inside [`.github/workflows/scraper.yml`](.github/workflows/scraper.yml).
3. Go to the GitHub project page → `Settings` → `Secrets and variables` → `Actions`, and add the following environment variables:
   - `DATABASE_URL`
   - `SLACK_WEBHOOK_URL` (optional) — enables Slack notifications on completion
   - `WEB_APP_URL` (optional) — used in notifications
4. On each scheduled trigger, GitHub Actions will automatically run the `scraper` and connect to the database.

#### Resource Monitoring

Each scraper run logs CPU/RAM stats and writes a summary to GitHub Actions. If `SLACK_WEBHOOK_URL` is set, a single message is sent on completion.

---

### 2. Deploy `web-tanstack` to Vercel

Deploy the `web-tanstack` frontend (TanStack Start) to [Vercel](https://vercel.com/).

**Steps:**

1. Log in to Vercel and create a new project connected to your GitHub repository.
2. In the Vercel project settings, add the following environment variables:
   - `DATABASE_URL`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_ALLOW_EMAILS`
   - `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (the production URL)
3. Set the `Root Directory` in Vercel to `apps/web-tanstack`.
4. Save the settings and deploy. Vercel will automatically detect the application type and complete the deployment.

---

For more details on automation and deployment, refer to the official documentation of each platform.
