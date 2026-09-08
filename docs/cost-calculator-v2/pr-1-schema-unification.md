# PR 1: CostCalculator schema unification

Branch: `cost-calculator-v2-schema-unification`
Step 1 of 4 in the CostCalculator v2 rewrite (ships as `2.0.0`). Full rollout plan: schema unification → RHF/`checkFieldUpdates` wiring + reset semantics → Yup removal → public API finalization + `MIGRATION.md`.

## What problem this solves

Before this change, `useCostCalculator` built the form from **two separate `createHeadlessForm()` calls**:

1. One over the hand-written static schema (`jsonSchema.ts`) — country, region, currency, salary, management fee, etc.
2. One over the schema fetched live from `getV1CostCalculatorRegionsSlugFields` for the selected region (benefits, age, contract duration type — whatever that region requires).

The two resulting `.fields` arrays were then spliced together by hand (`hooks.tsx:445-449`), with a special case to keep the `management` fee field pinned last. Validation and value-parsing repeated the same split: `handleValidation` ran Yup over the static half and the dynamic form's own `handleValidation` over the region half, then hand-merged the two error sets; `parseFormValues` did the same split-then-merge for submission values. Every one of these seams was a place a bug could hide, and it made the flow structurally different from every other flow in the package, which builds one schema and calls `createHeadlessForm` once.

`src/common/invoice-schedules/` had already solved this exact problem for InvoiceSchedule: build one JSON Schema procedurally (baking in whatever's dynamically fetched), then call `createHeadlessForm` exactly once. This PR ports that pattern.

## What changed

**`src/flows/CostCalculator/jsonSchema.ts`**
The static schema's `properties`/`required`/`x-jsf-order` were pulled out into module-level constants. A new function, `buildCostCalculatorSchema({ regionSchema })`, merges those static pieces with a region schema's `properties`/`required`/`x-jsf-order` into one complete schema object — region properties are spread into `properties`, region `required` entries are concatenated, and region fields are inserted into the order array between the static fields and `management` (reproducing the exact visual order the old splice produced). The old `jsonSchema` export (the static schema wrapped in `{ data: { version, schema } }`) was deleted — once nothing built a form from it directly, it was dead code.

**`src/flows/CostCalculator/api.ts`**
`useRegionFields` used to call `createHeadlessForm` itself inside its query `select`, returning a full headless-form result. It now just returns the **raw** schema object fetched from the API (`select: ({ data }) => data?.data?.schema || {}`). Building the form is no longer this hook's job — the raw schema gets merged into the unified schema in `hooks.tsx` instead.

**`src/flows/CostCalculator/hooks.tsx`**

- `useStaticSchema` is gone. In its place: `buildCostCalculatorSchema({ regionSchema })` (memoized) produces the merged schema, and **one** `createHeadlessForm(mergedSchema, undefined, { jsfModify })` call produces `schemaForm`/`allFields` directly — no more concatenating two `.fields` arrays.
- The existing post-hoc field mutations (setting `options`/`onChange` on the country, currency, region, and hiring-budget fields after the form is built) are unchanged in behavior — they now just operate on the one unified `fields` array instead of the old static-only one. Cleaning these up is intentionally out of scope for this PR (that's part of the `checkFieldUpdates` wiring in PR 2).
- `handleValidation`'s second step used to call the _region-only_ form's own `handleValidation`. Now there's only one schema form, so that call validates the _whole_ unified schema — which would double-report on fields Yup already validates (country, currency, salary, management fee, etc.). To keep behavior identical, the result is filtered through a new `isStaticFieldPath()` helper that drops anything matching the static field names before merging it with the Yup errors. This is the one place where unifying the schema required a deliberate compensating change, not just a mechanical refactor.
- `parseFormValues` used to split incoming values into a static subset and a "rest" (region) subset and parse each separately. It now makes a single `parseJSFToValidate(values, allFields)` call, since there's only one fields array to parse against.

## What did _not_ change

- `useCostCalculator`'s returned bag — same shape, same fields, same `validationSchema` (Yup, untouched — that's PR 3's job).
- `CostCalculatorFlow.tsx`, `CostCalculatorForm.tsx`, `CostCalculatorResetButton.tsx` — zero edits. They only ever consumed the bag, not the internal schema plumbing.
- No test files were edited. The full existing `src/flows/CostCalculator/tests/` suite (77 tests) passes unmodified — that was the explicit gate for this PR, since it's meant to be invisible to consumers.

## Verification performed

- `npm run type-check` — clean
- `npx vitest run src/flows/CostCalculator` — 7 files / 77 tests pass
- `npx vitest run` (full repo) — 928 tests pass
- `npm run lint` / `npm run check-format` — clean, no new warnings

## Worth a reviewer's extra attention

- **`isStaticFieldPath`/`STATIC_FIELD_NAMES`** (`hooks.tsx`): the filter is name-based, not structural. If a region ever returns a field literally named `country`, `salary`, etc., this would silently misclassify it. Static field names are controlled by us (hardcoded in `jsonSchema.ts`) and region field names come from the API, so a collision would be a naming accident on the backend — worth a mental note, not necessarily a blocker.
- **`parseFormValues`'s single-call collapse**: passed every existing fixture, including the benefits/age/contract-duration-type region fixtures, but nobody's specifically confirmed the old two-call split wasn't quietly guarding against some region-field/static-field name collision. Low risk, but flagging it since it's a behavior-equivalence claim resting on today's test fixtures rather than a structural guarantee.
