# PR 2: RHF wiring + reset semantics

Branch: `cost-calculator-v2-schema-unification`
Step 2 of 4 in the CostCalculator v2 rewrite. Builds on [PR 1: schema unification](pr-1-schema-unification.md).

## What problem this solves

`CostCalculatorFlow.tsx` built its own `useForm()` instance by hand instead of using the shared `useJSONSchemaForm` hook every other flow (Onboarding, ContractorOnboarding, Termination, InvoiceSchedule, …) uses. Two concrete bugs fell out of that:

1. **No `checkFieldUpdates`/`fieldValues` pipeline.** The form's live values were never fed back into the schema form, and `JSONSchemaFormFields` never received `fieldValues`/`fieldsets`, so field-level dynamic properties (visibility, computed values) couldn't react to what the user typed the way they do in every other flow.
2. **Reset went to stale defaults.** `form.reset()` with no arguments reverts React Hook Form to whatever `defaultValues` object it captured the first time it rendered — RHF only ever reads `defaultValues` once, at mount. Currency- and region-dependent defaults (the management fee, mainly) were computed _after_ mount in a `useEffect`, so by the time a user hit Reset, `form.reset()` reverted past that correction back to the original, wrong snapshot.

## What changed

**`hooks.tsx`**

- `useCostCalculator` gained `fieldValues` state and a `checkFieldUpdates` callback (`setFieldValues`), and now passes the live `fieldValues` as `createHeadlessForm`'s second argument so the unified schema's conditionals re-evaluate against current input — the same mechanism InvoiceSchedule and Onboarding use.
- The bag now also returns `resetKey` (see below), `fieldValues`, `checkFieldUpdates`, and `meta['x-jsf-fieldsets']` (alongside the existing `meta.fields`).
- `resetForm()` now takes an optional `{ remount?: boolean }` (default `true`). When remounting, it bumps `resetKey` in addition to its existing `selectedCountry`/`selectedRegion` reset.

**`CostCalculatorFlow.tsx`** — split into two components:

- **Outer `CostCalculatorFlow`** (never remounts): owns `formId`, the local `currency` state, `onCurrencyChange`, and the `useCostCalculator(...)` call. It renders the inner component with `key={`cost-calculator-${costCalculatorBag.resetKey}`}`.
- **Inner `CostCalculatorFlowInner`** (remounts whenever `resetKey` changes): computes the RHF `defaultValues` object and calls `useJSONSchemaForm(...)` instead of a bare `useForm(...)`. Because a `key` change fully unmounts and remounts this component, a reset now genuinely re-derives `defaultValues` from current props/state rather than reverting to a months-old RHF snapshot — the actual fix for bug 2 above.
- `onCurrencyChange` lives in the outer component (it has to — it's passed into `useCostCalculator`'s `options` before the bag, and therefore the form, exists) but needs to call `form.setValue(...)` on whichever form instance is currently mounted. It reaches it through a `formRef` that the inner component assigns to on every render — a small bridge, not a lifted form instance.
- The existing post-mount `useEffect` that corrects the management fee once `currencies` finishes loading was kept, just relocated into the inner component. It wasn't worth trying to eliminate for this PR — the render-prop pattern already means consumers gate on `costCalculatorBag.isLoading` before rendering `CostCalculatorForm`, so the loading race it handles doesn't have the same "user sees wrong value" consequence the reset bug did.

**`CostCalculatorForm.tsx`**

- Passes `fieldValues`/`fieldsets` to `JSONSchemaFormFields` (previously only `fields`).
- `shouldResetForm`: drops the explicit `form.reset()` call — `resetForm()`'s `resetKey` bump now handles it via remount.
- `resetFields` (the partial-reset prop, e.g. `resetFields={['country']}`): calls `resetForm({ remount: false })` instead of `resetForm()`, so the country/region _business state_ clears without remounting the RHF form — a remount here would discard every other field the user had already filled in, which is exactly what this prop exists to preserve.

**`CostCalculatorResetButton.tsx`**: now calls only `resetForm()` — the button no longer needs to call `form.reset()` itself.

## A deliberate reversal worth knowing about

The original plan draft suggested that `resetFields`'s blanked values should come from the same reactive `defaultValues` a full reset would use, "for consistency." Implementing that required threading `defaultValues` through `CostCalculatorContext`. But an existing test — `"should reset form the country and region when the 'resetFields' is passed"` — configures the flow with `defaultValues={{ countryRegionSlug: 'POL', ... }}` and expects the country field to end up **blank** after `resetFields={['country']}`, not reverted back to `'POL'`.

That's correct, existing, intentional behavior: `resetFields` exists so a user can pick a _different_ country after submitting an estimate, not to snap back to whatever default the consumer configured. A full reset (Reset button / `shouldResetForm`) legitimately means "back to the configured defaults"; `resetFields` means "let me choose again." These are different operations with different correct answers, and the plan's "for consistency" framing was wrong. The fix: keep `resetFields`'s original hardcoded `''`, and don't add `defaultValues` to the context at all — it would have been dead surface area with no real consumer.

## What did _not_ change

- Yup, `buildValidationSchema`, and `SalaryField.tsx`'s imperative sync — all untouched, reserved for PR 3.
- `useCostCalculator`'s pre-existing return fields (`fields`, `validationSchema`, `handleValidation`, `parseFormValues`, `resetForm`'s zero-arg call shape, etc.) — only additions, no removals or shape changes to what already existed.

## Verification performed

- `npm run type-check` — clean
- `npx vitest run src/flows/CostCalculator` — 7 files / 77 tests pass
- `npx vitest run` (full repo) — 928 tests pass
- `npm run lint` / `npm run check-format` — clean, no new warnings (one pre-existing `no-unsafe-optional-chaining` warning in `hooks.tsx` predates this branch)

## Test changes in this PR

Unlike PR 1 (which required zero test edits by design), this PR's test-migration section explicitly allowed edits where the reset _mechanism_ changed but the user-visible outcome shouldn't have:

- **`CostCalculatorFlow.test.tsx` — no edits needed.** Every `resetFields`/`shouldResetForm`/currency-change test passed once the reversal above was in place.
- **`CostCalculatorResetButton.test.tsx`** — removed the `mockFormReset` mock and its 4 call-count assertions (`expect(mockFormReset).toHaveBeenCalledTimes(1)`), since the button no longer calls `form.reset()` directly. Kept the `mockResetForm`/`mockOnClick` assertions, which describe what the user actually triggers, not which internal function fires.

## Worth a reviewer's extra attention

- **The `formRef` bridge** in `CostCalculatorFlow.tsx`: `CostCalculatorFlowInner` assigns `formRef.current = form` directly in its render body (not inside an effect), so the outer component's `onCurrencyChange` always calls `setValue` on whichever form instance is currently mounted. Writing to a ref during render is a narrow, deliberate exception to "render must be pure" — it's read only from an event handler (`onCurrencyChange`), never during another component's render — but it's worth a second pair of eyes given how easy this pattern is to misuse elsewhere.
- **The kept currency-loading-race `useEffect`**: still lives in the inner component, still calls `form.setValue` directly. It's pre-existing behavior carried forward unchanged in spirit, not new imperative glue, but it's exactly the kind of effect the broader v2 effort is trying to move away from — worth confirming it's still pulling its weight once PR 3 (which removes the `SalaryField` imperative sync) sets a precedent for what the "acceptable" cross-field side effect looks like.
