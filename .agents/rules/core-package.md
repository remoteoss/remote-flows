---
description: Where new code goes between packages/core and the React package, and what core must never import
paths:
  - 'packages/core/**'
  - 'src/client/**'
---

# Core Package Rule

## Philosophy: Core Holds What Every Framework Needs

`packages/core` (`@remoteoss/remote-flows-core`) is a private workspace package. It holds the framework-neutral logic that the React package, and later an Angular package, both need: the form engine, value conversion, schemas and payload builders, the generated API client, and the options for API calls. The React package bundles it, so partners never install core and it adds no entry points: the public ones are the `exports` in `package.json`. See `plans/angular-support.md` for the plan and the status of the move.

## Where New Code Goes

| Put it in core                                         | Keep it in the React package                             |
| ------------------------------------------------------ | -------------------------------------------------------- |
| Plain functions, constants and types                   | Components, hooks, contexts, anything using React        |
| Schema builders, payload builders, value conversion    | Anything using `react-hook-form`, yup or DOMPurify types |
| Query and mutation options for an API call (see below) | `useQuery` and `useMutation` wrappers                    |
| Types that only describe data                          | Types that mention `ReactNode`, components or hooks      |

If a function needs the browser, the build environment or the host app, don't put the dependency in core. Split it: the neutral part goes in core and takes the dependency as a parameter, and the React package passes it in.

Existing examples to copy:

- `convertFiles` in `form.ts` and `headlessForm.ts`: reading selected files needs `FileReader`, so core takes a function and `src/lib/files.ts` supplies it.
- `logModifyWarnings` in `createHeadlessForm`: core takes a flag, and the React wrapper passes `process.env.RF_INTERNAL_DEV === 'true'`.
- `createClient` in `packages/core/src/createClient.ts`: core takes `baseUrl`, `proxy`, `credentials` and `version`, and `src/auth/createClient.ts` reads the environment.

## What Core Must Not Import

Lint and a separate type-check enforce this, so a violation fails CI:

- `react`, `react-dom`, `react-hook-form`, `@tanstack/react-query`, the TanStack Angular adapter, and any subpath of them
- anything from `src/` (the `@/*` alias does not resolve in core)
- the globals `window`, `document`, `navigator`, `location`, `localStorage`, `sessionStorage`, `File`, `FileReader` and `process`
- JSX: a `.tsx` file with JSX in core is a type error

Never silence these with a disable comment or by widening `packages/core/tsconfig.json`. Add a parameter instead. Import within core with relative paths.

## API Calls: Plain Option Objects

For each API operation, core exports a factory that takes the client and returns a plain object: `queryKey`, `queryFn` and any fixed options such as `retry` for a query, or `mutationFn` for a mutation (`packages/core/src/api/`). The React hook spreads it into `useQuery` or `useMutation` and adds what depends on the caller, such as `enabled` and `select`. Keep query keys stable: React and any other framework share the same cache keys.

Core does not depend on TanStack. `queryOptions` and `mutationOptions` come from the framework packages, so wrap the object with `queryOptions(...)` in the React package when you need a typed key.

## Old Locations Are Temporary

Files such as `src/client/*.ts`, `src/lib/utils.ts`, `src/common/headlessForm.ts` and `src/components/form/utils.ts` only re-export from core or wrap it. Don't add new logic there. In new code, import moved things from `@remoteoss/remote-flows-core`. A final cleanup removes the re-exports.

## The Generated Client

The client lives in `packages/core/src/client/` and is regenerated with `pnpm run openapi-ts`. Never hand-edit `*.gen.ts`. `@/src/client`, `@/src/client/client`, `@/src/client/client.gen`, `@/src/client/sdk.gen` and `@/src/client/types.gen` re-export it for existing imports.

## Adding a Dependency to Core

List it in `packages/core/package.json` and also in the root `package.json` `dependencies`. The build keeps a package external when the root lists it, as it does for `fast-deep-equal`, `date-fns` and the form kit. A dependency only core lists would be bundled into the output instead.

## Tests

Tests for core code sit next to it as `*.test.ts`. They can't import from `src/` (no MSW handlers or test providers), so test with real objects and injected fakes. For the client factory, assert on the real client's `getConfig()`, not on a mock of it. Tests for the React wrappers stay under `src/`. If a legacy test replaces the whole `@/src/client` module, the moved code no longer sees that mock, because it imports the client from core by a relative path.

## Checks

- `pnpm run type-check` runs both the root config and `packages/core/tsconfig.json`.
- A change that only touches `packages/` still runs the bundle size check, and the schema canary runs for the form engine files (`headlessForm.ts`, `form.ts`, `fieldHelpers.ts`, `fieldTypes.ts`, `money.ts`).
- Core exports are not public API. Only what `package.json` `exports` publishes is (`src/index.tsx`, `src/internals.ts`, `src/default-components.ts`, `src/styles.ts` and the flow entry points). A core function reaches partners only if one of those re-exports it.
