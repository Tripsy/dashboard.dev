---
paths:
  - "src/components/form/**"
  - "src/components/window/window-form.component.tsx"
  - "src/providers/window-form.provider.tsx"
  - "src/hooks/use-form-*.ts"
  - "src/hooks/use-form-*.hook.ts"
  - "src/helpers/form.helper.ts"
  - "src/helpers/validator.helper.ts"
  - "src/app/**/*.definition.ts"
---

# Forms Protocol

**Scope:** Client-side validation and the create/update form lifecycle for dashboard entities. Rules must
match the shape the backend actually accepts — see §3 below and `../star-backend/.claude/rules/validation.md`.

## 1. Core Philosophy

- A dashboard entity's form is **declared, not hand-wired**: `<entity>.definition.ts` exports the Zod
  validator, `getFormValues`, `getFormState`, and the `create`/`update` `operationFunction`s. The generic
  `WindowForm` component (`src/components/window/window-form.component.tsx`) drives every entity through the
  same React 19 `useActionState` + `processForm` pipeline — don't hand-roll a one-off submit handler for a
  new entity form.
- `useMutation` is not used for the primary entity submit (see `data-fetching.md` §1); it's fine for a
  secondary, inline action inside a form (e.g. quick-creating a related record).

### Two form patterns — don't mix them

| | Dashboard entity forms | Public account/auth forms |
|---|---|---|
| Location | `src/app/(dashboard)/dashboard/<entity>/form-manage-<entity>.component.tsx` | `src/app/(public)/account/<flow>/` |
| Submit driven by | Generic `WindowForm`, calling `processForm()` (`helpers/form.helper.ts`) inline | A dedicated per-flow `<flow>.action.ts` (e.g. `account-edit.action.ts`) |
| Reaches backend via | `operationFunction` in `<entity>.definition.ts` → `requestCreate`/`requestUpdate` → `/api/proxy` | A `src/services/account.service.ts` function → `/api/proxy` |
| CSRF | Not used — these submit through `/api/proxy`, protected instead by the origin/referer check in `src/proxy.ts` (`isValidOrigin()`) | **Required** — see §7 |

Follow the dashboard pattern (§2–§6 below) for anything under `dashboard/<entity>/`. Follow the account
pattern only when adding a new public account/auth flow, and see §7 for its CSRF requirement.

## 2. Validator Class

```typescript
const validatorMessages = ['invalid_category', 'invalid_amount', /* ... */] as const;

class CashFlowValidator extends BaseValidator<typeof validatorMessages> {
	manage = z
		.object({
			category: this.validateEnum(CashFlowCategoryEnum, this.getMessage('invalid_category')),
			amount: this.validateNumber(this.getMessage('invalid_amount'), { required: true, onlyPositive: false, allowDecimals: 2 }),
			// ...
		})
		.superRefine((data, ctx) => {
			// cross-field rules: ctx.addIssue({ path: [...], message: ..., code: 'custom' })
		});
}
```

- Extend `BaseValidator<typeof validatorMessages>` (`src/helpers/validator.helper.ts`) and declare the
  `validatorMessages` tuple up top — it's what gives `getMessage()` its type-safe key union.
- Use the typed field helpers (`validateEnum`, `validateNumber`, `validateString`, `validateId`, ...) instead
  of raw `z.string()` / `z.number()` — they encode the project's required/optional and format conventions
  consistently.
- Cross-field rules go in `.superRefine()`, added via `ctx.addIssue({ path, message, code: 'custom' })`, not
  as a separate manual check after `safeParse`.
- Name the schema property after the form action it validates (`manage`, or `create`/`update` if they
  diverge), not a generic `schema`.

## 3. i18n and Backend Alignment

- Never hardcode a validation message string. Resolve every key in `validatorMessages` through
  `translateBatch(validatorMessages, '<entity>.validation')` inside an async `validateForm()`, then pass the
  translations into the validator's constructor.
- Before writing or changing a Zod schema here, check the authoritative shape in
  `../star-backend/src/features/<entity>/<entity>.validator.ts` (field list, required/optional, formats,
  enum values) — client and backend validation must agree on what "valid" means. The backend's own
  `../star-backend/.claude/rules/validation.md` documents its conventions (message-key resolution, partial
  update rules, etc.); mirror the *shape*, not the implementation (the backend uses `getMessage()`/i18next,
  this project uses `translateBatch()`).

## 4. Form Data Lifecycle

- `getFormValues(formData: FormData): FormValues` — parses native `FormData` into the typed values object
  using `getFormDataAsString` / `getFormDataAsNumber` / `getFormDataAsEnum` (`src/helpers/form.helper.ts`).
- `getFormState(entity?): FormStateType<FormValues>` — builds the initial state for **both** create (entity
  omitted, use field defaults) and update (entity provided, map its fields onto `values`). One function
  serves both actions; don't split into `getCreateState`/`getUpdateState`.
- `prepareParamsFromFormValues(data)` (per-entity, defined in `<entity>.definition.ts`) strips display-only
  fields and computes any derived params (e.g. net amount from gross + VAT) before the result is handed to
  `requestCreate` / `requestUpdate`.
- Display-only fields — values that exist purely to render UI feedback (a selected client's label, etc.) and
  are never sent to the backend — must be marked with a `// display-only fields, not part of validation`
  comment in the `FormValuesType`, excluded from the Zod schema, and stripped in `prepareParamsFromFormValues`.

## 5. Live Validation

`useFormValidation` (`src/hooks/use-form-validation.hook.ts`) debounces re-validation (800ms default) and
only surfaces errors for fields the user has touched, via `filterErrorsByTouched` — until the form is
submitted, at which point all errors from `accumulateZodErrors` show. Don't bypass this by validating
unconditionally on every keystroke or skipping the touched-field filter; it's what keeps a fresh "create"
form from showing every required-field error before the user has typed anything.

## 6. Field Rendering

- Use the shared components in `src/components/form/form-element.component.tsx`
  (`FormComponentInput` / `Select` / `Radio` / `Textarea` / `AutoComplete` / `Submit`) rather than raw
  `<input>`/PrimeReact elements — they wire up error display and element ids consistently.
- Inside a form, read and write field state through `useWindowForm()` (`window-form.provider.tsx`), which
  exposes `{ formValues, errors, handleChange, pending }` — don't keep a form field's value in local
  `useState` instead (a search box feeding an autocomplete is fine in local state; the field it ultimately
  sets is not).
- `handleChange` supports dotted/nested paths (e.g. `handleChange('operational_records', {...})` for a
  nested object) — use this instead of manually merging nested state.

## 7. Public Account/Auth Forms (the other pattern)

Login, register, password recover/update, email confirm/update, and account edit/delete each have their own
`<flow>.action.ts` + `<flow>.definition.ts` + `<flow>.component.tsx` — they do not go through `WindowForm`.
For this pattern only:

- The component wires `useActionState` directly to the exported action function (e.g.
  `useActionState(accountEditAction, initState)`), not to `processForm`.
- The action function must call `isValidCsrfToken(formData)` (`src/helpers/session.helper.ts`) as its first
  check, before parsing/validating form values, and return a `csrfError` situation if it fails.
- The component must render `<FormCsrf />` (`src/components/form/form-csrf.tsx`), which fetches a token from
  `/csrf` and injects it as a hidden field — omitting it makes every submission fail CSRF validation.
- Everything else (validator class, `getFormValues`, debounced `useFormValidation`, shared field components)
  follows the same conventions as §2–§6.
