# AGENTS.md

This file gives coding agents guidance for working in this repository.

> **See also:** `ARCHITECTURE.md` for architectural patterns, design philosophy, and decision-making framework.

## What this is

`@remoteoss/remote-flows` is a React component library (npm package) that exposes embeddable HR/employment flows (Cost Calculator, Onboarding, Contractor Onboarding, Termination, Contract Amendment, Create Company) for Remote's platform. It is consumed by external partners, so the public API in [src/index.tsx](src/index.tsx) is contract-bound: prefer additive changes, and treat type/prop/hook signature changes as breaking.

## Commands

The SDK root uses pnpm (pinned in `packageManager`; run `corepack enable` once). `example/` still uses npm.

```bash
pnpm install                # install the root dependencies
pnpm run dev                # tsdown watch build (example/ picks it up, see below)
pnpm run build              # production bundle (tsdown)
pnpm run test               # vitest (jsdom). Single test: pnpm exec vitest run path/to/file.test.tsx
pnpm run test:coverage      # coverage with thresholds from scripts/coverage-utils
pnpm run type-check         # tsc --noEmit
pnpm run lint               # oxlint
pnpm run format             # oxfmt
pnpm run check-format       # oxfmt --check (CI gate)
pnpm run check-exports      # @arethetypeswrong/cli — verifies the package.json exports map
pnpm run size               # bundle analysis → out/bundle-analysis.json
pnpm run size:check         # fails if .sizelimit.json thresholds are exceeded
pnpm run openapi-ts         # regenerate src/client/* from production gateway OpenAPI
pnpm run openapi-ts:local   # regenerate from local gateway (openapi-ts.config.local.ts)
pnpm run ci                 # full local CI: build + check-format + check-exports + lint + type-check + test (not `pnpm ci`, which is pnpm's clean install)
pnpm run ci:digest <pr>     # summary of a PR's failing CI checks (failure type, error lines, next step, every failing Playwright spec) - run it before reading raw job logs
pnpm run ci:digest --branch=main  # same for the latest commit's runs on a branch (e.g. failures on main); also the fallback when the current branch has no PR
pnpm run flaky:digest [--runs=30] [--min-hits=1]  # tests that retried or failed across recent ci-main/pr runs (from the flaky-tests artifact); run it to find flakes to fix
pnpm run seed:onboarding --country=XXX  # create an onboarding via API up to (not including) contract_details; needs example dev server + example/.env
pnpm run seed:onboarding --country=XXX --env=sandbox  # same, but talks to the gateway directly using .env.sandbox at repo root (see scripts/seed-onboarding.ts) - no dev server needed
pnpm run seed:onboarding --country=XXX --env=review   # same, using .env.review - the deployed demo app's credentials; use this for employments you'll open on the deployed app
cd example && PORT=<port> npm run dev:env -- --env=<name>   # run the example app on .env.<name> from repo root only, ignoring example/.env - used by the verify-local-app skill
```

The `example/` app is a separate npm project (its own `package.json` and `package-lock.json`, Vite + Express dev server on `:3001` by default, overridable via `PORT` — `scripts/create-worktree.ts` assigns each worktree its own free port so several can run their example apps at once). It depends on the SDK through `file:..`, so `npm install` inside `example/` links your local checkout: run `pnpm run dev` in the repo root and `npm run dev` in `example/`. E2E lives in [example/e2e/](example/e2e/) and is run with `npm run test:e2e` from `example/` (Playwright). E2E is excluded from the root vitest run.

## Architecture

### Provider chain

[src/RemoteFlowsProvider.tsx](src/RemoteFlowsProvider.tsx) is the single root every consumer wraps their flows in. It composes, outside-in: `ErrorContextProvider` → `RemoteFlowsErrorBoundary` → `QueryClientProvider` (shared `queryClient` from [src/queryConfig.ts](src/queryConfig.ts)) → `FormFieldsProvider` (merges user-provided field components with `lazyDefaultComponents`) → `RemoteFlowContext` (carries the API `Client`) → `ThemeProvider`. The API client is created once via `useRef(createClient(...))` — `auth`, `proxy`, `environment`, `credentials` are read at construction time only.

### Flow anatomy

Each flow under [src/flows/](src/flows/) is self-contained and must not import from sibling flows. Standard layout:

```text
flows/<FlowName>/
  index.ts                # public exports (re-exported from src/index.tsx)
  <FlowName>Flow.tsx      # render-prop container component
  <FlowName>Form.tsx      # form component
  <FlowName>SubmitButton.tsx / ResetButton.tsx   # must be used inside the flow's render prop
  hooks.tsx               # headless use<FlowName>() — exposes the same bag the render prop receives
  api.ts                  # React Query hooks / queryOptions for this flow
  context.ts              # flow-local context (if needed)
  types.ts
  components/             # step components (BasicInformationStep, ContractDetailsStep, …)
  json-schemas/           # static schema fallbacks
  tests/                  # fixtures.ts + *.test.tsx
  utils.ts
```

Flows are exposed two ways: the prebuilt `<FlowNameFlow render={...}>` component, **and** the `useFlowName()` headless hook for fully custom UIs. Both surfaces must stay in sync.

### Multi-step state

[src/flows/useStepState.ts](src/flows/useStepState.ts) is the shared step-state primitive used across multi-step flows (Onboarding, ContractorOnboarding, CreateCompany, Termination). It tracks `currentStep`, transitions, and per-step values. Consumers switch on `flowBag.stepState.currentStep.name`.

### Generated API client

`src/client/` is **fully generated** by `@hey-api/openapi-ts` from [openapi-ts.config.ts](openapi-ts.config.ts) (production gateway) or `openapi-ts.config.local.ts` (local gateway). Never hand-edit `*.gen.ts`. After schema changes, run `pnpm run openapi-ts` and commit the regenerated files. Import types from `src/client/types.gen.ts` and SDK functions from `src/client/sdk.gen.ts`. `.oxlintrc.json` ignores `src/client/**/*.gen.ts` from lint.

### Forms

Forms use **React Hook Form + Yup + `@remoteoss/remote-json-schema-form-kit`**. Field rendering is delegated to the `FormFieldsContext` component map; consumers override per-type renderers via the `<RemoteFlows components={...}>` prop, and built-ins come from [src/lazy-default-components.ts](src/lazy-default-components.ts) (lazy-loaded to keep the bundle small). The `flowBag` exposes `handleValidation` and `parseFormValues` — both are **async** (changed in v1.0.0, see `MIGRATION.md`).

Build every schema-backed form with `useHeadlessForm` ([src/common/useHeadlessForm.ts](src/common/useHeadlessForm.ts)), never by calling `createHeadlessForm` directly; oxlint fails any new import of it. Pass `strategy: 'buildOnce'` and the saved `initialValues` in API units (not the live form values), and call the hook's `onValuesChange` when form values change. Data from an API (options, defaults, `disabled`) goes into a memoized schema before the build, never onto `form.fields` afterwards. Legacy files that still import it carry a `no-restricted-imports -- TODO` disable comment: that is debt tracked in `docs/USE_HEADLESS_FORM_ROLLOUT.md`, so don't copy it and never add a new one. Full guidance in [.agents/rules/json-schema-form-usage.md](.agents/rules/json-schema-form-usage.md).

### React Query patterns

Two patterns coexist; pick deliberately:

- **`queryOptions` factory** (preferred when transformations vary per consumer): export `xxxOptions(client, ...)` returning `queryOptions({...})`. Consumers spread it into `useQuery`/`useSuspenseQuery`/`useQueries` and add their own `select`/`enabled`/`staleTime`. Reference: [src/common/api/countries.ts](src/common/api/countries.ts).
- **Custom hook** (preferred when the transformation is fixed and idempotent for every consumer): wrap `useQuery` directly. Reference: [src/common/api/identity.ts](src/common/api/identity.ts).

Detailed guidance lives in [.agents/rules/react-query-abstractions.md](.agents/rules/react-query-abstractions.md).

### Mutation error handling

All mutations go through `mutationToPromise()` and `mutateAsyncOrThrow` (the plain `mutateAsync` path is deprecated). When catching errors, **always** narrow with `isMutationError(error)` from [src/lib/mutations.ts](src/lib/mutations.ts) before accessing `normalizedErrors`, `fieldErrors`, `rawError`, `response`. Re-throw after handling.

## Rules

Path-scoped rules live in `.agents/rules/`. Claude Code loads each one when you read or edit a matching file; with any other tool, read the rule before touching those paths.

| Rule                                                                                                                                                   | Applies to                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [json-schema-form-usage](.agents/rules/json-schema-form-usage.md)                                                                                      | `src/flows/**`, `src/common/**`, `src/components/**`                                                                                                                         |
| [react-query-abstractions](.agents/rules/react-query-abstractions.md)                                                                                  | `src/**/api.ts`, `src/common/api/**`, `src/flows/**/hooks.{ts,tsx}`, `src/flows/**/hooks/**`                                                                                 |
| [mutation-error-handling](.agents/rules/mutation-error-handling.md)                                                                                    | `src/flows/**`, `src/common/**`, `src/lib/mutations.ts`                                                                                                                      |
| [loading-state-aggregation](.agents/rules/loading-state-aggregation.md), [submitting-state-aggregation](.agents/rules/submitting-state-aggregation.md) | `src/flows/**/hooks.{ts,tsx}`                                                                                                                                                |
| [step-component-types](.agents/rules/step-component-types.md)                                                                                          | `src/flows/**/types.ts`, `src/flows/**/components/**`                                                                                                                        |
| [component-pattern](.agents/rules/component-pattern.md)                                                                                                | `src/components/**`                                                                                                                                                          |
| [component-documentation](.agents/rules/component-documentation.md)                                                                                    | `src/types/remoteFlows.ts`, `src/index.tsx`, `docs/COMPONENT_CUSTOMIZATION.md`                                                                                               |
| [testing](.agents/rules/testing.md)                                                                                                                    | `**/*.test.{ts,tsx}`, `src/tests/**`, `example/e2e/**`                                                                                                                       |
| [theming](.agents/rules/theming.md)                                                                                                                    | `src/styles/**`, `src/lib/applyTheme.ts`, `**/*.css`                                                                                                                         |
| [partner-facing-ui](.agents/rules/partner-facing-ui.md)                                                                                                | `src/flows/**`, `example/src/**`                                                                                                                                             |
| [package-exports](.agents/rules/package-exports.md)                                                                                                    | `package.json`, `tsdown.config.ts`, `.sizelimit.json`, `src/index.tsx`, `src/internals.ts`, `src/default-components.ts`, `src/styles.ts`, `.github/workflows/size-check.yml` |

## Conventions worth knowing

- **Import order** (convention only — neither `oxlint` nor `oxfmt` enforce or auto-sort this): `react` first, then other external packages, then `@remoteoss/*` packages, then absolute (`@/`) imports, then relative (`./`, `../`) imports. Alphabetize within each group.
- **Notices are partner UI** — a warning or statement driven by API data goes on the flow bag and is rendered in `example/src` with the shipped UI primitive that matches the issue's design; never inside a flow's `*Form.tsx`. A statement authored in the JSON schema stays in the schema. See [partner-facing-ui](.agents/rules/partner-facing-ui.md).
- **Read before you write** — search for how a sibling flow, component or hook already does it and reuse its helpers; never import a function you haven't confirmed exists.
- **Schema first** — if form behaviour (visibility, defaults, a value derived from another field) looks like it needs `useEffect`/`watch`/`setValue` in a form component, try the JSON schema first (conditionals, `computedValues`, a computed `const`). See [json-schema-form-usage](.agents/rules/json-schema-form-usage.md).
- **Tests** — Vitest globals are enabled (never import `describe`/`it`/`expect`/`vi` from `vitest`), mock APIs with MSW (never `vi.mock('@/src/client')`), assert exact shapes in `toHaveBeenCalledWith`, and never add timeouts or fixed sleeps. Details in [.agents/rules/testing.md](.agents/rules/testing.md).
- **`no-console: warn`** in oxlint — only `console.warn` / `console.error` permitted.
- **No `any`** — `typescript/no-explicit-any: error`. Use the `$TSFixMe` type from `src/types/remoteFlows.ts` for genuine workarounds.
- **Inline comments are opt-in, not default** — implementation, config, and test code should have none by default. Add one only for a genuinely non-obvious _why_ (a hidden constraint, a workaround for a specific bug), never to restate _what_ the code does; one short line max, never a reference to the current task/PR/fix. Full rule and examples in `.cursor/BUGBOT.md`.
- **A comment that does get written should read like plain English, not shorthand** — explain _why_ in ordinary words a newcomer could follow in one pass, not jargon-dense shorthand. When a human explicitly asks for a comment, the one-line cap above doesn't apply — take as many plain sentences as it needs to be clear. When you add one on your own initiative for the non-obvious-why case, keep it to that one line, and don't add one at all if the code is actually simple.
- **JSDoc is for the caller who actually uses the symbol** — 1–3 lines by default: what it does and anything the caller has to do differently because of it. Leave out internal wiring (which hidden fields, hooks or context are involved) and edge cases that only the prebuilt components handle. A member partners never call directly (the prebuilt form calls it) gets one line. The public API being contract-bound calls for careful API design, not longer docs.
- **Path alias `@/*` maps to repo root** (`tsconfig.json` paths); prefer `@/src/...` imports over deep relative ones.
- **HTML from API responses is unsafe** — sanitize with `sanitizeHtml()` from `src/lib/utils.ts` (or DOMPurify) before rendering. The consumer-supplied `transformHtmlToComponents` receives **unsanitized** HTML; that's the consumer's responsibility per the README.
- **Conventional commits** drive the automated release (`pnpm run release` → `scripts/release.ts`). `feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` footer → major. Hotfix releases go through `pnpm run release:fix` from a version tag, or `npm run release:fix` on a tag from before the move to pnpm (see `DEVELOPMENT.md`).
- **CHANGELOG.md and `package.json` version** are updated by the release scripts — do not bump them by hand on feature branches.
- **PR descriptions follow `.github/pull_request_template.md`** (Summary, Why, What changed, Screenshots, Related Resources, Testing). `gh pr create` only picks it up as the default body without `--body`/`--body-file`/`--fill`; when scripting a PR body, read the template and fill it in rather than writing free-form text.

## Things that look broken but aren't

- `dist/` is checked into the working tree during dev (it's gitignored, but `prepare` runs `build`); don't be alarmed by churn there.
- `src/client/*.gen.ts` regenerates wholesale — diffs will be large after `pnpm run openapi-ts` runs.
- The error boundary's `useParentErrorBoundary` defaults to `true` in code but `false` in the README example; the README documents the recommended consumer config, not the default.

## Agent configuration

- Rules live in `.agents/rules/` (linked from `.claude/rules`), skills in `.agents/skills/<name>/` (linked from `.claude/skills/<name>`), so Claude Code discovers both.
- `CLAUDE.md` only imports this file. Keep shared guidance here and Claude-only guidance in `CLAUDE.md`.
- `.cursor/BUGBOT.md` stays until Cursor Bugbot is switched off. The rollout is in `plans/agent-config-ssot.md`.
