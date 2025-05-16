# Mercari Scraper

This project is an automated scraper tool, specifically designed for periodically crawling product information on the Mercari platform. Its main function is to regularly check and extract newly listed products, assisting users in immediately grasping the latest product trends.

## What's inside?

This turborepo includes the following packages/apps:

### Apps and packages

- `web`: a [Next.js](https://nextjs.org/) app
- `scraper`: a [Playwright] (https://playwright.dev/) scraper
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/database`: [Prisma ORM](https://prisma.io/) to manage & access your database
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
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

Once the database is ready, copy the `.env.example` file to the [`/packages/database`](./packages/database/), [`/apps/web`](./apps/web/) and [`/apps/scraper`](./apps/scraper/) directories as `.env`:

```bash
cp .env.example ./packages/database/.env
cp .env.example ./apps/web/.env
cp .env.example ./apps/scraper/.env
```

This ensures Prisma has access to the `DATABASE_URL` and `DIRECT_URL` environment variable, which is required to connect to your database.

If you added a custom database name, or use a cloud based database, you will need to update the `DATABASE_URL` in your `.env` accordingly.

### 4. Migrate your database

Once your database is running, you’ll need to create and apply migrations to set up the necessary tables. Run the database migration command:

```bash
# Using pnpm
pnpm run db:migrate:dev
```

You’ll be prompted to name the migration. Once you provide a name, Prisma will create and apply the migration to your database.

> Note: The `db:migrate:dev` script (located in [packages/database/package.json](/packages/database/package.json)) uses [Prisma Migrate](https://www.prisma.io/migrate) under the hood.

For production environments, always push schema changes to your database using the [`prisma migrate deploy` command](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate). You can find an example `db:migrate:deploy` script in the [`package.json` file](/packages/database/package.json) of the `database` package.

### 5. Seed your database

To populate your database with initial or fake data, use [Prisma's seeding functionality](https://www.prisma.io/docs/guides/database/seed-database).

Update the seed script located at [`packages/database/src/seed.ts`](/packages/database/src/seed.ts) to include any additional data that you want to seed. Once edited, run the seed command:

```bash
# Using pnpm
pnpm run db:seed
```

### 6. Build your application

To build all apps and packages in the monorepo, run:

```bash
# Using pnpm
pnpm run build
```

### 7. Start the application

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
    - `DIRECT_URL`
    - Any other required environment variables
4. On each scheduled trigger, GitHub Actions will automatically run the `scraper` and connect to the database.

---

### 2. Deploy `web` to Vercel

You can deploy the `web` frontend to [Vercel](https://vercel.com/).

**Steps:**

1. Log in to Vercel and create a new project connected to your GitHub repository.
2. In the Vercel project settings, add the following environment variables:
    - `DATABASE_URL`
    - `DIRECT_URL`
    - Any other required environment variables
3. Set the `Root Directory` in Vercel to `apps/web`.
4. Save the settings and deploy. Vercel will automatically detect the Next.js app and complete the deployment.

---

For more details on automation and deployment, refer to the official documentation of each platform.

