# Contract Details Version Bump Check Plan

## Goal

When we move a country to a new `contract_details` schema version (e.g. ESP v1 → v7), prove that the flow still **submits end to end** on that version: build form → fill → validate → parse → submit → backend accepts. Works for any country, without writing a per-country e2e spec.

## Why

### The ESP v1 → v7 bump

- ESP was moved from v1 to v7 in `example/src/flows/Onboarding/constants.ts` → `jsonSchemaVersionByCountry`.
- The new version exposed validation problems that required changes to core form behaviour, not only a version pin change.
- ESP was safe to ship because it has a Playwright spec. Most of the ~90 countries don't, and each has its own version history. Writing and maintaining an e2e spec per country doesn't scale.

### How this differs from the schema canary

See [contract-details-schema-canary.md](contract-details-schema-canary.md).

|              | Canary                                              | Version bump check                                                  |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| Trigger      | Nightly, nothing changed on our side                | We deliberately change a country's version                          |
| Question     | Did tiger silently change a version we already use? | Does the target version actually submit?                            |
| Depth        | Form builds                                         | Build → fill → validate → parse → submit → backend accepts          |
| When it runs | Scheduled                                           | Before merging a `jsonSchemaVersionByCountry` change, and on demand |

Both use the same harness (below). The canary stops after building the form.

## Scope

In:

- `contract_details` step of the Onboarding flow, any country, any version.
- Two fill passes: **required only** and **everything visible**.
- Real submission against the sandbox gateway.

Out (for now):

- Other steps (`basic_information`, `benefits`, …): the seed script already fills the steps before contract details. Benefits can be added later with the same harness.
- UI behaviour (field rendering, custom components, layout): that stays with Playwright specs.
- ContractorOnboarding: same idea, separate follow-up.

## Design

### Drive the public `useOnboarding` hook, not internal functions

Contract details has two code paths in `src/flows/Onboarding/hooks.tsx`, chosen by `usesJsfV1ContractDetails` (FRA, ITA, DEU, ESP on jsf v1):

|                     | Legacy                       | jsf v1                                                        |
| ------------------- | ---------------------------- | ------------------------------------------------------------- |
| Query               | `useJSONSchema`              | `useContractDetailsSchema` with `transformMoneyFields: false` |
| `handleValidation`  | `isPartialValidation: false` | `isPartialValidation: true`, invisible values kept on purpose |
| `checkFieldUpdates` | no revalidation              | revalidates on every change                                   |

This branching is inline in `useOnboarding`. Exporting the underlying query hooks through `./internals` would force the harness to copy that branching, which is the reimplementation we want to avoid.

Instead, the harness renders the **public** `useOnboarding` hook headlessly (`renderHook` in jsdom) inside a real `RemoteFlows` provider pointed at sandbox (real network calls, no MSW). It calls the same functions the UI does, so both code paths are covered automatically.

This also works against the **published npm package**, since `useOnboarding` is public API: import from `src/` for `main`, or from `@remoteoss/remote-flows` installed in a temp dir for the released version. No new exports and no semver commitment.

### Steps, per country and version

1. **Seed**: create an employment up to (but not including) `contract_details` using the logic in `scripts/seed-onboarding.mjs` (`--env=sandbox`). Result: `employmentId`.
2. **Mount**: `renderHook(() => useOnboarding({ employmentId, countryCode, options }))`, where `options` is the example's config with the target version applied:
   `jsonSchemaVersionByCountry: { [country]: { contract_details: N } }` plus the example's `jsfModify`.
3. **Navigate** to `contract_details` via `stepState` and wait for the contract details form to load.
4. **Fill**: iterative loop, same approach as the seed script: fill every field that is currently visible (and required, in the required-only pass) with a value generated from its `inputType`, options, min/max, pattern and format. Call `checkFieldUpdates` / `handleValidation` so conditionals recompute, then repeat until no new fields appear.
5. **Validate**: `handleValidation(values)` must return no errors.
6. **Submit**: `onSubmit(values)` must resolve (it calls `parseFormValues` then `updateEmploymentMutationAsync`, same as the UI). On rejection, narrow with `isMutationError` and report `fieldErrors`.
7. **Record**: country, version, pass (required-only / full), result, validation errors or backend `fieldErrors`.

Each pass uses a fresh employment, so the required-only pass isn't polluted by values from the full pass.

### Value generation limits

Generated values break down for:

- cross-field rules (e.g. end date after start date, salary within a range that depends on another field),
- fields whose valid values depend on backend state,
- free-text fields with business rules the schema doesn't express.

When a country fails here, the fix is a small **per-country values override** file (only the fields that need it), not an e2e spec. Overrides are reviewed alongside the version change that needed them.

### Where it lives

- Script: `scripts/verify-contract-details-version.ts` (run via `tsx` with a jsdom environment), runnable locally:
  `npm run verify:contract-details -- --country=ESP --version=7 [--engine=main|published] [--pass=required|full|both]`
- Auth: sandbox credentials from `.env.sandbox`, same as `npm run seed:onboarding -- --env=sandbox`.
- Overrides: `scripts/verify-contract-details-version/overrides/<COUNTRY>.ts`.

### CI

- Workflow runs on PRs that touch `example/src/flows/Onboarding/constants.ts`: diff `jsonSchemaVersionByCountry`, run the check for each country whose version changed, at its new version, against `main`.
- Also `workflow_dispatch` with `country` + `version` inputs, to check a version before opening the PR.
- Output: markdown table in `$GITHUB_STEP_SUMMARY`:

  | Country | Version | Pass | Result | Errors |
  | ------- | ------- | ---- | ------ | ------ |

- Fails the job if any pass fails.

## Phases

### Phase 1: local script, `main` engine

- Headless `useOnboarding` harness + seed + fill loop + submit.
- Validate it against ESP v7 and DEU (both have e2e coverage, so we know they should pass) and against one legacy (non jsf v1) country.
- Deliberately break it (e.g. pin ESP back to v1 with current core code, or submit a value outside a field's range) to confirm it fails loudly.

### Phase 2: CI on version changes

- Workflow triggered by `constants.ts` changes, plus `workflow_dispatch`.

### Phase 3: share the harness with the canary

- The canary reuses steps 2–3 (mount + load) for every country at the pinned and latest versions.
- Optionally run the full version bump check on a small nightly sample of countries.

## Open decisions

- [ ] Does a sandbox `contract_details` submission have side effects we need to clean up (employments piling up on the sandbox company)?
- [ ] Required-only pass: fail the job, or warn only, while overrides are being built up?
- [ ] Check only changed countries on PRs, or all countries on the jsf v1 path whenever core form code changes?
- [ ] Is `renderHook` in jsdom under `tsx` enough, or should this run as a separate Vitest project (its own config, MSW disabled, real network)?
