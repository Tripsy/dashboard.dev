# Description

(Dashboard) is a demo FE implementation using [NReady](https://github.com/Tripsy/nready) as a backend API. 

This boilerplate provide implementation for authentication system and include and administration dashboard.

The codebase is fully typed in **TypeScript** — no as any shortcuts. **Biome** (on top of ESLint) ensures code quality.

At this date (e.g.: 2026 January), all [dependencies](#Dependencies) are updated to their latest versions, and Node.js 22 is supported.

A ready-to-use Docker environment is provided for quick [setup](#Setup).

This project is still a work in progress, and the next goals are:
- Improve the UI/UX
- Include additional [NReady](https://github.com/Tripsy/nready) features in the adminstration dashboard

Meanwhile, we're open to suggestions / feedback, and if you find this project useful, please consider giving it a star ⭐

# Tech Stack

- Runtime: React
- Framework: Next.js
- Database: -
- Language: TypeScript
- Security: rate limiting, input validation (powered by Zod)
- Logging: -
- Containerization: Docker
- Testing: -

# Characteristics

- [x] Dashboard: Administration panel with CRUD operations for users, permissions, templates, logs, etc.
- [x] Auth system: Login, register, logout, forgot password, reset password, email confirmation, etc.
- [x] Best Practices: Clean architecture, TypeScript, error handling, async patterns, DRY, SOLID, KISS
- [x] Security: rate limiting, input validation
- [x] Request validation (powered by Zod)
- [x] Language files
- [x] Providers included: Auth, Theme, Toast
- [x] Development environment available (Docker)

# Features

### Core features

- [x] (Public) Auth system: Login, register, logout, forgot password, reset password, email confirmation, etc.
- [x] (Dashboard) cron-history, log-data, log-history, mail-queue, permissions, templates, users

# Setup

### 1. Add `hosts` record
For configuration refer to this guide:  
[How to Edit the Host File on macOS](https://phoenixnap.com/kb/mac-hosts-file)

### 2. Initialize Docker container
Start the Docker container using the following command:

```
docker compose up
```

### 3. Connect to the Docker container
Once the container is running, connect to it with:

```
docker exec -it dashboard.dev /bin/bash
```

### 4. Install dependencies inside the container
Run the following command to install project dependencies:

```
$ pnpm install
```

### 5. Update .env

Start by copying the `.env.example` file to `.env` and update the environment variables accordingly.

### 6. Run the application

> **Note**
> Dashboard uses NReady as backend, so you need to run it first.

```
$ pnpm run dev
```

# Commands

```bash

// Code sanity
$ pnpm run biome
$ pnpm run madge

```

# Structure

```
├── docker/
├── public/
├── src/
│   ├── app/            
│   ├── components/            # Common components
│   │   ├── form/    # Form related components
│   │   ├── icon.component.tsx
│   │   ├── footer.default.tsx
│   │   ├── status.component.tsx
        ???
│   ├── config/            # Configuration files
│   │   ├── data-source.config.ts # (dashboard) data source configuration
│   │   ├── daysjs.config.ts 
│   │   ├── init-redis.config.ts 
│   │   ├── routes.config.ts # Routes related helpers & configuration
│   │   ├── settings.config.ts 
│   │   ├── translate.setup.ts 
│   ├── exceptions/        # Custom error classes
│   ├── helpers/           # Utilities (date, string, object, etc.)
│   ├── hooks/             # Custom hooks
│   ├── locales/           # Language files
│   ├── models/            # Models (entities) related to (dashboard)
│   ├── provider/           
│   │   ├── auth.provider.tsx 
        ???
│   ├── services/          # Back-end (eg: NReady) services
│   │   ├── account.service.ts
│   │   ├── auth.service.ts
│   │   ├── ...
│   ├── types/             # Some types
│   └── proxy.ts           
├── .env
├── docker-compose.yml
├── biome.json
└── tsconfig.json
```

# How to

## Adding new model for `dashboard` (ex: `cars`)

1. Create `lib/entities/cars.model.ts` from `lib/entities/users.model.ts`
2. Duplicate `src/(dashboard)/dashboard/users` > `src/(dashboard)/dashboard/cars` & rename files
    - page.tsx
    - cars.definition.ts
    - data-table-cars.component.tsx
    - form-manage-cars.component.tsx
    - data-table-cars-filters.component.tsx
3. Update `src/config/data-source.config.ts`
    - export type DataSourceKey
4. Update `src/config/data-source.dashboard.register.ts`
    - add `registerDataSource('cars', dataSourceConfigCars)`
5. Add `cars.json` to `src/locales/[language]` & update src/locales/en/index.ts
6. Update `Routes.group('dashboard')` in `src/config/routes.setup.ts`
7. Create `src/services/cars.service.ts` from `src/services/users.service.ts`
8. Update `src/app/(dashboard)/_components/side-menu.component.tsx`
9. Update `src/models/permission.model.ts`
    - PermissionEntitiesSuggestions
10. Update `src/models/log-history.model.ts`
     - LogHistoryEntities

# TODO

1. fresh design
    - dashboard layout
    - dashboard filters / manage
    - docs page
    - features page
    - changelog page 
2. Review Readme > How to section 
3. Recreate docker image

# Bugs & Issues & Ideas

1. Review security
2. Add section "documentation"
3. login with google / facebook
4. Replace all console.error with logging
5. Implement kill all sessions except current
      // // This will actually remove all sessions - keep it for further implementation
      // await AccountTokenRepository.createQuery()
      //     .filterBy('user_id', policy.getUserId())
      //     .delete(false, true);
6. For template section
    - would be a nice idea to keep track of the last changes (maybe add a new column - prev version id and a button to restore to that version)
    - view presentation could be enhanced
7. https://nextjs.org/docs/app/getting-started/partial-prerendering
8. https://react.dev/learn/react-compiler/introduction

# Dependencies

- [next](https://nextjs.org/)
- [react](https://reactjs.org/)
- [zustand](https://zustand.docs.pmnd.rs/)
- [primereact](https://primereact.org/)
- [immer](https://immerjs.github.io/immer/)
- [zod](https://zod.dev) — TypeScript-first schema validation with static type inference
- [ioredis](https://github.com/luin/ioredis) — Robust Redis client for Node.js
- [dayjs](https://day.js.org/) — Parses, validates, manipulates, and displays dates and times

Dev only:

- [typescript](https://www.typescriptlang.org/)
- [tailwindcss](https://tailwindcss.com/)
- [madge](https://github.com/pahen/madge) — Helps finding circular dependencies

# RESOURCES

- https://primereact.org/datatable/
- https://nextjs.org/docs/app/api-reference/functions/use-params
- https://nextjs.org/docs/app/api-reference/components/form
