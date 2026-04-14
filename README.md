# NReady Dashboard

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-MIT-green)

# 📄 Description

(Dashboard) is a demo frontend implementation using [NReady](https://github.com/Tripsy/nready) as a backend API.

This boilerplate provides an authentication system (login, register, recover password, account pages, etc.)
and includes an administration dashboard (users, cron-history, log-history, log-data, mail-queue, permissions, 
templates, clients, client-address, places, brands, cash-flow, etc.)

This project is still a work in progress, and the next goals are:
- Include additional [NReady](https://github.com/Tripsy/nready) features in the administration dashboard

Meanwhile, we're open to suggestions / feedback, and if you find this project useful, please consider giving it a star ⭐

# 🚀 Tech Stack

## Core
- Language: TypeScript 5.9
- Runtime Environment: Node.js 22
- Runtime: React 19.2
- Framework: Next.js 16.1

## Code Quality
- Linting & Formatting: Biome
- Circular Dependency Check: Madge
- Validation: Zod 4.3

## Infrastructure
- Containerization: Docker
- Security: rate limiting, input validation

# ⚙️ Characteristics

- [x] Dashboard: Administration panel with CRUD operations for users, permissions, templates, logs, etc.
- [x] Auth system: Login, register, logout, forgot password, reset password, email confirmation, etc.
- [x] Best Practices: Clean architecture, TypeScript, error handling, async patterns, DRY, SOLID, KISS
- [x] Security: rate limiting, input validation
- [x] Request validation (powered by Zod)
- [x] Language files
- [x] Providers included: Auth, Theme, Toast, QueryClient
- [x] Docker development environment
- [x] Responsive design

# ✨ Features

### Core features

- [x] (Public) 
    - Auth system: login, register, logout, forgot password, reset password, email confirmation, etc.
- [x] (Dashboard) 
    - cron-history, log-data, log-history, mail-queue, permissions, templates, users
    - brands, cash-flow, client-address, clients, places
    - // TODO 

# 🛠 Setup

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
docker exec -it dashboard.test /bin/bash
```

### 4. Install dependencies inside the container
Run the following command to install project dependencies:

```
$ pnpm install
```

### 5. Configure environment variables

Copy the `.env.example` file to `.env` and update the variables:
```bash
cp .env.example .env
```

### 6. Run the application

> **Note**
> Dashboard uses NReady as backend, so you need to run it first.

```
$ pnpm run dev
```

# 🖥️ Commands

```bash
pnpm run biome    # Lint and format
pnpm run madge    # Check for circular dependencies
pnpm run dev      # Start development server
pnpm run build    # Production build
```

# 📁 Structure

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
│   │   ├── data-source.register.ts
│   │   ├── daysjs.config.ts 
│   │   ├── init-redis.config.ts 
│   │   ├── nunjucks.config.ts 
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
├── .madgerc
├── biome.json
├── docker-compose.yml
├── next.config.ts
└── tsconfig.json
```

# 💡 How to

## Adding new model for `dashboard` (ex: `cars`)

1. Create `models/cars.model.ts` from `models/users.model.ts`
2. Duplicate `src/(dashboard)/dashboard/users` > `src/(dashboard)/dashboard/cars` & rename files
    - data-table-cars.component.tsx    
    - data-table-cars-filters.component.tsx
    - form-manage-cars.component.tsx
    - page.tsx
    - cars.definition.ts
    - view-car.component.ts 
3. Update `src/config/data-source.config.ts`
    - export type DataSourceKey
4. Update `src/config/data-source.register.ts`
5. Add `cars.json` to `src/locales/[language]` & update src/locales/en/index.ts
6. Update `Routes.group('dashboard')` in `src/config/routes.setup.ts`
7. Update `src/app/(dashboard)/_components/side-menu.component.tsx`
8. Update `src/models/permission.model.ts`
    - PermissionEntitiesSuggestions
9. Update `src/models/log-history.model.ts`
    - LogHistoryEntities

# 📌 TODO

1. Displayed dates should be converted to local TZ
2. Strange interaction on login after existing session is removed
3. App reload on tab switch - maybe a Zustand configuration issue
4. Clients > Client Address > Brands > Places > Cash Flow
    - address details
    - address manage
    - cash flow status update 
    - cash flow manage
    - cash flow details
    - add places  icons region > area, city > building, country → map
5. Review security
6. Add section "documentation"
7. login with google / facebook
8. Replace all console.error with logging
9. Implement kill all sessions except current
      // // This will actually remove all sessions - keep it for further implementation
      // await AccountTokenRepository.createQuery()
      //     .filterBy('user_id', policy.getUserId())
      //     .delete(false, true);
10. For template section
     - would be a nice idea to keep track of the last changes (maybe add a new column - prev version id and a button to restore to that version)
     - view presentation could be enhanced
11. https://nextjs.org/docs/app/getting-started/partial-prerendering
12. https://react.dev/learn/react-compiler/introduction

# 🔗 Dependencies

- [next](https://nextjs.org/)
- [react](https://reactjs.org/)
- [zustand](https://zustand.docs.pmnd.rs/)
- [primereact](https://primereact.org/)
- [immer](https://immerjs.github.io/immer/)
- [zod](https://zod.dev) — TypeScript-first schema validation with static type inference
- [ioredis](https://github.com/luin/ioredis) — Robust Redis client for Node.js
- [dayjs](https://day.js.org/) — Parses, validates, manipulates, and displays dates and times
- [TanStack  Query](https://tanstack.com/query/latest) — Powerful asynchronous state management, server-state utilities and data fetching
- [primereact](https://primereact.org/datatable/)

Dev only:

- [typescript](https://www.typescriptlang.org/)
- [tailwindcss](https://tailwindcss.com/)
- [madge](https://github.com/pahen/madge) — Helps finding circular dependencies
- [biome](https://biomejs.dev/) — Biome is a fast formatter for JavaScript, TypeScript, JSX, TSX, JSON, HTML, CSS and GraphQL
