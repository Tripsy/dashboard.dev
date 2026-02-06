# Adding new model for `dashboard` (ex: `cars`)

1. Create `lib/entities/cars.model.ts` from `lib/entities/users.model.ts`
2. Duplicate `src/(dashboard)/dashboard/users` > `src/(dashboard)/dashboard/cars` & rename files
    1. page.tsx
    2. cars.definition.ts
    3. data-table-cars.component.tsx
    4. form-manage-cars.component.tsx
    5. data-table-cars-filters.component.tsx
3. Update data-source.config.ts
    - export type DataSourceType = {
    - export const DataSourceConfig: {
4. Add `cars.json` to `src/locales/[language]` & update src/locales/en/index.ts
5. Update `RoutesSetup.group('dashboard')` in `src/config/routes.setup.ts`
6. Create `lib/services/cars.service.ts` from `lib/services/users.service.ts`
7. Update `src/app/(dashboard)/_components/side-menu.component.tsx`
8. Update PermissionEntitiesSuggestions & LogHistoryEntities