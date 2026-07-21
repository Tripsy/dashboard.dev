---
paths:
  - "src/stores/**"
  - "src/app/**/_providers/data-table.provider.tsx"
  - "src/components/window/**"
---

# Client State Protocol

**Scope:** Zustand store conventions, and what belongs in a store vs. local component state vs. server cache.

## 1. Core Philosophy

Zustand owns **transient client/UI state** only:

- Data-table state: pagination, sort, filters, row selection.
- The modal/window stack: which windows are open, minimized, focused.

It does **not** own:

- Server data (list results, entities) — that's TanStack Query's job, cached by query key. See
  `data-fetching.md`.
- Form field values while a form is open — that's React 19 `useActionState`, owned by `WindowForm` /
  `useFormValues`. See `forms.md`.

If you're about to add a field to a Zustand store, first check it isn't actually server data or form state
that belongs in one of those two places instead.

## 2. Two Store Shapes — Pick Deliberately

**Singleton, app-wide** — `src/stores/window.store.ts` (`useModalStore`): a single `create<WindowStore>()`
for the whole app, holding the open window/modal stack (`open`, `close`, `closeAll`, `minimize`, `focus`,
`getWindow`, `getCurrentWindow`). Use this shape for state that is inherently global — there is only one
modal stack in the app, so it doesn't need per-instance isolation.

**Per-instance, scoped via Context** — `src/stores/data-table.store.ts` (`createDataTableStore(section,
dataSource, initialState)`): a *factory* that returns a fresh store, instantiated once per data-table inside
`src/app/(dashboard)/_providers/data-table.provider.tsx` and handed down through React Context
(`DataTableContext`). Every entity's list view (`user`, `brand`, `cash-flow`, ...) — and, if the same entity's
table is ever rendered twice on one page — gets its own isolated store instance instead of colliding in one
shared slot.

When adding a new kind of "many independent instances of the same widget" state, follow the data-table
factory-plus-Context shape, not a single global `create()`.

## 3. Slice Pattern

Split a store's state into composable slice factories instead of one flat state object:

```typescript
export const createDataTableSlice = (initialState: DataTableStateType):
	StateCreator<DataTableStore, [['zustand/immer', never]], [], DataTableSlice> =>
	(set) => ({
		tableState: structuredClone(initialState),
		updateTableState: (newState) => set((state: Draft<DataTableSlice>) => { /* ... */ }),
	});
```

Combine slices inside the final `create()` call by spreading each factory's output. Add a new concern (e.g.
a new piece of per-table UI state) as a new slice, not by bloating `DataTableSlice` or
`DataTableSelectionSlice` directly.

## 4. Middleware Stack

Every store here uses `immer` + `devtools` + `persist`:

- **immer** — mutate `state.x = y` directly inside `set((state: Draft<...>) => { ... })`; don't hand-write
  spread-based immutable updates.
- **devtools** — store name is passed for Redux DevTools visibility.
- **persist** — data-table stores persist to `localStorage` under `datatable-store-<section>-<dataSource>`,
  via a `partialize` function that **only** persists `tableState` and `selectedEntries` (not `isLoading`).
  If you add a new top-level field to the data-table store, decide explicitly whether it belongs in
  `partialize` — don't assume everything in the store state is persisted.

## 5. Access Pattern

Read via `useStore(store, selector)` (`zustand/react`) with a narrow selector per piece of state:

```typescript
const tableState = useStore(dataTableStore, (s) => s.tableState);
const selectedEntries = useStore(dataTableStore, (s) => s.selectedEntries);
```

Don't destructure the whole store (`const { tableState, selectedEntries } = useStore(dataTableStore)`) — a
narrow selector per value is what lets Zustand skip re-renders for components that only care about one slice.

## 6. Local Component State

Anything not shared beyond a single component — a search box's in-progress text before it's fed into a
query, a toggle, "is this dropdown open" — stays in plain `useState`. Don't promote it to a Zustand store
just because one already exists nearby for the surrounding feature; see the `searchClient` /
`searchEmployee` / `searchVendor` local-state pattern in `form-manage-cash-flow.component.tsx`, each feeding
its own `useRemoteAutocomplete` call.
