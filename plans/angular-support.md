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

## Principles

- **The React package does not change.** `@remoteoss/remote-flows` keeps its name, exports, behavior and bundle size. Extraction PRs are pure refactors.
- **Core is framework-neutral.** No React, no DOM, no `process`. A lint rule enforces it.
- **No default components in the Angular package.** Partners supply every field component. An optional reference package can help, and it stays separate from core.
- **One version for all packages.** Core, React and Angular are released together.

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
4. **Make the client factory take explicit config** (base URL, proxy, headers) instead of reading `process.env`, and drop the `window` write from core.
5. **Add the lint boundary:** core cannot import React, `react-hook-form`, DOM globals or `process`.

React imports from core. Each step is its own `refactor:` PR with no test changes.

### Phase 3: decide the Angular field contract

This is the riskiest public decision, so it gets its own spike before anything is published.

- **Question:** should each field expose an Angular `FormControl` (or Signal Forms field) so that Material, PrimeNG and Spartan work without custom error-state code?
- **Compare** the current `field`/`fieldState`/`fieldData` contract against a control-based one on the invoice form.
- **Also decide:** the provider shape (`provideRemoteFlows(withComponents(...), ...)` features), reusing the app's `QueryClient`, and whether flows ship as components with outputs and template slots as well as inject functions.
- **Minimum Angular version:** signal inputs and `linkedSignal` need 19 or later. Proposed floor is 20.

### Phase 4: Angular package

- Scaffold `packages/angular` with ng-packagr and its own TypeScript version (Angular 22 needs TypeScript 6).
- Publish core as a real package, since Angular depends on it.
- Port the invoice flow from the spike on top of core.
- Each flow declares the field types it needs, so a missing component is reported clearly.
- Optional: a separate Material reference package, not part of core.
- Fix the spike's known gaps: stable row ids in the items list, SSR guards (`window`, `document`), error and description association for accessibility, and how HTML descriptions are sanitized.
- Tests: run the shared form-engine fixtures against core, add Angular component tests, and reuse Playwright for end-to-end.
- CI: build, size check, exports check, type check and tests for the new package.

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
- **TypeScript versions.** Angular 22 requires TypeScript 6, so the Angular package keeps its own TypeScript dependency and must not affect the root toolchain.

## Open questions

- Extract core before the Angular package exists, or let Angular depend on source for a while? This plan extracts first.
- Minimum supported Angular version.
- Ship a Material reference package, or leave field components to partners?
- Extend `scripts/release.ts` or adopt Changesets.

## Not covered

SSR behavior, accessibility, other Angular versions and flows beyond the invoice schedule have not been tested yet.
