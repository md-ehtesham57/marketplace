# Marketplace Monorepo

A full-stack marketplace monorepo built with:

- `pnpm` workspaces
- `turbo` for task orchestration
- `apps/api` — Express + Prisma backend
- `apps/web` — customer-facing Next.js frontend
- `apps/admin` — admin Next.js frontend
- `packages/ui` — shared React UI primitives
- `packages/types` — shared TypeScript types
- `packages/config` — shared Tailwind / config utilities

## Project structure

- `apps/api` — backend API server
- `apps/web` — storefront frontend
- `apps/admin` — admin dashboard frontend
- `packages/ui` — shared UI component package
- `packages/types` — shared type definitions
- `packages/config` — shared config helpers and Tailwind settings

## Technologies

- Node.js + TypeScript
- `express`, `helmet`, `cors`, `morgan`, `express-rate-limit`
- `prisma` + PostgreSQL
- `next`, `react`, `react-dom`
- `tailwindcss@4`
- `vitest` for tests
- `prettier` for formatting

## Getting started

### Prerequisites

- Node.js 20+
- `pnpm` 10.x
- PostgreSQL database

### Install dependencies

```bash
pnpm install
```

### Backend environment

Create `apps/api/.env`. You can start from `apps/api/.env.example`.

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/marketplace"
JWT_SECRET="your-jwt-secret"
CLIENT_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

`JWT_SECRET` should be a strong random value, for example from `openssl rand -hex 64`.

Optional mail settings for password reset emails:

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@marketplace.local
```

### Frontend environment

The web and admin apps default to `http://localhost:4000`, but deployments should set the API URL explicitly.

Create `apps/web/.env.local` and `apps/admin/.env.local` as needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Database setup

Apply the Prisma migration and generate the Prisma client:

```bash
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma generate
```

For production or CI deployments, use:

```bash
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma generate
```

### Seed the database

```bash
pnpm --filter api seed
```

Seeded accounts:

- Admin: `admin@marketplace.com` / `admin123`
- Seller: `seller@marketplace.com` / `password123`

## Run commands

From the workspace root:

- `pnpm dev` — run `turbo run dev`
- `pnpm build` — run `turbo run build`
- `pnpm lint` — run `turbo run lint`
- `pnpm test` — run `turbo run test`
- `pnpm test:api` — run API tests only

### Start individual apps

```bash
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter admin dev
```

### Ports

- Backend API: `http://localhost:4000`
- Web storefront: `http://localhost:3000`
- Admin dashboard: `http://localhost:3001`

## Verification

```bash
pnpm test
pnpm build
```

The Next.js build uses `next/font` for Geist fonts, so first-time builds may need network access to fetch Google Fonts.

## Backend overview

- Entrypoint: `apps/api/src/index.ts`
- Routes:
  - `/api/auth`
  - `/api/products`
  - `/api/cart`
  - `/api/orders`
  - `/api/users`
  - `/api/wishlist`
  - `/api/products` also serves review routes
- Health check: `/health`
- Prisma schema: `apps/api/prisma/schema.prisma`
- Seed script: `apps/api/prisma/seed.ts`

## Frontend overview

- `apps/web` — storefront app using Next.js
- `apps/admin` — admin app using Next.js
- Both apps depend on shared workspace packages:
  - `@marketplace/config`
  - `@marketplace/types`
  - `@marketplace/ui`

## Shared packages

- `packages/ui` — exports common component primitives like button, input, badge, card, and navbar
- `packages/types` — shared TypeScript exports
- `packages/config` — shared Tailwind config and other config utilities

## Turbo / workspace

- `turbo.json` defines build and test orchestration
- `pnpm-workspace.yaml` includes `apps/*` and `packages/*`

## Configuration notes

- The root workspace uses `@prisma/client` and `prisma` as top-level dependencies.
- `apps/api` currently expects a PostgreSQL connection and a JWT secret for auth.
- `CLIENT_URL` is used when generating password reset links.
- `CORS_ORIGINS` is a comma-separated allowlist for browser clients.
- `NEXT_PUBLIC_API_URL` is used by both Next.js apps to call the API.
- `apps/web` and `apps/admin` are Next.js apps bootstrapped from `create-next-app`.

## App docs

- `apps/web/README.md`
- `apps/admin/README.md`
