# PR 3: Yup removal

Branch: `cost-calculator-v2-schema-unification`
Step 3 of 4 in the CostCalculator v2 rewrite. Builds on [PR 1: schema unification](pr-1-schema-unification.md) and [PR 2: RHF wiring + reset semantics](pr-2-rhf-wiring-and-reset.md).

## What problem this solves

CostCalculator was the only flow left in the package still using Yup. `buildValidationSchema` (`utils.ts`) hand-built a parallel Yup validation schema — conditional-required logic for `salary`/`salary_conversion`, min/max + a custom error message for the management fee, conditional-required for `estimation_title` — that duplicated what the JSON Schema itself could express natively via `allOf`/`x-jsf-errorMessage`/conditional `required`. Every other flow (Termination, InvoiceSchedule, Onboarding, …) expresses exactly this kind of conditional validation directly in the schema; CostCalculator was the outlier.

Separately, `SalaryField.tsx` had 4 manual `setValue` calls inline in a `useEffect`, deciding which of `salary`/`salary_conversion` should carry the user's input forward when the employer/employee currencies swap — untestable in isolation and easy to get subtly wrong.

## What changed

**`jsonSchema.ts`** — `buildCostCalculatorSchema` now takes three more inputs and bakes their effects directly into the schema:

- `employerBillingCurrency` → `management.properties.management_fee` gets `minimum: 0`, `maximum: BASE_RATES[currency]`, and `'x-jsf-errorMessage': { maximum: <message> }` — the exact same message text the removed Yup `.max()` produced (`Management fee cannot exceed ${maxValue / 100} ${currency}`), verified against the actual test assertion.
- `showEstimationTitleField` → conditionally adds `'estimation_title'` to the schema's top-level `required`.
- `hasChildRegions` → conditionally adds `'region'` to `required` (replacing a Yup-based override that used to live in `hooks.tsx`, see below).
- A new `allOf` entry (`salaryRequiredWhenSelected`, modeled on InvoiceSchedule's `semiMonthlyConditional()`) makes `salary` required only when `salary_converted === 'salary'`, and `salary_conversion` required only when `salary_converted === 'salary_conversion'` — replacing Yup's `.when('salary_converted', ...)`.

**`hooks.tsx`**

- The region field's manual `.schema =`/`.required =` overrides (which used Yup's `string().required(...)`) are gone. Now that `hasChildRegions` bakes region-requiredness into the schema itself, the library's own generated field already reflects it correctly — confirmed by the existing `hooks.test.tsx` assertion (`regionField?.required === true`) still passing unmodified. `.options`/`.isVisible`/`.onChange` are untouched — those are rendering concerns, unrelated to Yup.
- `handleValidation` collapsed from a ~50-line two-validator merge down to three lines: fire `onValidation`, parse, call `schemaForm.handleValidation(parsedValues)` — the same shape InvoiceSchedule's `handleValidation` already uses.
- Removed: `buildValidationSchema`'s call site and the `validationSchema` it produced (including from the returned bag — there's no way to keep a Yup-typed field once Yup itself is gone, so this technically lands a piece of the "public API finalization" work a PR earlier than the plan originally filed it under), the `JSFValidationError` type, `STATIC_FIELD_NAMES`/`isStaticFieldPath` (no longer needed — there's only one validator now, nothing to filter), the `yup` import, and the now-unused `iterateErrors` import.

**`utils.ts`**

- `buildValidationSchema` deleted, along with its Yup imports (`AnyObjectSchema`, `number`, `object`) and the now-unused `CurrencyKey` type import.
- Added `syncSalaryConversion(values, shouldSwapOrder, fieldName, defaultValue)` — a pure function extracted from `SalaryField.tsx`'s inline logic. Given the current form values and whether the currencies are swapped, it returns the `{ field: value }` patch that needs applying (or `null` if nothing needs to change), reproducing the exact same fallback-to-`defaultValue` behavior the old inline `if`/`else` chain had.

**`components/SalaryField.tsx`**

- The `useEffect` now calls `syncSalaryConversion(...)` and applies whatever patch it returns via a small local `applySalarySync` helper, instead of containing the raw decision logic inline.

## A deliberate choice worth knowing about: where the sync logic lives

The plan's original framing suggested centralizing this sync inside `checkFieldUpdates` (in `hooks.tsx`), matching how Onboarding documents one "extra" thing its `checkFieldUpdates` does beyond bookkeeping. That turned out to conflict with PR 2's structure: `checkFieldUpdates` is created in the _outer_, non-remounting `CostCalculatorFlow` component, but the actual RHF `form.setValue` needed to apply a patch lives in the _inner_, remountable `CostCalculatorFlowInner`. Reaching it would mean extending the `formRef` bridge PR 2 introduced for `onCurrencyChange` to a second, unrelated purpose, and reproducing `shouldSwapOrder`'s derivation (currently a closure inside `hooks.tsx`) at the `checkFieldUpdates` call site too — real added plumbing for no behavioral difference.

Instead, the _decision logic_ was extracted into `syncSalaryConversion` (pure, independently unit-testable, no RHF dependency) while the _invocation site_ stayed in `SalaryField.tsx`'s existing effect. This satisfies the actual goal — no more ad-hoc inline decision logic — without forcing a cross-component ref just to relocate a call site.

## What did _not_ change

- The user-facing management fee error message text — verified character-for-character identical to what Yup produced.
- JSF's own default "this field is required" message already reads `"Required field"` — the same text Yup's `.required('Required field')` used, so no explicit override was needed for the conditional-required cases.
- `useCostCalculator`'s other bag fields, `CostCalculatorFlow.tsx`, `CostCalculatorForm.tsx`, `CostCalculatorResetButton.tsx` — no changes beyond what PR 2 already made.

## Verification performed

- `npm run type-check` — clean
- `grep -rn "from 'yup'" src/flows/CostCalculator` — zero matches
- `npx vitest run src/flows/CostCalculator` — 7 files / 77 tests pass
- `npx vitest run` (full repo) — 928 tests pass
- `npm run lint` / `npm run check-format` — clean, no new warnings

## Test changes in this PR

**None.** Every test in `hooks.test.tsx`, `CostCalculatorFlow.test.tsx` (including the management-fee threshold test, the currency-change-updates-management-fee test, and all four salary-preservation-across-currency-change tests — the highest-risk regression surface per the plan), and every other CostCalculator test file passed unmodified. This is better than the plan's test-migration section anticipated (it allowed for edits here).

## Worth a reviewer's extra attention

- **The management fee `maximum` fallback changed slightly at the edges**: the old Yup code used `employerBillingCurrency ? BASE_RATES[key] : BASE_RATES.USD` (so an `employerBillingCurrency` that isn't a valid `BASE_RATES` key would silently produce `undefined`, effectively no max). The new schema-native version uses `BASE_RATES[currency] ?? BASE_RATES.USD` (an invalid currency now falls back to USD's cap instead of no cap at all). This is arguably a small correctness improvement, not a regression, but it is a behavior difference in an edge case no test currently exercises.
- **`validationSchema`'s removal from the bag** landed here rather than in PR 4 as the plan originally filed it — flagging so the eventual `MIGRATION.md` entry (PR 4) correctly attributes when this became a breaking change, not "as of 4."
