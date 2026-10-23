---
description: Conventions for unit, integration and e2e tests
paths:
  - '**/*.test.{ts,tsx}'
  - 'src/tests/**'
  - 'example/e2e/**'
---

# Testing

## Repo conventions

- **MSW for API mocking** in tests — never `vi.mock('@/src/client')`. Override endpoints with `server.use(http.get(...))` inside `beforeEach`; defaults live in [src/tests/handlers.ts](../../src/tests/handlers.ts) and are reset after each test by [src/tests/server.ts](../../src/tests/server.ts). This holds for headless-hook tests (`renderHook` + `useFlowName()`) exactly as much as for rendered-flow tests — [OnboardingFlowGermanyDynamicSteps.test.tsx](../../src/flows/Onboarding/tests/OnboardingFlowGermanyDynamicSteps.test.tsx) and [useOnboardingJsfV1ContractDetails.test.tsx](../../src/flows/Onboarding/tests/useOnboardingJsfV1ContractDetails.test.tsx) are the references. Mocking the generated client bypasses the real query/serialization path and silently drops any endpoint the flow starts calling (the server is set to `onUnhandledRequest: 'error'`, so MSW surfaces those instead). Reserve `vi.fn()` for consumer callbacks (`onSubmit`, `onSuccess`, `render`) and for the rare test that asserts on request _arguments_ rather than behaviour.
- **E2E never fakes the API** — specs in `example/e2e/` run against the real sandbox. `page.route` is fine for passing requests on (`route.continue`, as `setupVercelBypass` does), but `fulfill`, `abort`, `routeFromHAR` and `routeWebSocket` are banned by oxlint's `no-restricted-properties`. If a scenario needs fake data, write it as a vitest + MSW test under `src/`, reusing [src/tests/handlers.ts](../../src/tests/handlers.ts) and the existing fixtures.
- **Schema fixtures already include the response envelope** — a `contractDetailsSchemaV1<Country>` is `{ data: <schema> }`, so a handler is just `HttpResponse.json(fixture)`. Add new ones under `tests/fixtures/<form>/` and re-export from that folder's `index.ts`.
- **Form behaviour bugs get a situation, not an integration test** — when the bug is in how a JSON Schema form behaves (conditional visibility, computed or forced values, money conversion, `initialValues`, `jsfModify`), reproduce it first as a failing entry in [jsfEngineSituations.ts](../../src/common/tests/jsfEngineSituations.ts), then fix it. Each situation runs against every jsf engine and `useHeadlessForm` strategy in [jsfEngineContract.test.tsx](../../src/common/tests/jsfEngineContract.test.tsx). Use a minimal inline schema unless the bug depends on a specific country's fixture, and name the situation after the behaviour, not the country or ticket. Integration tests are for flow wiring (steps, API calls, submit payloads). How to write one: [docs/USE_HEADLESS_FORM_ROLLOUT.md](../../docs/USE_HEADLESS_FORM_ROLLOUT.md#adding-a-situation).
- **No timeouts or fixed sleeps in vitest tests** (`src/**/*.test.{ts,tsx}`) — never set `timeout`, `asyncUtilTimeout`, `testTimeout` or `hookTimeout` (on `findBy*`, `waitFor`, `it`/`test` or in config), and never `await new Promise((resolve) => setTimeout(resolve, ms))`. A test that needs more time is waiting on the wrong thing: `await` the real condition (`findBy*`, `waitFor` on the assertion, the mutation promise), or use `vi.useFakeTimers()` for time-driven code. Latency simulated inside an MSW handler is fine. Asserting that something does _not_ happen (e.g. no request within a debounce window) may need a real wait: say why in the PR. Existing timeouts and sleeps are legacy, so don't copy them; remove them when you touch the test. `example/e2e/` runs against a real sandbox and is exempt.
- **Tests must wrap React Query consumers** in a `QueryClientProvider` and `queryClient.clear()` between tests. Use the shared `queryClient` + `TestProviders` from [src/tests/testHelpers.tsx](../../src/tests/testHelpers.tsx) rather than constructing a local `QueryClient`.

## Minimal tests

### Philosophy: Less is More ✨

The most powerful tests are the simplest ones. When creating tests, embrace these principles:

- **Reduce cognitive load**: A test with 3 assertions is easier to understand than one with 10
- **Faster feedback loops**: Fewer lines mean faster execution and quicker feedback
- **Better maintainability**: Simple tests break in obvious ways and are easier to fix
- **Clarity over completeness**: One clear test is worth more than three ambiguous ones
- **Ruthless elimination**: Delete anything that doesn't directly test the feature

Remember: **If you're tempted to write "just one more test case," that's a sign to stop and ask the user first.**

### Test Writing Guidelines

When writing tests, follow these principles:

#### 1. Minimal Test Focus

- Write tests that focus ONLY on the specific functionality being tested
- Don't generate comprehensive test suites unless explicitly requested
- Focus on the core functionality being tested

#### 2. Test Structure

- Include only the essential setup needed for the specific test
- Remove unnecessary test cases and focus on the core functionality
- Use exact object matching in assertions (no `expect.objectContaining()`)
- Clear mocks between tests for isolation

#### 3. Vitest Globals

Vitest globals are enabled in this project (`vitest.config.ts` line 20: `globals: true`).

**DO NOT** import test utilities from 'vitest':

- ❌ `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'`

These are available as global functions. Use them directly:

✅ CORRECT:

```tsx
describe('example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

#### 4. Incremental Approach

- Get one test working completely before adding more
- Don't write multiple test cases until the first one passes
- Ask the user if they want additional test cases after the first one works

#### 5. Example Pattern

```tsx
it('should pass jsonSchemaVersion to API call', async () => {
  const { result } = renderHook(() =>
    useHook({
      options: { jsonSchemaVersion: { form_schema: { basic_info: 2 } } },
    }),
  );
  await waitFor(() => {
    expect(mockApiCall).toHaveBeenCalled();
  });
  expect(mockApiCall).toHaveBeenCalledWith({
    query: { json_schema_version: 2 },
  });
});
```

This rule ensures tests are focused, minimal, and follow strict equality checks.

## Radio button assertions

When asserting radio button values in tests, use the `assertRadioValue` helper function instead of manually querying and asserting.

### Pattern to Use

✅ **GOOD - Use the helper:**

```tsx
await assertRadioValue('Do you control the way contractors work?', 'no');
```

❌ BAD - Manual assertion:

```tsx
await waitFor(() => {
  const controlInput = screen.getByLabelText(
    /Do you control the way contractors work?/i,
  );
  expect(controlInput).toHaveValue('no');
});
```
