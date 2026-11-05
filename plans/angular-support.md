# Angular Support Plan

## Goal

Ship an Angular package that offers the same flows as the React package, starting with the invoice schedule flow, without changing what React partners get. Both packages share one framework-neutral core.

## Status

Phase 1 and most of Phase 2 are done, as a stack of draft PRs. Each is a behavior-preserving move, and none is merged yet.

| Step                                                                                                               | PR                                | State                                                  |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------ |
| Phase 1: pnpm workspace and an empty private `packages/core`                                                       | #1887                             | Draft                                                  |
| Phase 2.1: shared helpers (money, nested value, plain types, field helpers, value conversion, currency and base64) | #1888, #1889, #1890, #1891, #1897 | Draft                                                  |
| Phase 2.1: helpers that stay in React (`stripHtml`, `prettifyFormValues`, sanitizers, yup helpers)                 | n/a                               | Stay: they need the DOM, DOMPurify or yup              |
| Phase 2.2: form engine                                                                                             | #1893                             | Draft                                                  |
| Phase 2.3: invoice schedule schema, constants and payload builders                                                 | #1894                             | Draft                                                  |
| Phase 2.4: generated API client moves into core                                                                    | #1898                             | Draft                                                  |
| Phase 2.5: query and mutation options for the invoice flow                                                         | #1901                             | Draft                                                  |
| Phase 2.6: client factory takes explicit config                                                                    | #1900                             | Draft                                                  |
| Phase 2.7: lint boundary and type boundary                                                                         | #1895, #1896                      | Draft                                                  |
| CI path filters for `packages/`                                                                                    | #1899                             | Draft                                                  |
| Phase 2.8: bundle budget for core                                                                                  | n/a                               | Not started: needs an Angular build that consumes core |
| Final cleanup: remove the re-export files and rewrite imports                                                      | n/a                               | Not started: best done right after the stack merges    |
| Agent and Bugbot rules for `packages/core`                                                                         | n/a                               | Not started: wait until the structure settles          |

The decision gate comes next: review and merge the stack, then decide whether to build the Angular package.

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
- **Core is framework-neutral and private.** No React, no browser-only APIs, no `process`. A lint rule and a stricter type-check enforce it.
- **Core never reads its environment.** Anything that needs the browser, the build or the host app is passed in as a parameter. So far: `convertFiles` (reading selected files), `logModifyWarnings` (dev-only logging) and the client factory's `baseUrl`, `proxy`, `credentials` and `version`. The React package supplies them with thin wrappers that keep the old names and signatures.
- **Core is bundled, not published, by default.** Each published package inlines it. Publishing core is the fallback if the Angular package cannot bundle it (see Phase 4).
- **No default components in the Angular package.** Partners supply every field component. An optional reference package can help, and it stays separate from core.
- **One version for all published packages.** React and Angular are released together.
- **Build on the floor, test on the latest.** Angular libraries compile to partial-Ivy output that runs on newer Angular versions but not older ones. The Angular package is built against the minimum supported version and tested against the newest.
- **Share API code as plain option objects.** Core exports the query key, request call and payload building for each operation as plain objects (`queryKey`, `queryFn`; `mutationFn`). Each framework spreads them into its own `useQuery` or `useMutation`. `queryOptions` and `mutationOptions` live in the framework packages, not in `@tanstack/query-core`, so core has no TanStack dependency.

## If Angular never ships

Phases 1 and 2 are worth doing on their own, so the plan is staged around a decision gate before Phase 3:

- **Worth keeping without Angular:** the lint and type boundary that keeps React, DOM and `process` out of the form engine, helpers split from heavy dependencies (smaller bundles for React too), and a client factory with explicit config that is easier to test and reuse.
- **Only worth doing for Angular:** Phases 3 to 5.
- **Gate:** after Phase 2, decide whether a partner or roadmap commitment justifies the Angular package. If not, stop there. The spike stays as a reference.
- **Caveat:** core is only useful if it stays framework-neutral. Without a second consumer, the lint rule and the type-check are what keep it honest, so they ship in Phase 2, not later.

## Target layout

```text
/                     # stays @remoteoss/remote-flows (React)
packages/core         # framework-neutral logic, private
packages/angular      # @remoteoss/remote-flows-angular
example/              # unchanged
```

The React source stays at the repo root. Moving it into `packages/react` is a lot of churn for no gain.

## Phases

### Phase 1: workspaces, no public change

Done in #1887.

- Add a pnpm workspace at the root with `packages/*`, keeping `example/` as it is.
- Create `packages/core` as a private package. tsdown bundles it into the React build, so no new package is published. Core is a dev dependency of the React package.
- Confirm the React build output, `exports` map and bundle size are unchanged.

### Phase 2: extract core

Order matters. The helpers come first, because everything else depends on them.

1. **Split the shared helpers.** `src/components/form/utils.ts` and `src/lib/utils.ts` mixed pure functions with yup, DOMPurify and `react-hook-form` types. The pure ones moved to core. What stays in React needs the DOM (`stripHtml` uses `DOMParser`, so `prettifyFormValues` stays too), DOMPurify or yup. File conversion is passed in as `convertFiles`.
2. **Move the form engine:** `headlessForm`, `createHeadlessForm` and the value parsing.
3. **Move the invoice schedule code:** `src/common/invoice-schedules` (schema, constants, payload builders, types). The one function that took a generated API type now takes a small plain type with the same fields.
4. **Move the generated API client into core.** The `openapi-ts` output path is `packages/core/src/client`. `src/client` keeps one-line re-export files so importers do not change. Core's type-check uses the web-worker library so the client's Fetch types resolve.
5. **Move the query and mutation options** for the invoice flow: employment, contractor currencies, invoice schedules, and the create, update, skip and preview mutations. Plain objects, no TanStack dependency (see Principles). The framework adapters stay peer dependencies of each framework package, so partners can share their own `QueryClient`.
6. **Make the client factory take explicit config** (base URL, proxy, credentials, version) instead of reading `process.env`. The `window` debug write stays in the React package.
7. **Add the boundary:** a lint override and a separate `packages/core/tsconfig.json`.
   - Lint forbids React, `react-dom`, `react-hook-form`, both TanStack framework adapters (including subpaths), anything from `src/`, and the globals `window`, `document`, `navigator`, `location`, `localStorage`, `sessionStorage`, `File`, `FileReader` and `process`.
   - The type-check uses `es2022` plus the web-worker library, no Node types, no `@/*` alias and no JSX. `window`, `document`, `localStorage`, `process` and `globalThis.window` are type errors. `File`, `FileReader`, `location` and `navigator` exist in the worker library, so only lint blocks them.
8. **Set a bundle budget for core.** Measure the Angular spike's build against a target (proposed: Angular's imports of core at or under 50 kB gzipped; the spike is 249 kB gzipped today) so the helper split has a measurable result. This needs an Angular build that consumes core, so it moves to Phase 4 if no earlier build exists.

Each step is its own `refactor:` PR. Existing tests pass unchanged, except where a test mocked `@/src/client` or its modules: those mocks now also name the core module that the moved code imports.

Core must compile on both TypeScript 5.9 (Angular 20's maximum) and TypeScript 6 (Angular 22's minimum). CI currently type-checks core with the root toolchain only; adding the two versions is still to do.

Moved modules keep working through re-export files in their old locations (for example `src/client/*.ts`, `src/lib/utils.ts`, `src/common/headlessForm.ts`). A final cleanup PR removes them and updates the imports to the core package name.

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
- **Prove core can be bundled into it.** The default is to not publish core. ng-packagr treats imports as external and, as far as we know, will not compile source outside its own folder, but this is not tested. Try building core to JavaScript first and consuming that, or copying core's sources in at build time. If neither works cleanly, publish core as a real package and list it as a dependency (and rewrite the imports of the old re-export files accordingly).
- Declare `peerDependencies` for `@angular/core`, `common`, `forms`, `rxjs` and the TanStack Angular adapter (for example `@angular/core` as `>=20 <24`), with `sideEffects: false` and no `process.env` or `window` access at module load.
- Pin a tested range for `@tanstack/angular-query-experimental`, since the adapter is still experimental. If it breaks, only the one-line bindings change, because the options live in core as plain objects. The fallback is wrapping the same options with `QueryObserver` and signals.
- Port the invoice flow from the spike on top of core.
- Each flow declares the field types it needs, so a missing component is reported clearly.
- Optional: a separate Material reference package, not part of core.
- Fix the spike's known gaps: stable row ids in the items list, SSR guards (`window`, `document`), error and description association for accessibility, and how HTML descriptions are sanitized.
- Tests: run the shared form-engine fixtures against core, add Angular component tests, and reuse Playwright for end-to-end.
- Packaging check: validate the built package with `@arethetypeswrong/cli` and ng-packagr's validation, then install the packed tarball (not the source) in a throwaway Angular app.
- CI: build, size check, exports check, type check and tests for the new package, run as a matrix on the oldest (20) and newest (22) supported Angular versions and on the lowest and highest tested TanStack adapter versions.

### Phase 5: releases

- Lockstep versioning: one version for React and Angular (and core, if it ends up published).
- Publish in order: core (if published), React, Angular.
- Extend the release flow to several packages. `scripts/release.ts` currently reads one `package.json` and derives the bump from commits, so decide whether to extend it or move to Changesets.
- Dry-run a prerelease (canary) of the published packages before the first real release.

## Protecting React semver

- Add a CI check that compares the exported types and the `exports` map against a baseline. Any difference must be deliberate. (`check-exports` already covers the subpaths.)
- Every extraction PR passes the existing tests, size check and example e2e. The only test edits so far are mock paths where a test mocked a module that moved.
- Extraction PRs use the `refactor:` commit type, so they do not trigger a release by themselves.
- Moved modules keep working through re-export files until the final cleanup, so each PR stays small.
- The size and schema canary workflows also run for changes under `packages/` (#1899), since core code is bundled into the published package.
- Publish a canary of the React package and install it in the example app before the last extraction PR merges.

## Risks

- **The helper split (Phase 2, step 1) was the largest cost.** Those utilities are used across React, so mistakes show up as bundle size or behavior changes. Watch size and tests on every PR.
- **Stack depth.** The extraction is a stack of 14 draft PRs. A change requested at the bottom means rebasing everything above it, so review and merge from the bottom in small batches.
- **Legacy test mocks.** A few tests replace the whole `@/src/client` module. Moving code behind that module can change what such a test exercises (it happened once, in the Onboarding JSON schema version test). Replacing those mocks with MSW is a separate cleanup.
- **The generated client now lives in core.** It is 1.5 MB of generated code, regeneration diffs are large, and the CI job that checks codegen only runs when `package.json` or the lockfile changes, so a wrong output path would not be caught by CI. The path was checked by running `pnpm run openapi-ts` locally.
- **The type boundary is looser than lint for a few names.** The generated client needs the Fetch API types, so core's type-check uses the web-worker library. `File`, `FileReader`, `location` and `navigator` then exist as types and are blocked only by the lint rule. `globalThis.window` is caught by the type check, not by lint.
- **The field contract is hard to change once published.** Phase 3 exists to avoid a breaking change in the Angular package.
- **Field coverage.** The spike covers 11 field types. React has more (file upload, multi-select, country, phone, work schedule, currency conversion). Each needs a contract and a reference implementation before its flow can be ported.
- **TypeScript versions.** Angular 20.3 supports TypeScript `>=5.8 <6.0` and Angular 22 requires TypeScript 6. The Angular package keeps its own TypeScript dependency and must not affect the root toolchain, and core has to compile on both.
- **The spike never ran on the floor version.** It only ran on Angular 22. Anything that works there (zoneless by default, newer APIs) must be checked on 20 before the contract is published.
- **TanStack's Angular adapter is experimental.** Mitigated by keeping all API logic in core as plain option objects, so a change in the adapter only affects the thin bindings.
- **Signal Forms are not available at the floor.** The field contract has to work with classic Angular forms, which may limit how closely it can follow where Angular is heading.
- **Bundling core into ng-packagr is unproven.** See Phase 4.

## Open questions

- Ship a Material reference package, or leave field components to partners? Proposal: leave it out until a partner asks.
- Extend `scripts/release.ts` or adopt Changesets. Proposal: extend the script for the lockstep packages, and move to Changesets only if more packages appear.
- Does the Angular package bundle core, or does core get published? Settled by the Phase 4 check.

## Decisions

Settled in code:

- Core is a private workspace package that each published package bundles. It is a dev dependency of the React package.
- Shared API code lives in core as plain option objects, with no TanStack dependency.
- Anything environment-specific is passed into core as a parameter.
- Core is kept neutral by a lint override and a stricter type-check.

Proposed:

- **Minimum supported Angular version: 20**, built on 20 and tested on 22.

## Not covered

SSR behavior, accessibility, other Angular versions and flows beyond the invoice schedule have not been tested yet.
