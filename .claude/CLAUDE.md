# Star-Backend Project

## Overview
React + Node.js e-commerce app with Stripe payments.


Plain-text memory loaded into every session. Put project conventions, tech stack, commands, 
and anything Claude should know without being told. See the memory guide for format tips.

https://www.claudedirectory.org/how-to/memory

/commands
Each file is a slash command. Filename becomes the command: commands/review.md → /review. 
The body is the prompt that runs when invoked.

/skills

Reusable multi-step workflows. Each skill is a folder containing a SKILL.md with metadata and instructions. 
Claude loads the index on startup and invokes skills when the user's request matches.

# CLAUDE.md

## Stack
- Next.js 15 App Router
- TypeScript strict mode
- Tailwind v4

## Commands
- `pnpm dev` — dev server
- `pnpm test` — Vitest
- `pnpm lint` — ESLint

## Conventions
- Named exports only
- Zod for runtime validation

{
"permissions": {
"allow": ["Bash(pnpm *)", "Bash(git status)", "Bash(git diff *)"]
}
}


# API Repo - CLAUDE.md

## This project
REST API using Node.js + Express + PostgreSQL
Auth: JWT tokens, 15min access / 7day refresh

## Paired with: frontend repo at ../frontend
Frontend expects:
- All API responses: { data: ..., error: null } or { data: null, error: "message" }
- Date format: ISO 8601 strings (not timestamps)
- Auth header: Bearer {accessToken}

## Shared types
See ../shared-types/index.ts for TypeScript interfaces
Any API change that affects response shape MUST update shared-types first

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project description

This is **Star Office** ("NReady Dashboard"), a Next.js 16 / React 19 / TypeScript frontend for a fleet and
drivers management app used by a company that provides roadside assistance. It provides:

- A public site: auth flows (login, register, recover/reset password, email confirmation), account pages,
  a driver panel, CMR document handling.
- An administration dashboard with CRUD screens for: user, permission, template, cron-history, log-history,
  log-data, mail-queue, brand, cash-flow, address, client, place, vehicle, vendor, company-vehicle,
  cmr / cmr-session / cmr-vehicle, work-session / work-session-vehicle.

This frontend has **no database and holds no business logic of its own** — it is a thin client over the
`star-backend` API (see "Backend project" below). Nearly everything under `src/services/*.service.ts` is a
typed wrapper around a backend REST endpoint.

## Backend project (star-backend)

This repo is paired with a sibling backend project, **`star-backend`**, located at `../../star-backend` (i.e.
`/Users/Shared/Projects/star-backend`, one level up from this project). It's an Express.js + TypeScript API
(PostgreSQL/MariaDB via TypeORM, Redis, JWT auth, Zod validation) — also built on the "NReady" boilerplate.

When a task requires understanding backend behavior — request/response shape, validation rules, permission
entities/operations, DB schema, business rules — **read the code in `../../star-backend` directly** rather than
guessing from the frontend types. Useful landmarks there:
- `src/features/<entity>/` — one folder per domain feature (controller, service, routes, DTOs, entity), e.g.
  `account`, `user`, `permission`, `cmr`, `cmr-session`, `work-session`, `brand`, `cash-flow`, `address`,
  `client`, `place`, `vehicle`, `vendor`, `company-vehicle`, `image`, `stats`, `cron-history`, `log-history`,
  `log-data`, `mail-queue`, `template`, `user-permission`.
- `src/database/migrations/` — DB schema history (TypeORM).
- `../src/config/data-source.config.ts` — DB connection/config.
- Backend commands (run from `../../star-backend`): `pnpm run dev`, `pnpm run test`, `pnpm run typecheck`,
  `pnpm run migration:generate|run|revert`, `pnpm run biome`, `pnpm run madge`.

The two projects connect purely over HTTP:
- `REMOTE_API_URL` in `../.env` (dev: `http://star-backend.test:3000`) is the backend base URL.
- `src/app/api/proxy/[...path]/route.ts` forwards dashboard requests to the backend, attaching the session
  cookie as a `Bearer` token.
- `../src/proxy.ts` (the Next.js middleware, see `matcher` config) resolves auth/permission on every route by
  calling the backend's `/account/me` with the session token, then attaches the result as `x-auth-data`.
- `../src/models/permission.model.ts` (`PermissionEntityType` / `PermissionOperationType`) mirrors the
  backend's permission entities — keep the two in sync when the backend adds/renames an entity.
- Frontend service files in `src/services/*.service.ts` are the single place that know backend endpoint
  paths/payloads for a given domain.

## Commands

Run inside the Docker container (`docker exec -it dashboard.test /bin/bash`) or locally if the toolchain is set up:

```bash
pnpm run dev      # Start dev server (Next.js + Turbopack, port 80)
pnpm run build    # Production build
pnpm run start    # Start production server (port 80)
pnpm run biome    # Biome check --write (lint + format)
pnpm run madge    # Check for circular dependencies in src
```

There is no test runner configured in this project (`pnpm run test` does not exist here — tests live in
`star-backend`).

## Architecture

- **Route groups**: `src/app/(public)/*` is the public site (marketing/auth/account/driver-panel), and
  `src/app/(dashboard)/dashboard/*` is the admin panel — each has its own `layout.tsx`. Route access
  (`public` / `unauthenticated` / `authenticated` / `protected`, plus permission entity/operation) is
  declared centrally in `../src/config/routes.setup.ts` via `Routes.group(...)`, not per-page — `../src/proxy.ts`
  reads this table to redirect/authorize before a page ever renders.
- **Auth flow**: session token lives in an httpOnly cookie (`Configuration.get('user.sessionToken')`).
  `../src/proxy.ts` middleware validates it against the backend on every matched request and injects the
  resulting `AuthModel` (user + `permissions` map) as the `x-auth-data` response header; `hasPermission()` in
  `../src/models/auth.model.ts` gates `protected` routes. `../src/providers/auth.provider.tsx` exposes this to
  client components.
- **Backend calls only go through the proxy** (`src/app/api/proxy/[...path]/route.ts`) or, server-side,
  through `ApiRequest` (`../src/helpers/api.helper.ts`) with `.setRequestMode('remote-api')` — this is what
  attaches auth headers and builds the backend URL from `REMOTE_API_URL`. Don't call the backend directly
  from client components.
- **Per-entity dashboard CRUD pattern**: every entity under `src/app/(dashboard)/dashboard/<entity>/` follows
  the same file set — `page.tsx`, `<entity>.definition.ts` (field/column defs), `data-table-<entity>.component.tsx`,
  `data-table-filters-<entity>.component.tsx`, `form-manage-<entity>.component.tsx`, `view-<entity>.component.tsx`.
  To add a new dashboard entity (see also README "How to" section), duplicate an existing entity folder (e.g.
  `user`) and then update, in order: `src/models/<entity>.model.ts`, `../src/types/data-source.key.ts`,
  locale file `src/locales/[language]/<entity>s.json` (+ register in `../src/locales/en/index.ts`),
  `../src/models/permission.model.ts`, `../src/models/log-history.model.ts`,
  `src/app/(dashboard)/_components/side-menu.component.tsx`, and the route entry in
  `Routes.group('dashboard')` (`../src/config/routes.setup.ts`).
- **Data tables**: list views use a shared `data-table` abstraction backed by `../src/stores/data-table.store.ts`
  (Zustand); windows/dialogs are backed by `../src/stores/window.store.ts` and `../src/components/window`.
- **Config layer** (`../src/config`): `settings.config.ts` (`Configuration.get(...)` — env-driven app settings),
  `routes.setup.ts` (route table + auth), `data-source.config.ts`/`data-source.register.ts` (maps
  `DataSourceKey` values to backend list/filter endpoints for data tables), `nunjucks.config.ts` (email
  templates), `translate.setup.ts` (i18n), `init-redis.config.ts`.
- **Images**: `../src/services/image.service.ts` / `image-storage.service.ts` handle upload/list/delete against
  the backend's `image` feature; storage backend is `local` or `s3` (`IMAGE_STORAGE` env var, `@aws-sdk/client-s3`).
- **CMR documents**: `../src/app/document/cmr` renders CMR documents (uses `@siamf/react-signature-pad` for
  signatures, `react-to-print` for printing).
- **Locales**: `src/locales/<lang>/*.json`, registered per-language in `src/locales/<lang>/index.ts`;
  `NEXT_PUBLIC_LANGUAGE_SUPPORTED` in `../.env` controls which languages are active.

## Conventions

- Path alias `@/*` maps to `src/*` (see `../tsconfig.json`).
- Formatting/linting is Biome (tabs, single quotes, organize-imports on save) — run `pnpm run biome` before
  committing, not a separate formatter.
- Circular dependencies are checked with Madge (`../.madgerc` excludes `.entity.ts`/`.dto.ts`/`.types.ts`).
