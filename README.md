# Mercari Scraper

[![Scrape Mercari](https://github.com/kevinxo328/mercari-scraper/actions/workflows/scraper.yml/badge.svg?branch=main)](https://github.com/kevinxo328/mercari-scraper/actions/workflows/scraper.yml)

This project is an automated scraper tool for personal use, specifically designed for periodically crawling product information on the Mercari platform. Its main function is to regularly check and extract newly listed products, assisting users in immediately grasping the latest product trends.

## What's inside?

This turborepo includes the following packages/apps:

### Apps and packages

- `web`: a [Next.js](https://nextjs.org/) app
- `web-tanstack`: a [TanStack Start](https://tanstack.com/start) app
- `scraper`: a [Playwright](https://playwright.dev/) scraper
- `@mercari-scraper/eslint-config`: `eslint` configurations (includes `eslint-config-prettier` and `plugin:turbo/recommended`)
- `@mercari-scraper/database`: [Prisma ORM](https://prisma.io/) to manage & access your database
- `@mercari-scraper/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest / Jest](https://vitest.dev/) for unit and integration testing
- [Prisma ORM](https://prisma.io/) for accessing the database

## Getting started

Follow these steps to set up and run your Turborepo project with Prisma ORM:

```bash
git clone https://github.com/kevinxo328/mercari-scraper.git
cd mercari-scraper
```

### 2. Set up Supabase

This project uses [Supabase](https://supabase.com/) as the database backend. Please sign up for a Supabase account and create a new project. After your project is created, you will receive a database connection string.

You will need this connection string in the next step to configure your environment variables.

### 3. Setup environment variables

Once the database is ready, copy the `.env.example` file to `.env` in each of the following directories:

```bash
# Copy example files to .env in each package
cp ./packages/database/.env.example ./packages/database/.env
cp ./apps/web/.env.example ./apps/web/.env
cp ./apps/web-tanstack/.env.example ./apps/web-tanstack/.env
cp ./apps/scraper/.env.example ./apps/scraper/.env
```

Each directory has a specialized `.env.example` file containing the environment variables relevant to that specific part of the application.

#### Authentication Variables

For `web` and `web-tanstack`, you will also need to configure authentication variables:

- **Google OAuth**: Obtain `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` from the [Google Cloud Console](https://console.cloud.google.com/).
- **Secret**: Generate a random secret (e.g., using `openssl rand -base64 32`).
  - `web` uses `AUTH_SECRET`.
  - `web-tanstack` uses `BETTER_AUTH_SECRET`.
- **Better Auth URL**: For `web-tanstack`, you MUST specify `BETTER_AUTH_URL` (e.g., `http://localhost:3000` in dev).
- **Allowed Emails**: Specify `AUTH_ALLOW_EMAILS` as a comma-separated list to restrict access.

### 4. Migrate your database

Once your database is running, you’ll need to create and apply migrations to set up the necessary tables. Run the database migration command:

```bash
# Using pnpm
pnpm run db:migrate:dev
```

You’ll be prompted to name the migration. Once you provide a name, Prisma will create and apply the migration to your database.

> Note: The `db:migrate:dev` script (located in [packages/database/package.json](/packages/database/package.json)) uses [Prisma Migrate](https://www.prisma.io/migrate) under the hood.

For production environments, always push schema changes to your database using the [`prisma migrate deploy` command](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate). You can find an example `db:migrate:deploy` script in the [`package.json` file](/packages/database/package.json) of the `database` package.

> **Troubleshooting (Supabase):** If `db:migrate:dev` fails with a shadow database error, use `prisma migrate deploy` instead, which applies existing migration files directly without requiring a shadow database:
>
> ```bash
> cd packages/database && pnpm prisma migrate deploy
> ```

### 5. Generate Prisma Client

After running migrations (or any time `prisma/schema.prisma` changes), regenerate the Prisma client:

```bash
pnpm generate
```

This runs `prisma generate` and rebuilds the generated client under `packages/database/generated/client/`. Always use `pnpm generate` from the repo root rather than running `prisma generate` directly inside the package.

### 6. Seed your database

To populate your database with initial or fake data, use [Prisma's seeding functionality](https://www.prisma.io/docs/guides/database/seed-database).

Update the seed script located at [`packages/database/src/seed.ts`](/packages/database/src/seed.ts) to include any additional data that you want to seed. Once edited, run the seed command:

```bash
# Using pnpm
pnpm run db:seed
```

### 7. Verify your code (Lint & Type Check)

To ensure code quality and type safety across all packages, run:

```bash
# Runs lint and type-check simultaneously
pnpm check
```

This command uses Turbo to run both ESLint and TypeScript's `tsc` check. It is highly recommended to run this before committing any changes.

### 8. Build your application

To build all apps and packages in the monorepo, run:

```bash
# Using pnpm
pnpm run build
```

This command is now configured as a robust pipeline that automatically:
1.  **Generates** the Prisma client.
2.  **Runs all tests** (`test`) to ensure logic is correct.
3.  **Builds** the packages only if all previous steps pass.

### 9. Start the application

Finally, start your application with:

```bash
pnpm run dev
```

Your app will be running at `http://localhost:3000`. Open it in your browser to see it in action!

You can also read the official [detailed step-by-step guide from Prisma ORM](https://pris.ly/guide/turborepo?utm_campaign=turborepo-example) to build a project from scratch using Turborepo and Prisma ORM.

## Deploy

### 1. Deploy `scraper` with GitHub Actions

The `scraper` app is set up to run automatically on a schedule using GitHub Actions.

**Steps:**

1. Make sure the file `.github/workflows/scraper.yml` exists in the project root directory. This file is configured with a schedule (e.g., cron).
2. To adjust the schedule frequency, edit the `schedule` block inside [`.github/workflows/scraper.yml`](.github/workflows/scraper.yml).
3. Go to the GitHub project page → `Settings` → `Secrets and variables` → `Actions`, and add the following environment variables:
   - `DATABASE_URL`
   - `SLACK_WEBHOOK_URL` (optional) — enables Slack notifications on completion
   - Any other required environment variables
4. On each scheduled trigger, GitHub Actions will automatically run the `scraper` and connect to the database.

#### Resource Monitoring

Every scraper run automatically samples CPU and RAM usage every 10 seconds via Node.js built-ins (no extra dependencies). After the run completes:

- **Console** — a summary table is printed (duration, peak RAM, avg CPU, etc.)
- **GitHub Actions** — the summary is also written to the [Job Summary](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#adding-a-job-summary) page
- **Slack** — if `SLACK_WEBHOOK_URL` is configured, a single message is sent combining the scrape result and resource stats:

  ```
  ✅ Mercari scraper completed. 42 new items found. View results
  📊 3m 40s | RAM peak 1.84 GB | CPU avg 20.7% peak 37.9%
  ```

---

### 2. Deploy `web` or `web-tanstack` to Vercel

You can deploy either the `web` frontend (Next.js) or `web-tanstack` (TanStack Start) to [Vercel](https://vercel.com/).

**Steps:**

1. Log in to Vercel and create a new project connected to your GitHub repository.
2. In the Vercel project settings, add the following environment variables:
   - `DATABASE_URL`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_ALLOW_EMAILS`
   - For `web`: `AUTH_SECRET`
   - For `web-tanstack`: `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (the production URL)
3. Set the `Root Directory` in Vercel to `apps/web` or `apps/web-tanstack`.
4. Save the settings and deploy. Vercel will automatically detect the application type and complete the deployment.

---

For more details on automation and deployment, refer to the official documentation of each platform.
