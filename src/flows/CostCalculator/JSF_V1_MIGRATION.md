# Cost Calculator: migration to JSON-Schema-Form v1 (removing Yup)

## Why

Cost Calculator was the last flow in the repo still using Yup. Its static
schema (`jsonSchema.ts`) was never tagged with `x-rmt-meta.jsfVersion: '1'`,
so it fell back to the deprecated v0 engine, which returns a Yup
`AnyObjectSchema` per field. `utils.ts` then hand-built a second Yup object
schema (`buildValidationSchema`) on top of that to express three custom
rules Yup could do but the raw v0 schema couldn't: a conditional-required
salary pair, a currency-dependent max on the management fee, and a
conditionally-required estimation title. `hooks.tsx#handleValidation` ran
that Yup schema *and* the v1 region-fields validator side by side and
stitched the two error shapes together.

Tagging the static schema `jsfVersion: '1'` lets the native JSON-Schema-Form
v1 engine (`@remoteoss/json-schema-form`, no Yup/Zod dependency) handle all
of it, so both static and region validation go through the same
`handleValidation()` contract and Yup drops out of Cost Calculator entirely.

`WorkScheduleFieldDefault.tsx`'s unrelated `yupResolver` (from
`@hookform/resolvers/yup`) is untouched — it doesn't use `iterateErrors` or
this schema, so the `yup` package itself stays a dependency (that field is
out of scope here; see the `work-schedule` cleanup note in memory for a
possible separate future removal).

## What changed

| File | Change |
|---|---|
| `jsonSchema.ts` | Added `x-rmt-meta.jsfVersion: '1'`. Replaced the unconditional `required: ['salary', 'salary_conversion', ...]` with an `allOf`/`if`/`then` pair: `salary` is required only when `salary_converted === 'salary'`, `salary_conversion` only when `salary_converted === 'salary_conversion'`. Added static `minimum: 0` + its error message to `management_fee` (was a Yup `.min(0, ...)`). Added a static `x-jsf-errorMessage.required` on `region` (previously a Yup `.required('Region is required')`). |
| `hooks.tsx` | Removed the `buildValidationSchema` call and the `validationSchema` field from the returned bag. `management_fee`'s currency-dependent `maximum` + its error message (`Management fee cannot exceed X CCY`) are now injected per-render via `jsfModify.fields.management` — same place `employerBillingCurrency` was already being injected into `x-jsf-presentation`. Added a `jsfModify.required` function that conditionally adds `region` (when the selected country has child regions) and `estimation_title` (when `includeEstimationTitle` is set) — this replaces a `regionField.schema = yup.string().required(...)` assignment that had become dead code once the field stopped carrying a Yup schema. `handleValidation` now calls `fieldsJSONSchema.handleValidation(parsedValues)` (static fields) and `jsonSchemaRegionFields?.handleValidation(parsedValues)` (region fields) and shallow-merges their `formErrors` — the two field sets are disjoint (region fixtures only ever contribute `age`/`benefits`/`contract_duration_type`, never a static-schema key), so no deep-merge is needed. |
| `utils.ts` | Deleted `buildValidationSchema` and its Yup imports entirely. |
| `src/components/form/validationResolver.ts` | Deleted `iterateErrors` — it converted a Yup `ValidationError` into a `formErrors`-shaped object and was explicitly marked `// TODO: deprecated only used in the CostCalculatorFlow`. Nothing else called it. |

No changes were made to `WorkScheduleFieldDefault.tsx`, the `yup` package
dependency, or any other flow.

## Breaking change

`useCostCalculator()`'s returned bag (and therefore the `CostCalculatorFlow`
render-prop bag) changes shape:

- `validationSchema` (previously a Yup `AnyObjectSchema`) is **removed**.
- `handleValidation()` now resolves to `{ formErrors }` only — the
  `yupError` field is **removed**.

Nothing in this repo's `example/` app or `index.tsx` public exports
referenced either field, and no test asserted on them beyond `formErrors`
(checked via `toMatchObject`), but any external consumer introspecting
`ReturnType<typeof useCostCalculator>` or reading `.validationSchema` /
`.yupError` directly would break. This needs a `BREAKING CHANGE:` footer
in the eventual commit/changelog per this repo's conventional-commit release
process — it should not ship as a plain `refactor:`/`fix:`.

The `README.md` field-reference table under `src/flows/CostCalculator/`
still documents `validationSchema` — it needs a matching update before this
merges (not yet done).

## Verification status

- `npm run type-check` — clean.
- `npx vitest run src/flows/CostCalculator` — **73/77 passing**. All 4
  failures are in `CostCalculatorFlow.test.tsx`:
  - `should call onErrorWithFields callback when estimation fails`
  - `should load, fill and submit form with regional fields`
  - `should reset form after successful submission when shouldResetForm is true`
  - `should reset form the country and region when the 'resetFields' is passed`

  All four fail the same way: at submit time, `costCalculatorBag.fields`
  finds the `currency` field with `options: []` (instead of the loaded
  currency list), which cascades into a wrong/missing `userFriendlyLabel`
  or a validation error blocking submit. Debug instrumentation (since
  removed) confirmed the currency-options mutation in `hooks.tsx` *does*
  run correctly on every render — the field object read at submit time in
  `CostCalculatorForm.tsx` is from an earlier render, one where the
  `currencies` query hadn't resolved yet.

  This is suspicious rather than confirmed: `isLoading` in `hooks.tsx` is
  computed as `isLoadingCountries && isLoadingCurrencies &&
  isLoadingRegionFields` (AND, not OR), so the hook reports "done loading"
  as soon as *any one* of the three queries resolves, even if the other two
  are still pending. That pre-existing bug means these tests were always
  racing MSW's response timing rather than deterministically waiting for
  currencies to load — it's plausible this migration just shifted timing
  enough to lose a race that used to be won by luck, rather than actually
  breaking currency-options propagation. This needs to be run a handful of
  times (and ideally against `main` too) to tell "flaky pre-existing test"
  apart from "real regression" before deciding whether the fix belongs in
  this migration (native v1 field-object churn) or as a separate fix to the
  `isLoading` `&&`/`||` bug.

## Browser crash found while testing: "Deep clone failed" on load

While manually testing in the example app, `CostCalculatorWithPremiumBenefits`
crashed on initial render with:

```
Uncaught Error: Deep clone failed: Object may contain circular references or non-serializable values
  at createHeadlessForm (createHeadlessForm.tsx:101:8)
  at useStaticSchema (hooks.tsx:74:10)
  ...
```

**Root cause: demo code, not the library.** JSON-Schema-Form v1 deep-clones
the schema on every `createHeadlessForm()`/`handleValidation()` call (to
support `x-jsf-logic`/`if`-`then` re-evaluation) — v0 never did this, so it
never mattered there. `example/src/CostCalculatorWithPremiumBenefits.tsx`
passed a **literal, already-rendered JSX element** as
`jsfModify.fields.currency['x-jsf-presentation'].description`:

```tsx
currency: {
  title: 'Employer billing currency',
  'x-jsf-presentation': {
    description: (
      <>
        Select the currency...
        <ZendeskTriggerButton zendeskId={zendeskArticles.internationalPricing}>
          Learn more ↗
        </ZendeskTriggerButton>
      </>
    ),
  },
},
```

Because this JSX is constructed inline during the demo component's own
render, it carries a real `_owner` fiber reference (genuinely circular) —
`structuredClone` throws on it (as it does on any function/symbol), and
unlike a bare/unrendered element, the `JSON.stringify` fallback *also*
throws, since fiber trees are actually self-referential. A plain function
(`description: () => (<>...</>)`) would dodge the clone crash but doesn't
fix rendering — none of the default field renderers call `description` as a
function, so it would render nothing (or React's "functions are not valid
as a child" warning).

**Fix applied** (`example/src/CostCalculatorWithPremiumBenefits.tsx`): use
the already-supported `meta.helpCenter` mechanism instead — confirmed live
in `SelectFieldDefault.tsx` (`fieldData.meta?.helpCenter` → `<HelpCenter>` →
`ZendeskTriggerButton`), which takes a plain, JSON-safe
`{id, callToAction}`:

```tsx
currency: {
  title: 'Employer billing currency',
  description: "Select the currency you want to be invoiced in for this employee's services.",
  'x-jsf-presentation': {
    meta: {
      helpCenter: {
        id: zendeskArticles.internationalPricing,
        callToAction: 'Learn more ↗',
      },
    },
  },
},
```

This is the same convention already documented for `estimation`/salary
descriptions via the `split_salary_description` feature (see
`CostCalculatorFeatures` in `types.ts`) — `description` stays a plain
string, richer content goes through `meta`, and the field renderer builds
the actual link. **Any other demo or consumer code that embeds a rendered
element directly into a schema's `description` (top-level or under
`x-jsf-presentation`) will hit the same crash once tagged `jsfVersion: '1'`**
— this is worth a broader audit before rolling v1 out to more schemas.

## Suggested next steps

1. Re-run `npx vitest run src/flows/CostCalculator/tests/CostCalculatorFlow.test.tsx`
   a few times, and once on `main`, to establish whether the 4 failures are
   flaky-on-main too or specific to this branch.
2. If specific to this branch: instrument `isLoadingCurrencies` at the
   point `CostCalculatorForm`'s `handleSubmit` closure is captured, to
   confirm the stale-currencies-query theory before changing anything.
3. Update `src/flows/CostCalculator/README.md`'s field table (remove
   `validationSchema`, adjust `handleValidation`'s described return shape).
4. Decide the conventional-commit footer (`BREAKING CHANGE: ...`) wording
   for `validationSchema`/`yupError` removal before shipping.
