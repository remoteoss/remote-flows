# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **See also:** [ARCHITECTURE.md](ARCHITECTURE.md) for architectural patterns, design philosophy, and decision-making framework.

## What this is

`@remoteoss/remote-flows` is a React component library (npm package) that exposes embeddable HR/employment flows (Cost Calculator, Onboarding, Contractor Onboarding, Termination, Contract Amendment, Create Company) for Remote's platform. It is consumed by external partners, so the public API in [src/index.tsx](src/index.tsx) is contract-bound: prefer additive changes, and treat type/prop/hook signature changes as breaking.

## Commands

```bash
npm run dev            # tsup watch build (link this package into example/ for live dev)
npm run build          # production bundle (tsup)
npm test               # vitest (jsdom). Single test: npx vitest run path/to/file.test.tsx
npm run test:coverage  # coverage with thresholds from scripts/coverage-utils
npm run type-check     # tsc --noEmit
npm run lint           # oxlint
npm run format         # oxfmt
npm run check-format   # oxfmt --check (CI gate)
npm run check-exports  # @arethetypeswrong/cli — verifies the package.json exports map
npm run size           # bundle analysis → out/bundle-analysis.json
npm run size:check     # fails if .sizelimit.json thresholds are exceeded
npm run openapi-ts     # regenerate src/client/* from production gateway OpenAPI
npm run openapi-ts:local  # regenerate from local gateway (openapi-ts.config.local.ts)
npm run ci             # full local CI: build + check-format + check-exports + lint + type-check + test
```

The `example/` app is a separate workspace (its own `package.json`, Vite + Express dev server on `:3001`). To work against local changes: `npm link` in repo root, then `npm link @remoteoss/remote-flows` inside `example/`, then run `npm run dev` in both. E2E lives in [example/e2e/](example/e2e/) and is run with `npm run test:e2e` from `example/` (Playwright). E2E is excluded from the root vitest run.

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

`src/client/` is **fully generated** by `@hey-api/openapi-ts` from [openapi-ts.config.ts](openapi-ts.config.ts) (production gateway) or `openapi-ts.config.local.ts` (local gateway). Never hand-edit `*.gen.ts`. After schema changes, run `npm run openapi-ts` and commit the regenerated files. Import types from `src/client/types.gen.ts` and SDK functions from `src/client/sdk.gen.ts`. `.oxlintrc.json` ignores `src/client/**/*.gen.ts` from lint.

### Forms

Forms use **React Hook Form + Yup + `@remoteoss/remote-json-schema-form-kit`**. Field rendering is delegated to the `FormFieldsContext` component map; consumers override per-type renderers via the `<RemoteFlows components={...}>` prop, and built-ins come from [src/lazy-default-components.ts](src/lazy-default-components.ts) (lazy-loaded to keep the bundle small). The `flowBag` exposes `handleValidation` and `parseFormValues` — both are **async** (changed in v1.0.0, see [MIGRATION.md](MIGRATION.md)).

### React Query patterns

Two patterns coexist; pick deliberately:

- **`queryOptions` factory** (preferred when transformations vary per consumer): export `xxxOptions(client, ...)` returning `queryOptions({...})`. Consumers spread it into `useQuery`/`useSuspenseQuery`/`useQueries` and add their own `select`/`enabled`/`staleTime`. Reference: [src/common/api/countries.ts](src/common/api/countries.ts).
- **Custom hook** (preferred when the transformation is fixed and idempotent for every consumer): wrap `useQuery` directly. Reference: [src/common/api/identity.ts](src/common/api/identity.ts).

Detailed guidance lives in [.cursor/rules/react-query-abstractions.mdc](.cursor/rules/react-query-abstractions.mdc).

### Mutation error handling

All mutations go through `mutationToPromise()` and `mutateAsyncOrThrow` (the plain `mutateAsync` path is deprecated). When catching errors, **always** narrow with `isMutationError(error)` from [src/lib/mutations.ts](src/lib/mutations.ts) before accessing `normalizedErrors`, `fieldErrors`, `rawError`, `response`. Re-throw after handling.

### Theming & CSS

Tailwind v4 (`@tailwindcss/postcss`) + CSS variables. Public component classes are prefixed `RemoteFlows__` (e.g. `RemoteFlows__Button`, `RemoteFlows__CostCalculatorForm`); variants use `RemoteFlows_VariantName`. Theme tokens (`colors`, `spacing`, `borderRadius`, `font`) are injected as CSS custom properties by `applyTheme()` in [src/lib/applyTheme.ts](src/lib/applyTheme.ts). Class merging uses the `cn()` helper.

### Package exports & bundle

[package.json](package.json) ships **multiple ESM entry points** — `.`, `./internals`, `./default-components`, `./flows/*`, `./styles`, `./styles.css`, `./index.css`. Tsup builds each as a separate chunk ([tsup.config.ts](tsup.config.ts)), `react`/`react-dom` are externals, `react-hook-form` + `@hookform/resolvers` are bundled (`noExternal`). Bundle limits in [.sizelimit.json](.sizelimit.json) are enforced in CI by `.github/workflows/size-check.yml`. The `internals` entry point has **no semver guarantees**.

## Conventions worth knowing

- **Vitest globals are enabled** (`vitest.config.ts`). Do not import `describe`/`it`/`expect`/`vi`/`beforeEach` from `vitest` — use them as globals.
- **Strict equality in mocks** — use `toHaveBeenCalledWith({ exact: 'shape' })`, not `expect.objectContaining()`.
- **MSW for API mocking** in tests; handlers go via `src/tests/server.ts`, fixtures live in each flow's `tests/fixtures.ts`.
- **Tests must wrap React Query consumers** in a `QueryClientProvider` and `queryClient.clear()` between tests.
- **`no-console: warn`** in oxlint — only `console.warn` / `console.error` permitted.
- **No `any`** — `typescript/no-explicit-any: error`. Use the `$TSFixMe` type from `src/types/remoteFlows.ts` for genuine workarounds.
- **Path alias `@/*` maps to repo root** (`tsconfig.json` paths); prefer `@/src/...` imports over deep relative ones.
- **HTML from API responses is unsafe** — sanitize with `sanitizeHtml()` from `src/lib/utils.ts` (or DOMPurify) before rendering. The consumer-supplied `transformHtmlToComponents` receives **unsanitized** HTML; that's the consumer's responsibility per the README.
- **Conventional commits** drive the automated release (`npm run release` → `scripts/release.ts`). `feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` footer → major. Hotfix releases go through `npm run release:fix` from a version tag (see [DEVELOPMENT.md](DEVELOPMENT.md)).
- **CHANGELOG.md and `package.json` version** are updated by the release scripts — do not bump them by hand on feature branches.

## Things that look broken but aren't

- `dist/` is checked into the working tree during dev (it's gitignored, but `prepare` runs `build`); don't be alarmed by churn there.
- `src/client/*.gen.ts` regenerates wholesale — diffs will be large after `npm run openapi-ts` runs.
- The error boundary's `useParentErrorBoundary` defaults to `true` in code but `false` in the README example; the README documents the recommended consumer config, not the default.
