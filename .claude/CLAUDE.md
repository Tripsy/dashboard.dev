## Overview
Next.js app with codename `dashboard` consuming `star-backend` API. Public site (auth, driver panel) + admin CRUD dashboard for all backend entities.

## Tech Stack

- Runtime: Node.js v24 (Active LTS)
- Framework: Next.js v16.2
- Language: TypeScript v6.0.3
- Containerization: Docker

Versions above are current as of 2026-07. If a suggestion depends on version-specific
behavior, check pnpm-lock.yaml for the resolved version before assuming it applies.

**TypeScript stays on 6.x.** Next 16 rejects TS 7 at startup ("does not provide the compiler
API required by Next.js") and the dev server never comes up — the failure looks like a
hanging browser tab, not a version error. Do not bump the major without checking Next
supports it first.

## Role

You are a concise assistant for a pragmatic senior full-stack developer.
- Use bullet points
- Skip pleasantries
- Provide direct answers
- Write production-ready code with clear intent and low complexity.
- Whenever we interact if it helps for the work-flow & token usage suggest changes for CLAUDE.md

## Rules & Conventions

- Do not blindly accept the user's proposed solution — verify it is correct and complete before implementing. If the approach has gaps, edge cases, or a better alternative exists, flag it.
- When the user describes a fix or approach, cross-check it against the actual codebase before writing code;
- **Prove behavioural claims by running the code, not by reading it.** There are no tests, so
  a runtime probe is the only evidence — and inspection routinely gets it wrong (a helper's
  own doc examples can be wrong, a regex can be unreachable). This applies to your own fix
  as much as to the bug: run it before saying it works.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Prefer named exports for components
- Use TypeScript strict mode
- Follow the Next.js file-based routing conventions
- Use next/image for optimized images
- Use next/link for client-side navigation

## Coding Standards

- **Readability** over cleverness - code is read 10x more than written
- **Maintainability** - future developers (including yourself) should understand intent immediately
- **Error handling** - always consider edge cases and failure modes
- Prefer async/await over .then() chains
- Explicit error handling - no empty catch blocks
- Follow existing code conventions used in the project. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- The code should follow **best practices** and **design principles** like SOLID, KISS, DRY, and strong security standards.

## Decision Documentation

- Explain your reasoning for non-obvious decisions in comments
- If there are two valid approaches, document why you chose one over the other
- Note any performance implications or trade-offs
- **Write comments about the code as it is, never as a diff against what it was.** No "this
  used to run unconditionally", no "the previous order broke X". State the constraint that
  still applies ("split before the lowercase, which destroys the case boundary the split
  reads") and leave the before/after for the commit message.

## Commands

Run inside the Docker container (`docker exec $DOCKER_CONTAINER`):

```bash
pnpm run dev      # Start dev server
pnpm run build    # Production build
pnpm run start    # Start production server (port 80)
pnpm run biome    # Biome check --write (lint + format + circular dependencies)
pnpm run clean    # Delete .next — Turbopack's dev cache grows until the container OOMs
```

To spot-check a helper without a test suite, Node 24 runs TypeScript directly via type
stripping — `docker exec dashboard.test sh -c "cd /var/www/html && node probe.ts"`, importing
the real module (`./src/helpers/x.helper.ts`). Type-only imports are erased, so a file whose
only `@/*` imports are `import type` resolves fine outside the path alias. This tests the
shipped source rather than a copy of it, which is the whole point — a hand-copied
reimplementation proves nothing about the code you are fixing.

The container is capped at 4g (`mem_limit` in `docker-compose.yml`) and Turbopack fills it.
If the dev server exits with nothing in the log it was SIGKILLed, not crashed — check
`docker inspect dashboard.test --format '{{.State.OOMKilled}}'`, then `pnpm run clean` and
restart. There is not enough headroom for the dev server and a `build`/`tsc` at the same
time: stop the dev server before running either, or it is the one that gets killed.

## Context

- This FE project has **no database and holds no business logic of its own**
- It **sends no email** — the backend owns mail entirely. There is no nunjucks/templates stack here; don't reintroduce one.
- Nearly everything under `src/services/*.service.ts` is a typed wrapper around `star-backend` REST endpoint.
- The backend project is located in `../star-backend` on which you have access through permission / additionalDirectories
- The two projects connect purely over HTTP
- `REMOTE_API_URL` in `.env` is the backend base URL.
- When a task requires understanding backend behavior — request/response shape, validation rules, permission
entities/operations, DB schema, business rules read the code in `../star-backend`
- `src/app/api/proxy/[...path]/route.ts` forwards dashboard requests to the backend, attaching the session
  cookie as a `Bearer` token.
- `src/proxy.ts` (the Next.js middleware) resolves auth/permission on every route by
  calling the backend's `/account/me` with the session token, then attaches the result as `x-auth-data`.
- `src/models/permission.model.ts` (`PermissionEntityType` / `PermissionOperationType`) mirrors the
  backend's permission entities — keep the two in sync when the backend adds/renames an entity.

## Project Structure

```
├── docker/
├── public/
├── src/
│   ├── app/    
│   │   ├── (dashboard)/   # Dashboard related routes  
│   │   ├── (public)/      # Public routes
│   │   │   ├── account/ 
│   │   │   ├── docs/ 
│   │   │   ├── page/ 
│   │   │   ├── status/ 
│   │   │   ├── layout.tsx # Public specific layout
│   │   │   ├── page.tsx
│   │   ├── api/  
│   │   │   ├── csrf/ 
│   │   │   ├── language/ 
│   │   │   ├── proxy/ 
│   │   ├── error.tsx 
│   │   ├── favicon.ico
│   │   ├── global.css
│   │   ├── layout.css  # Base layout
│   │   ├── providers.tsx # Base providers
│   ├── components/        # Common components
│   │   ├── form/          # Form related components
│   │   ├── layout/        # Layout components
│   │   │   ├── footer.default.tsx
│   │   │   ├── header.default.tsx
│   │   │   ├── logo.default.tsx
│   │   │   ├── toggle-theme.tsx
│   │   │   ├── user-menu.component.tsx
│   │   ├── ui/
│   │   ├── window/
│   │   ├── icon.component.tsx
│   │   ├── protected-route.component.tsx
│   │   ├── status.component.tsx
│   ├── config/            # Configuration files
│   │   ├── data-source.config.ts
│   │   ├── dayjs.config.ts 
│   │   ├── init-redis.config.ts 
│   │   ├── prime-pt.preset.ts
│   │   ├── routes.setup.ts
│   │   ├── settings.config.ts 
│   │   ├── translate.setup.ts 
│   ├── exceptions/        # Custom error classes
│   ├── helpers/           # Utilities (date, string, object, etc.)
│   ├── hooks/             # Custom hooks
│   ├── locales/           # Language files
│   ├── models/            # Models (entities)
│   ├── providers/           
│   │   ├── auth.provider.tsx 
│   │   ├── prime.provider.tsx 
│   │   ├── query-client.provider.tsx 
│   │   ├── theme.provider.tsx 
│   │   ├── toast.provider.tsx 
│   ├── services/          # Back-end (eg: NReady) services
│   │   ├── account.service.ts
│   │   ├── auth.service.ts
│   │   ├── ...
│   ├── stores/
│   │   ├── data-table.store.ts
│   │   ├── window.store.ts
│   ├── types/            
│   └── proxy.ts           
├── .env
├── biome.json
├── docker-compose.yml
├── next.config.ts
└── tsconfig.json
```

## Restrictions

- This project has no tests at the moment.
- Do not run biome after applying change. Run it only on demand or before git push commands.
- Stop the dev server before running `build` or `tsc` — the container cannot hold both (see Commands).
- Do not offer to do push commands, will be asked explicitly.
- Delegate noisy operations to subagents.

## Architecture

- **Dates and timezones** (`src/helpers/date.helper.ts`) — three deliberate conventions, don't
  "unify" them:
  1. *Typed times* (work-session start/end, CMR dates) mean the **driver's device clock**.
     `combineDateAndTime` uses `setHours`, which resolves in the runtime zone, and these run
     client-side; serialising the Date gives the backend the right UTC instant.
  2. *Filter day-boundaries* mean **company time** — `toUTCISOString` reads its input as
     `app.timezone` so two managers in different countries filtering the same day get the same
     rows. This is the only place company time applies.
  3. *Display* is always the driver's device zone, which happens for free: table and stats data
     is fetched client-side, so no timestamp is ever server-rendered (verified — the SSR HTML
     for `/dashboard` and `/dashboard/user` contains no formatted dates). Keep it that way; a
     date formatted in a server component would render in the container's UTC.
- **Route groups**: `src/app/(public)/*` is the public site (marketing/auth/account/driver-panel), and
  `src/app/(dashboard)/dashboard/*` is the admin panel — each has its own `layout.tsx`. Route access
  (`public` / `unauthenticated` / `authenticated` / `protected`, plus permission entity/operation) is
  declared centrally in `src/config/routes.setup.ts` via `Routes.group(...)`, not per-page — `src/proxy.ts`
  reads this table to redirect/authorize before a page ever renders.
- **Auth flow**: session token lives in an httpOnly cookie (`Configuration.get('user.sessionToken')`).
  `src/proxy.ts` middleware validates it against the backend on every matched request and injects the
  resulting `AuthModel` (user + `permissions` map) as the `x-auth-data` response header; `hasPermission()` in
  `src/models/auth.model.ts` gates `protected` routes. `src/providers/auth.provider.tsx` exposes this to
  client components.
- **Backend calls only go through the proxy** (`src/app/api/proxy/[...path]/route.ts`) or, server-side,
  through `ApiRequest` (`src/helpers/api.helper.ts`) with `.setRequestMode('remote-api')` — this is what
  attaches auth headers and builds the backend URL from `REMOTE_API_URL`. Don't call the backend directly
  from client components.
- **Per-entity dashboard CRUD pattern**: every entity under `src/app/(dashboard)/dashboard/<entity>/` follows
  the same file set — `page.tsx`, `<entity>.definition.ts` (field/column defs), `data-table-<entity>.component.tsx`,
  `data-table-filters-<entity>.component.tsx`, `form-manage-<entity>.component.tsx`, `view-<entity>.component.tsx`.
  To add a new dashboard entity (see also README "How to" section), duplicate an existing entity folder (e.g.
  `user`) and then update, in order: `src/models/<entity>.model.ts`, `src/types/data-source.key.ts`,
  locale file `src/locales/[language]/<entity>s.json` (+ register in `src/locales/en/index.ts`),
  `src/models/permission.model.ts`, `src/models/log-history.model.ts`,
  `src/app/(dashboard)/_components/side-menu.component.tsx`, and the route entry in
  `Routes.group('dashboard')` (`src/config/routes.setup.ts`).
- **Data tables**: list views use a shared `data-table` abstraction backed by `src/stores/data-table.store.ts`
  (Zustand); windows/dialogs are backed by `src/stores/window.store.ts` and `src/components/window`.
- **Config layer** (`src/config`): `settings.config.ts` (`Configuration.get(...)` — env-driven app settings,
  typed by dotted path so a typo is a compile error), `routes.setup.ts` (route table + auth),
  `data-source.config.ts` (maps `DataSourceKey` values to backend list/filter endpoints for data tables),
  `translate.setup.ts` (i18n), `init-redis.config.ts`.
- **Images**: `src/services/image.service.ts` / `image-storage.service.ts` handle upload/list/delete against
  the backend's `image` feature; storage backend is `local` or `s3` (`IMAGE_STORAGE` env var, `@aws-sdk/client-s3`).
- **CMR documents**: `src/app/document/cmr` renders CMR documents (uses `@siamf/react-signature-pad` for
  signatures, `react-to-print` for printing).
- **Locales**: `src/locales/<lang>/*.json`, registered per-language in `src/locales/<lang>/index.ts`;
  `NEXT_PUBLIC_LANGUAGE_SUPPORTED` in `.env` controls which languages are active. Validation messages
  common to several entities live in `shared.json` (`shared.validation`); an entity spreads
  `sharedValidatorMessages` into its own key list and calls `resolveValidatorMessages()`
  (`src/helpers/validator.helper.ts`), which pulls the shared keys from `shared.validation` and the
  rest from `<entity>.validation`. Only genuinely entity-specific wording belongs in the latter.
- **CSRF**: enforced in `src/proxy.ts` for every mutating request under `/api/*`, by comparing the
  `x-csrf-token` header against the `x-csrf-secret` httpOnly cookie. `ApiRequest` attaches the header
  automatically (`src/helpers/csrf.helper.ts` owns the token and retries once on a `403` carrying the
  CSRF marker, since the cookie expires after an hour). A check inside a form handler cannot enforce
  anything — the form pipeline runs client-side — so keep the gate in the middleware. Server actions
  bypass it by design and rely on Next's own origin verification.
- **Money**: the backend stores amounts as separator-less integers scaled by `10 ** AMOUNT_DECIMALS`
  (4) — `cash-flow.service.ts` persists `Math.round(abs(amount) * 10000)` and divides back on read, so
  80.6452 is row value 806452. Forms accept 2 decimals; anything past the 4th is discarded by that
  round-trip. The VAT helpers in `src/helpers/string.helper.ts` round to the same precision — keep any
  new amount maths on `roundAmount()` rather than returning raw float.
- **Redis is shared with star-backend** (one instance, one database), so every key is namespaced by
  `redis.keyPrefix` (`dashboard` here, `backend` there) inside `CacheProvider.buildKey`. Not via
  ioredis's own `keyPrefix` option: that one does not reach the MATCH argument of SCAN, so
  `deleteByPattern` would scan the other app's keys. Build every key through `buildKey`.

## Adding new feature for `dashboard` (ex: `cars`)

1. Model in `models/`
2. Copy `dashboard/user` → `dashboard/[entity]`
3. Add to `types/data-source.key.ts`
4. Locale JSON + register
5. Update `permission.model.ts`
6. Update `log-history.model.ts`
7. Add to `side-menu.component.tsx`
8. Add route to `Routes.group('dashboard')`s`
