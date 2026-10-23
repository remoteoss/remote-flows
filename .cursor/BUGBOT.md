# Code Review Guidelines

## Project rules

Review every change against the repo's shared guidance. It is the source of truth: if anything below conflicts with it, the shared guidance wins, and the sections below only add Bugbot-specific checks.

- [AGENTS.md](../AGENTS.md): applies to every change
- [json-schema-form-usage](../.agents/rules/json-schema-form-usage.md): flows, `src/common`, components
- [react-query-abstractions](../.agents/rules/react-query-abstractions.md): `api.ts`, `src/common/api`, flow hooks
- [mutation-error-handling](../.agents/rules/mutation-error-handling.md): flows, `src/common`, `src/lib/mutations.ts`
- [loading-state-aggregation](../.agents/rules/loading-state-aggregation.md): flow `hooks` files
- [submitting-state-aggregation](../.agents/rules/submitting-state-aggregation.md): flow `hooks` files
- [step-component-types](../.agents/rules/step-component-types.md): flow `types.ts` and step components
- [component-pattern](../.agents/rules/component-pattern.md): `src/components`
- [component-documentation](../.agents/rules/component-documentation.md): `src/types/remoteFlows.ts`, `src/index.tsx`
- [testing](../.agents/rules/testing.md): test files and `example/e2e`. Apply only its "Repo conventions" section, and ignore the parts addressed to whoever writes the tests, such as asking the user before adding another test.
- [theming](../.agents/rules/theming.md): styles, CSS and theme files
- [package-exports](../.agents/rules/package-exports.md): `package.json`, build config, entry files

Formatting and lint rules are enforced by `oxfmt` and `oxlint` in CI, so don't comment on what they already catch.

## Naming and function conventions

- Components: PascalCase (`CostCalculatorFlow`, `Button`)
- Hooks: camelCase with `use` prefix (`useCostCalculator`, `useAuth`)
- Files: match the export name (`CostCalculatorFlow.tsx`, `hooks.tsx`)
- Variants: use the `RemoteFlows_VariantName` format (`RemoteFlows_ButtonDefault`)
- Use arrow functions for components and utilities, and regular functions for top-level exported functions with JSDoc
- Keep functions small and focused (ideally under 50 lines)
- Intersection types for props: combine component props with variants, for example `React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild: boolean }`
- Import order follows [AGENTS.md](../AGENTS.md). It is a convention that lint does not enforce, so mention a deviation only when it is clearly out of step with the surrounding file.

## Security

- **API key safety**: Never commit API keys or tokens (check `.env` files before commits)
- **Input sanitization**: Use `sanitizeHtml()` from `src/lib/utils.ts` before rendering HTML
- **XSS prevention**: Avoid `dangerouslySetInnerHTML` unless using sanitized content
- **Validate user inputs**: All form inputs must go through React Hook Form + Yup validation
- **No sensitive logging**: Never log tokens, passwords, or PII (check console statements)
- **Environment variables**: Use environment variables for secrets and API endpoints

## Testing review

- New features and fixes need tests: hooks and components, user interactions through `@testing-library/react` and `user-event`, and the empty, loading, error and validation states.
- API calls are mocked with MSW handlers through `src/tests/server.ts`. Test data lives in `src/flows/*/tests/fixtures.ts`.
- Hook tests use `renderHook`, and tests that use React Query wrap the consumer in `QueryClientProvider`.
- **No timeouts or fixed sleeps** - Flag an added line in a `src/**/*.test.{ts,tsx}` file that sets `timeout`, `asyncUtilTimeout`, `testTimeout` or `hookTimeout`, or that adds `new Promise((resolve) => setTimeout(resolve, ms))`. Suggest awaiting the real condition (`findBy*`, `waitFor`) or `vi.useFakeTimers()`. Don't flag `example/e2e/`, latency simulated in an MSW handler, or fake-timer usage, and only flag added lines: existing ones are legacy

**E2E tests (`example/e2e/`):**

E2E runs against the real sandbox. Anything that needs fake data belongs in a vitest + MSW test under `src/`, reusing `src/tests/handlers.ts` and the existing fixtures. Lint catches the plain `route.fulfill(...)` case. Flag what it can't:

- A new `oxlint-disable` for `no-restricted-properties` in any spec.
- Fake data served from outside `example/e2e/`, where the rule doesn't apply: fake routes in `example/api/proxy.js` or `example/dev_server.js`, an MSW `setupWorker` in the example app, or a demo query flag that swaps in canned responses.
- Calls that dodge the rule, such as a computed property (`route['ful' + 'fill']`) or handing `route` to a helper outside `example/e2e/`.
- A new spec whose scenario needs controlled data. Suggest writing it as a vitest + MSW test instead.

## Specific Areas of Focus

When reviewing code, pay special attention to:

### 1. Public API Changes (Breaking Changes)

This is an **externally consumed npm package** - breaking changes affect partners:

- **Semver compliance required** - Follow conventional commits (feat, fix, BREAKING CHANGE)
- **Type export changes** - Changes to exported types can break consumers
- **Props changes** - Adding required props or removing optional props is breaking
- **Hook signature changes** - Changing return values or parameter shapes is breaking
- **Component API changes** - Render prop signatures, context values, etc.
- **Internals endpoint** - No semver guarantees, but document changes
- **Peer dependency ranges** - Changing React version range affects consumers

**Check:** Does this PR require a major, minor, or patch version bump?

### 2. Bundle Size and Tree-Shaking

Package is consumed by external applications - monitor bundle impact:

- **Tree-shakeable exports** - Use named exports, avoid barrel exports for large features
- **Dynamic imports** - Large dependencies (PDF.js, Recharts) should be lazy-loaded where possible
- **Dependency audit** - Avoid adding heavy dependencies without discussion
- **Multiple entry points** - Verify exports in `package.json` work correctly

**Check:** Would `pnpm run size:check` still pass?

### 3. Error Handling

Mutation errors follow the mutation error handling rule. Also check:

- **Try/catch blocks** - Async operations must have error handling
- **User-friendly messages** - Field labels come from metadata via `normalizeFieldErrors()`
- **Fallback UI** - Loading states, error states, empty states

### 4. Forms

Forms follow the form rule. Also check:

- **Field mapping** - Custom field components are mapped in `src/components/form/fields/fieldsMapping.tsx`
- **Required vs optional** - Field requirements match the JSON schema

**Check:** Are validation errors user-friendly? Do they display with proper field labels?

### 5. API Client Management

OpenAPI-driven development - never manually write client code:

- **Regenerate after schema changes** - Run `pnpm run openapi-ts` after API updates
- **Use generated types and SDK** - Import from `src/client/types.gen.ts` and `src/client/sdk.gen.ts`
- **Environment config** - Use environment configs from `src/environments.ts`

For wrapping the client in a query, follow the React Query rule: pick a `queryOptions` factory or a custom hook as it describes (see `src/common/api/countries.ts` and `src/common/api/identity.ts`).

### 6. Theme and Styling

Custom theming system - maintain consistency:

- **Tailwind utility-first** - Use Tailwind classes, avoid inline styles
- **`cn()` helper** - Use for conditional class merging
- **Component variants** - Use `class-variance-authority` for variant handling
- **Dark mode support** - Test with `class="dark"` on root element
- **Theme customization** - Changes must work with theme overrides via `applyTheme()`

### 7. Performance

- **Memoization** - Use `useMemo` for expensive computations, `useCallback` for function props
- **Query invalidation** - Invalidate React Query cache appropriately on mutations
- **Avoid unnecessary re-renders** - Check React DevTools Profiler for re-render issues
- **Virtualization** - Long lists should use virtualization (if applicable)
- **Bundle splitting** - Verify code splitting works for flows

### 8. Accessibility

Radix UI provides foundation - maintain it:

- **Keyboard navigation** - All interactive elements keyboard accessible
- **ARIA attributes** - Proper ARIA labels, roles, and states (Radix handles most)
- **Focus management** - Focus trapping in modals, focus return on close
- **Screen reader testing** - Test with screen readers when adding complex interactions
- **Color contrast** - Ensure text meets WCAG AA standards
- **Form labels** - All form fields have associated labels

### 9. Flow Structure and Organization

The flow layout is in [AGENTS.md](../AGENTS.md). Key principles to check:

- **Self-contained** - Flow should not import from other flows
- **Public exports** - Only export what's needed via `index.ts`
- **Render props** - Flow component accepts render prop with bag and components
- **Headless hook** - Expose `use[FlowName]()` hook for custom implementations
- **Tests co-located** - All tests in flow's `tests/` directory

### 10. Documentation

- **JSDoc for public APIs** - Public APIs get 1-3 lines of JSDoc written for the caller, with no internal wiring
- **README updates** - Update main README when adding new flows or features
- **Type documentation** - Complex public types may carry a short JSDoc for the caller; avoid other comments unless they explain a non-obvious why
- **Changelog** - Follows conventional commits (auto-generated via `pnpm run release`)
- **Migration guides** - Breaking changes need migration documentation
- **Example app** - Update `example/` app when adding new features

## Common Issues to Look For

### 1. Memory Leaks

- Unclosed subscriptions in `useEffect` (missing cleanup function)
- Event listeners not removed on unmount
- React Query queries not using `enabled` flag properly
- Interval/timeout not cleared on unmount

### 2. React Hook Dependencies

- Missing dependencies in `useEffect`, `useCallback`, `useMemo`
- Oxlint warnings for `react-hooks/exhaustive-deps` must be fixed
- Avoid disabling the rule - fix the dependency array instead

### 3. Type Safety Issues

- Using `any` (lint error; `$TSFixMe` is the escape hatch for genuine workarounds)
- Type assertions (`as`) without clear justification
- Missing null/undefined checks for optional values
- Incorrect generic type parameters

### 4. Form Validation Issues

- Validation schema doesn't match form fields
- Missing required field validation
- Incorrect error message display
- Field names don't match API expectations

### 5. API Integration Issues

- Not using generated client (manually constructed fetch calls)
- Incorrect error handling (not using `mutationToPromise`)
- Missing loading/error states in UI
- Query keys not structured properly (affects cache invalidation)

### 6. State Management Issues

- Props drilling (should use context)
- Unnecessary global state (use React Query cache)
- State updates in wrong component (lift state up)
- Stale closures in event handlers

### 7. Component Composition Issues

- Not using Radix UI primitives where appropriate
- Reimplementing existing UI components
- Not using `cn()` helper for class merging
- Missing `asChild` pattern for polymorphic components
- Adding a new ad-hoc flag, condition, or check where an existing one nearby (in the same file, hook, or context) already covers the same case — prefer extending/reusing it over introducing a parallel mechanism

### 8. Testing Issues

- Tests not using MSW for API mocking
- Missing `waitFor` for async assertions
- Not cleaning up React Query cache between tests
- Testing implementation details instead of behavior
- A fix for JSON Schema form behaviour (conditional visibility, computed or forced values, money conversion, `initialValues`, `jsfModify`) without a new situation in `src/common/tests/jsfEngineSituations.ts`, or reproduced only through a flow integration test. The situation must fail without the fix

### 9. Build and Release Issues

- Uncommitted changes in generated files (`src/client/*.gen.ts`)
- Breaking changes without `BREAKING CHANGE:` in commit message
- Version bump doesn't match change type (feat vs fix)
- Peer dependency changes without testing in example app
- Manual edits to the version in `package.json` or to `CHANGELOG.md`, which the release scripts own

### 10. Package-Specific Issues

- Importing from `internals` in main package code (circular dependency risk)
- Not testing changes in example app (`example/`)
- Changes break backward compatibility without major version bump
- Adding dependencies that are already peer dependencies

### 11. Content Consistency Issues

- **Punctuation in string arrays** - Check consistency in user-facing content arrays:
  - If some array items end with periods, ALL items should end with periods
  - Applies to: `listItems`, bullet points, feature descriptions, etc.
  - Example locations: constants files, pricing descriptions, feature lists
- **❌ INCORRECT: Inconsistent punctuation**

```typescript
listItems: [
  'Remote manages onboarding, payroll, and compliance', // Missing period
  'Manages taxes, benefits, and time-off tracking', // Missing period
  'Handles contracts, transfers, and terminations.', // Has period
];
```

- **✅ CORRECT: Consistent punctuation**

```typescript
listItems: [
  'Remote manages onboarding, payroll, and compliance.',
  'Manages taxes, benefits, and time-off tracking.',
  'Handles contracts, transfers, and terminations.',
];
```

## Review Checklist

Before approving a PR, verify:

- [ ] **No breaking changes** - Or properly documented with `BREAKING CHANGE:`
- [ ] **New tests added** - All new features/fixes have tests
- [ ] **JSDoc added** - Public APIs have documentation
- [ ] **No unnecessary comments** - Implementation/config code has no comments restating WHAT it does, no multi-line comment blocks, and no task/PR/fix references; only genuinely non-obvious WHY, one line max
- [ ] **Bundle size checked** - No unexpected size increases
- [ ] **Accessibility maintained** - Keyboard navigation and ARIA work
- [ ] **Error handling present** - All async operations handle errors
- [ ] **Type exports updated** - New types are exported for consumers
- [ ] **README updated** - If new features or public API changes
- [ ] **No console.log** - Only `console.warn` and `console.error` allowed
- [ ] **Security reviewed** - No exposed secrets, proper input validation
- [ ] **Content consistency** - String arrays have consistent punctuation
