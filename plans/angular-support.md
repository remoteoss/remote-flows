# Angular Support Plan

## Goal

Ship an Angular package that offers the same flows as the React package, starting with the invoice schedule flow, without changing what React partners get. Both packages share one framework-neutral core.

## Where we are

A spike (PR #1832, built on #1787) ports the invoice schedule flow to Angular 22. It shows that:

- The schema builder, payload builders, headless form functions and generated API client run in Angular. The built bundle has no React runtime.
- TanStack Query for Angular (`@tanstack/angular-query-experimental`) works with the same query keys as React.
- Field components passed through an injection token work, including the repeatable items list and fieldsets.
- Validation works, including nested row errors and conditional fields.
- Create, preview and the API calls work against sandbox.

It also shows why the spike cannot ship as is:

- It imports the SDK by source path. The production build is 1.04 MB raw (249 kB gzipped) and contains yup, DOMPurify, date-fns and json-logic, pulled in through `src/lib/utils.ts` and `src/components/form/utils.ts`.
- The client factory reads `process.env`, so the spike needs build-time `define` workarounds, and a debug helper writes to `window`.
- The component contract is a custom shape that does not match Angular's forms model, which is why Material's own error display did not work.
- It repeats query keys, `queryFn` and `select` for each query that React already defines (`spike/angular/src/app/api.ts`), so the API logic exists twice.
- It only ran on Angular 22 with TypeScript 6. It was never built or tested on the minimum version this plan proposes (20).

## Principles

- **The React package does not change.** `@remoteoss/remote-flows` keeps its name, exports, behavior and bundle size. Extraction PRs are pure refactors.
- **Core is framework-neutral.** No React, no DOM, no `process`. A lint rule enforces it.
- **No default components in the Angular package.** Partners supply every field component. An optional reference package can help, and it stays separate from core.
- **One version for all packages.** Core, React and Angular are released together.
- **Build on the floor, test on the latest.** Angular libraries compile to partial-Ivy output that runs on newer Angular versions but not older ones. The Angular package is built against the minimum supported version and tested against the newest.
- **Share API code through `@tanstack/query-core`.** Core exports framework-neutral `queryOptions` and `mutationOptions` factories. Each framework only binds them. Core never imports a framework adapter.

## If Angular never ships

Phases 1 and 2 are worth doing on their own, so the plan is staged around a decision gate before Phase 3:

- **Worth keeping without Angular:** the lint boundary that keeps React, DOM and `process` out of the form engine, helpers split from heavy dependencies (smaller bundles for React too), and a client factory with explicit config that is easier to test and reuse.
- **Only worth doing for Angular:** Phases 3 to 5.
- **Gate:** after Phase 2, decide whether a partner or roadmap commitment justifies the Angular package. If not, stop there. The spike stays as a reference.
- **Caveat:** core is only useful if it stays framework-neutral. Without a second consumer, the lint rule is what keeps it honest, so it ships in Phase 2, not later.

## Target layout

```text
/                     # stays @remoteoss/remote-flows (React)
packages/core         # framework-neutral logic
packages/angular      # @remoteoss/remote-flows-angular
example/              # unchanged
```

The React source stays at the repo root. Moving it into `packages/react` is a lot of churn for no gain.

## Phases

### Phase 1: workspaces, no public change

- Add a pnpm workspace at the root with `packages/*`, keeping `example/` as it is.
- Create `packages/core` as a private package. tsdown bundles it into the React build, so no new package is published.
- Confirm the React build output, `exports` map and bundle size are unchanged.

### Phase 2: extract core

Order matters. The helpers come first, because everything else depends on them.

1. **Split the shared helpers.** `src/components/form/utils.ts` and `src/lib/utils.ts` mix pure functions with yup, DOMPurify, date-fns and `react-hook-form` types. Move the pure ones to core and leave the rest where they are. List the exact functions in the first PR.
2. **Move the form engine:** `headlessForm`, `createHeadlessForm` and the value parsing.
3. **Move the invoice schedule code:** `src/common/invoice-schedules` (schema, constants, payload builders, types).
4. **Move the query and mutation option factories.** Export `queryOptions` and `mutationOptions` factories (key, `queryFn`, `select`) from core, depending only on `@tanstack/query-core`. React spreads them into `useQuery`, Angular into `injectQuery`. This replaces the duplicated logic in the spike's `api.ts`. The framework adapters stay peer dependencies of each framework package, so partners can share their own `QueryClient`.
5. **Make the client factory take explicit config** (base URL, proxy, headers) instead of reading `process.env`, and drop the `window` write from core.
6. **Add the lint boundary:** core cannot import React, `react-hook-form`, DOM globals, `process` or a TanStack framework adapter.
7. **Set a bundle budget for core.** Measure the Angular spike's build against a target (proposed: Angular's imports of core at or under 50 kB gzipped; the spike is 249 kB gzipped today) so the helper split has a measurable result.

React imports from core. Each step is its own `refactor:` PR with no test changes.

Core must compile on both TypeScript 5.9 (Angular 20's maximum) and TypeScript 6 (Angular 22's minimum), so CI type-checks it on both.

Moving code to core is only safe through the `@/*` alias while core is private and bundled by tsdown. Once core is published (Phase 4), imports must be rewritten to the package name.

### Phase 3: decide the Angular field contract

This is the riskiest public decision, so it gets its own spike before anything is published.

- **Question:** should each field component receive a real Reactive Forms `FormControl` (from `@angular/forms`) instead of the custom `field`/`fieldState`/`fieldData` shape? Material, PrimeNG and Spartan read a control's `touched`, `invalid` and `errors`, so with a real control their own error display (`mat-error`) works without custom error-state code. This is also why the spike's Material error display did not work.
- **Constraint:** Signal Forms are newer than the proposed floor of 20 and still experimental, so they are not an option while the floor is 20. Reactive Forms are stable and are the baseline. Template-driven forms (`ngModel`) are a poor fit for schema-driven forms.
- **Who owns the state.** Compare two options on the invoice form:
  - **Core drives the controls (starting point).** The form engine stays the source of truth for values, validation and conditional fields. Each `FormControl` is synced from it, errors are written with `setErrors`, and group-array rows map to a `FormArray`. Behavior stays identical to React, which uses `react-hook-form` the same way. The cost is keeping two states in sync.
  - **A `FormGroup` owns the state.** Core's validation is attached as a validator. This is more idiomatic Angular, but part of the validation and conditional-field logic would live in Angular, so React and Angular could behave differently.
- **What the spike must prove** for the first option: no sync loops or lost focus while typing, rows added and removed in a `FormArray`, fields that appear and disappear, nested row errors, and a stable `touched` state after submit.
- **Shared state logic.** The spike's `form-store.ts` (values, touched, validation, group-array rows) is about 250 lines of signal-based state, and React gets the same from `react-hook-form`. Decide whether the neutral parts move into core or each framework reimplements them, so field behavior cannot drift between the two.
- **Also decide:** the provider shape (`provideRemoteFlows(withComponents(...), ...)` features), reusing the app's `QueryClient`, and whether flows ship as components with outputs and template slots as well as inject functions.
- **Compatibility:** check behavior with and without zone.js (the spike has no zone.js and no zoneless provider, which only works because Angular 22 is zoneless by default; Angular 20.2 and later needs `provideZonelessChangeDetection()`).
- **Minimum Angular version:** signal inputs and `linkedSignal` need 19 or later. Proposed floor is 20, built on 20 and tested on 22.

### Phase 4: Angular package

- Scaffold `packages/angular` with ng-packagr, built on the floor version (Angular 20, TypeScript 5.9) with its own TypeScript dependency, separate from the root toolchain.
- Declare `peerDependencies` for `@angular/core`, `common`, `forms`, `rxjs` and the TanStack Angular adapter (for example `@angular/core` as `>=20 <24`), with `sideEffects: false` and no `process.env` or `window` access at module load.
- Pin a tested range for `@tanstack/angular-query-experimental`, since the adapter is still experimental. If it breaks, only the one-line bindings change, because the option factories live in core. The fallback is wrapping the same options with `QueryObserver` and signals.
- Publish core as a real package, since Angular depends on it, and rewrite the `@/*` imports to the package name.
- Port the invoice flow from the spike on top of core.
- Each flow declares the field types it needs, so a missing component is reported clearly.
- Optional: a separate Material reference package, not part of core.
- Fix the spike's known gaps: stable row ids in the items list, SSR guards (`window`, `document`), error and description association for accessibility, and how HTML descriptions are sanitized.
- Tests: run the shared form-engine fixtures against core, add Angular component tests, and reuse Playwright for end-to-end.
- Packaging check: validate the built package with `@arethetypeswrong/cli` and ng-packagr's validation, then install the packed tarball (not the source) in a throwaway Angular app.
- CI: build, size check, exports check, type check and tests for the new package, run as a matrix on the oldest (20) and newest (22) supported Angular versions and on the lowest and highest tested TanStack adapter versions.

### Phase 5: releases

- Lockstep versioning: one version for core, React and Angular.
- Publish in order: core, React, Angular.
- Extend the release flow to several packages. `scripts/release.ts` currently reads one `package.json` and derives the bump from commits, so decide whether to extend it or move to Changesets.
- Dry-run a prerelease (canary) of all three packages before the first real release.

## Protecting React semver

- Add a CI check that compares the exported types and the `exports` map against a baseline. Any difference must be deliberate.
- Every extraction PR passes the existing tests, size check and example e2e without changes to them.
- Extraction PRs use the `refactor:` commit type, so they do not trigger a release by themselves.
- Moved modules keep working through the `@/*` alias until the end, so each PR stays small.
- Publish a canary of the React package and install it in the example app before the last extraction PR merges.

## Risks

- **The helper split (Phase 2, step 1) is the largest cost.** Those utilities are used across React, so mistakes show up as bundle size or behavior changes. Watch size and tests on every PR.
- **The field contract is hard to change once published.** Phase 3 exists to avoid a breaking change in the Angular package.
- **Field coverage.** The spike covers 11 field types. React has more (file upload, multi-select, country, phone, work schedule, currency conversion). Each needs a contract and a reference implementation before its flow can be ported.
- **TypeScript versions.** Angular 20.3 supports TypeScript `>=5.8 <6.0` and Angular 22 requires TypeScript 6. The Angular package keeps its own TypeScript dependency and must not affect the root toolchain, and core has to compile on both.
- **The spike never ran on the floor version.** It only ran on Angular 22. Anything that works there (zoneless by default, newer APIs) must be checked on 20 before the contract is published.
- **TanStack's Angular adapter is experimental.** Mitigated by keeping all API logic in core on top of `@tanstack/query-core`, so a change in the adapter only affects the thin bindings.
- **Signal Forms are not available at the floor.** The field contract has to work with classic Angular forms, which may limit how closely it can follow where Angular is heading.

## Open questions

- Extract core before the Angular package exists, or let Angular depend on source for a while? This plan extracts first.
- Ship a Material reference package, or leave field components to partners? Proposal: leave it out until a partner asks.
- Extend `scripts/release.ts` or adopt Changesets. Proposal: extend the script for three lockstep packages, and move to Changesets only if more packages appear.

## Proposed decisions

- **Minimum supported Angular version: 20**, built on 20 and tested on 22.
- **Shared API code lives in core** as `@tanstack/query-core` option factories.

## Not covered

SSR behavior, accessibility, other Angular versions and flows beyond the invoice schedule have not been tested yet.
