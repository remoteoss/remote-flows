# useHeadlessForm rollout

Every flow builds its JSON Schema forms through one shared hook, [`src/common/useHeadlessForm.ts`](../src/common/useHeadlessForm.ts), instead of calling `createHeadlessForm` directly. Once that's done, every form builds once and resolves conditional fields through validation. This doc tracks the migration so it can happen over many PRs.

## Why

- Each flow has its own hand-written copy of the build and validate logic. Each copy can break on its own (the money-in-cents bug fixed in #1429 is one example), and no shared test catches it.
- With one hook, [`jsfEngineContract.test.tsx`](../src/common/tests/jsfEngineContract.test.tsx) tests schema situations once, across engines and strategies. Each flow only needs one smoke test proving it goes through the hook.
- Rebuilding the form on every change is why the money pre-fill conversion and `transformMoneyFields` exist. Building once removes the need for both.

## Strategies

- **`rebuild`** (old): `createHeadlessForm(schema, values, options)` again whenever values change. Money values are converted to cents at build time.
- **`buildOnce`** (new): built once per `schema`/`options`, with `transformMoneyFields: false`. Conditionals are resolved by `handleValidation` with `isPartialValidation: true`. The first build is seeded with `initialValues` (saved values in API units), so visibility is right without a mounted step. When `jsfModify` changes, the form is rebuilt from the last validated values; a new schema starts again from `initialValues`.

## Phases

### Phase 1: move every call site onto the hook, same behaviour

Pure refactor. Each call site keeps the strategy it effectively has today, so nothing a user sees should change. Each PR adds one smoke test per flow. The test must fail when the hook is broken, not just pass with it.

Call sites that don't pass values already behave like `buildOnce`, so they go straight onto it.

A `rebuild` step can also skip this phase and go straight onto `buildOnce` when it passes the phase 2 checklist. Basic information did this in #1433.

Importing `createHeadlessForm` is banned by `no-restricted-imports` in `.oxlintrc.json`. Call sites that haven't moved yet carry a `// oxlint-disable-next-line no-restricted-imports -- TODO` comment on the import, so `grep -rn "no-restricted-imports -- TODO" src` lists what's left. Lint also fails on unused disable comments, so a PR that moves a file onto the hook has to delete that file's comment too.

### Phase 2: switch `rebuild` steps to `buildOnce`, one step per PR

For each step, test all of these before switching (they come from #1430):

- [ ] Starting from scratch
- [ ] `initialValues` provided by the partner
- [ ] Existing `employmentId` (server values already in cents, so they must not be converted twice)
- [ ] Read-only employment that jumps straight to review without mounting the step (`prettifyFormValues` drops invisible fields)
- [ ] Partner passes `options` inline, which creates a new `jsfModify` reference on every render
- [ ] Headless `use<Flow>()` consumers with a custom UI, which don't mount our step components

### Phase 3: cleanup

- [ ] Remove the `rebuild` strategy from `useHeadlessForm`
- [ ] Remove `transformMoneyFields` and the pre-fill money conversion from `createHeadlessForm`
- [x] Add an oxlint `no-restricted-imports` rule that bans importing `createHeadlessForm`
- [ ] Remove the last `no-restricted-imports -- TODO` disable comment

## Call sites

Status: `todo`, `phase 1` (on the hook, old behaviour), `done` (on the hook with `buildOnce`).

### Pass values (rebuild today)

| Call site                                                          | Status  | Notes                                                                                                                          |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Onboarding `useLegacyContractDetailsSchema`                        | phase 1 | #1433. Only building moved; validation and submit parsing still go through the hand-written branches in `Onboarding/hooks.tsx` |
| Onboarding basic information `useBasicInformationSchema`           | done    | #1433. Went straight to `buildOnce`; building, validation and submit parsing all go through the hook                           |
| Onboarding `useJSONSchemaForm`                                     | todo    | No Onboarding step uses it anymore; only `JsonSchemaComparison` does                                                           |
| Onboarding `useBenefitOffersSchema`                                | todo    |                                                                                                                                |
| Onboarding `useEngagementAgreementDetailsSchema`                   | todo    |                                                                                                                                |
| Contractor contract details `useContractorOnboardingDetailsSchema` | todo    | Money-sensitive                                                                                                                |
| ContractorOnboarding `useGetContractDocumentSignatureSchema`       | todo    |                                                                                                                                |
| ContractorOnboarding `useGetEligibilityQuestionnaire`              | todo    |                                                                                                                                |
| ContractorOnboarding `useGetContractOriginSchema`                  | todo    |                                                                                                                                |
| Invoice schedules `useGetCreateInvoiceScheduleSchema`              | todo    | Money-sensitive                                                                                                                |
| ContractAmendment `useContractAmendmentSchemaQuery`                | todo    | Money-sensitive                                                                                                                |
| CreateCompany `useAddressDetailsSchema`                            | todo    |                                                                                                                                |
| Termination `useTerminationSchema`                                 | todo    |                                                                                                                                |
| PayrollAdminOnboarding `useGPFormSchema`                           | todo    |                                                                                                                                |
| PayrollAdminOnboarding `useGPCountrySelectSchema`                  | todo    |                                                                                                                                |
| PayrollEmployeeOnboarding `useGPEmployeeFormSchema`                | todo    |                                                                                                                                |
| JsonSchemaPlayground `useJsonSchemaPlayground`                     | todo    | Only exported from `internals`, so it's the lowest priority                                                                    |

### Already build once (no values)

| Call site                                                   | Status | Notes                                                     |
| ----------------------------------------------------------- | ------ | --------------------------------------------------------- |
| Onboarding `useContractDetailsSchema` (jsf v1)              | done   | #1433                                                     |
| Onboarding `useCountriesSchemaField`                        | todo   |                                                           |
| ContractorOnboarding `useCountriesSchemaField`              | todo   |                                                           |
| ContractorOnboarding `useContractorSubscriptionSchemaField` | todo   |                                                           |
| ContractorOnboarding `useGetInvoiceScheduleSchema`          | todo   |                                                           |
| CreateCompany `useCountriesSchemaField` (basic information) | todo   |                                                           |
| CostCalculator `useStaticSchema` + `useRegionFields`        | todo   | Combines several forms; needs a design per sub-form first |
| Termination full schema in `useTermination`                 | todo   | Combines several forms; needs a design per sub-form first |

## Known behaviour until phase 2

On a prefilled legacy contract details step, the first render converts server values that are already in cents a second time. A probe on a PRT employment computed the allowance as `8125770` before it settled on `81257` once the step mounted. Users never see this. Anything that reads the form before the step mounts could, and that hasn't been verified. The problem goes away once that step switches to `buildOnce`.
