# Code Review Guidelines

## Project Architecture

This project is a React component library (`@remoteoss/remote-flows`) that provides embeddable UI flows for Remote's HR and employment workflows. The following principles guide our architecture:

- **Provider-Based Architecture**: Root `<RemoteFlows>` provider wraps multiple nested contexts (auth, theming, form customization)
- **Feature-First Organization**: Each flow is self-contained with its own components, hooks, context, and tests
- **Headless Component Pattern**: Flows expose both pre-built UI components and headless hooks for custom implementations
- **Render Props for Flexibility**: Consumers control rendering while we provide the business logic and components
- **API Client Generation**: OpenAPI schema auto-generates TypeScript types and SDK methods (never manually write API clients)
- **Multi-Entry Points**: Package exports multiple entry points for tree-shaking (`./`, `./internals`, `./flows/*`)

## Coding Standards

### TypeScript

- **Strict mode enabled** - all strict TypeScript checks are enforced via `tsconfig.json`
- **No `any` types** - except where explicitly needed with `/* eslint-disable @typescript-eslint/no-explicit-any */`
- **Use `$TSFixMe` type** - for temporary type workarounds (defined in `src/types/remoteFlows.ts`)
- **Export types** - all public types must be exported for consumer TypeScript support
- **Type imports** - use `import type` for type-only imports where possible
- **Intersection types for props** - combine component props with variants:
  ```typescript
  React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> &
    { asChild: boolean };
  ```

### Code Style

**Enforced by Prettier:**

- Single quotes (including JSX: `jsxSingleQuote: true`)
- Semicolons required
- Trailing commas everywhere
- 80 character line width
- 2 space indentation

**Enforced by ESLint:**

- React Hooks rules (exhaustive dependencies)
- Only export components in flow files (react-refresh)
- `no-console`: warn (only `console.warn` and `console.error` allowed)

**Naming Conventions:**

- Components: PascalCase (`CostCalculatorFlow`, `Button`)
- Hooks: camelCase with `use` prefix (`useCostCalculator`, `useAuth`)
- Files: Match export name (`CostCalculatorFlow.tsx`, `hooks.tsx`)
- CSS classes: Prefix with `RemoteFlows__` for public components (`RemoteFlows__Button`, `RemoteFlows__CostCalculatorForm`)
- Variants: Use `RemoteFlows_VariantName` format (`RemoteFlows_ButtonDefault`)

**Function Guidelines:**

- Use arrow functions for components and utilities
- Use regular functions for top-level exported functions with JSDoc
- Keep functions small and focused (ideally under 50 lines)
- Add JSDoc comments for all public APIs with `@param`, `@returns`, and description

### Import Conventions

Imports should be organized in this order:

1. External dependencies (React, third-party libraries)
2. Internal imports using `@/` alias
3. Type imports (preferably with `import type`)
4. Relative imports (avoid if possible)

**Example:**

```typescript
import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { jsonSchema } from '@/src/flows/CostCalculator/jsonSchema';
import type { CostCalculatorEstimationFormValues } from '@/src/flows/CostCalculator/types';

import { buildPayload } from './utils';
```

### Security

- **API key safety**: Never commit API keys or tokens (check `.env` files before commits)
- **Input sanitization**: Use `sanitizeHtml()` from `src/lib/utils.ts` before rendering HTML
- **XSS prevention**: Avoid `dangerouslySetInnerHTML` unless using sanitized content
- **Validate user inputs**: All form inputs must go through React Hook Form + Yup validation
- **No sensitive logging**: Never log tokens, passwords, or PII (check console statements)
- **Environment variables**: Use environment variables for secrets and API endpoints

### Testing

- **All new features require tests** - Unit tests for hooks and components
- **Test user interactions** - Use `@testing-library/react` and `@testing-library/user-event`
- **Mock API calls** - Use MSW (Mock Service Worker) handlers via `src/tests/server.ts`
- **Test edge cases** - Empty states, loading states, error states
- **Test validation** - Form validation errors and field-level errors
- **Fixtures per flow** - Organize test data in `src/flows/*/tests/fixtures.ts`
- **Coverage required** - Run `npm run test:coverage` to check coverage

**Test File Conventions:**

- Test files: `*.test.tsx` co-located with code in `tests/` directories
- Hook tests: Use `renderHook` from `@testing-library/react`
- Component tests: Use `render` and user events
- Query client wrapper: Wrap tests that use React Query with `QueryClientProvider`

**Example Test Pattern:**

```typescript
describe('useCostCalculator', () => {
  beforeEach(() => {
    server.use(
      http.get('*/v1/cost-calculator/countries', () => {
        return HttpResponse.json(countries);
      }),
    );
    queryClient.clear();
  });

  it('should load regions when a country with regions is selected', async () => {
    const { result } = renderHook(() => useCostCalculator(), { wrapper });

    await waitFor(() => {
      expect(countryField?.onChange).toBeDefined();
    });
  });
});
```

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
- **Build output check** - Review `dist/` size after builds

**Check:** Run `npm run build` and compare `dist/` size before/after.

### 3. Error Handling

Consistent error handling across all flows:

- **Field-level errors** - Use `extractFieldErrors()` and `normalizeFieldErrors()` from `src/lib/mutations.ts`
- **Mutation wrapper** - All mutations must use `mutationToPromise()` helper
- **Error response format** - Return `{ data: null, error: Error, rawError: object, fieldErrors: FieldError[] }`
- **User-friendly messages** - Extract field labels from metadata for error display
- **Try/catch blocks** - Async operations must have error handling
- **Fallback UI** - Loading states, error states, empty states

**Example:**

```typescript
const { mutateAsync } = mutationToPromise(useSomeMutation());

const result = await mutateAsync(values);
if (result.error) {
  const normalizedErrors = normalizeFieldErrors(result.fieldErrors, meta);
  // Handle field errors with user-friendly labels
}
```

### 4. Form Handling and Validation

Forms are central to this library - ensure consistency:

- **React Hook Form** - All forms use React Hook Form for state management
- **Yup schemas** - Validation schemas defined with Yup
- **JSON Schema Form** - Dynamic fields use `@remoteoss/json-schema-form`
- **Field mapping** - Custom field components mapped in `src/components/form/fields/fieldsMapping.tsx`
- **Validation timing** - Use `handleValidation` for combined static + dynamic validation
- **Parse before submit** - Use `parseJSFToValidate()` to transform form values
- **Required vs optional** - Match field requirements to JSON schema

**Check:** Are validation errors user-friendly? Do they display with proper field labels?

### 5. API Client Management

OpenAPI-driven development - never manually write client code:

- **Regenerate after schema changes** - Run `npm run openapi-ts` after API updates
- **Use generated types** - Import types from `src/client/types.gen.ts`
- **Use generated SDK** - Import API methods from `src/client/sdk.gen.ts`
- **Query hooks pattern** - Wrap generated client in custom hooks (see `src/common/api.ts`)
- **Error response handling** - API errors follow Remote's standard format
- **Environment config** - Use environment configs from `src/environments.ts`

**Example Query Hook:**

```typescript
export const useEmploymentQuery = ({ id, options }) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment', id],
    queryFn: () => getEmployment({ client, path: { id } }),
    select: ({ data }) => data,
    ...options,
  });
};
```

### 6. React Query Abstractions

When creating query abstractions, choose between custom hooks and queryOptions factories based on the use case:

#### Custom Hook Pattern (for idempotent data)

Use when the data transformation is always the same:

```typescript
// ✅ Good: Always returns same shape, no customization needed
export const useIdentity = () => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['identity'],
    queryFn: () =>
      getCurrentIdentity({
        client: client as Client,
        headers: { Authorization: `` },
      }),
    select: (data) => data.data?.data,
  });
};
```

**When to use:**

- Fixed data transformation that never varies
- Every consumer needs identical behavior (idempotent usage)
- No need for composability or customization
- The hook adds business logic beyond just query configuration

#### queryOptions Factory Pattern (for flexible data)

Use when consumers need to manipulate or transform data differently:

```typescript
// ✅ Good: Returns raw response, consumers add their own select
export const countriesOptions = (
  client: Client,
  queryKeySuffix = 'default',
) => {
  return queryOptions({
    queryKey: ['countries', queryKeySuffix] as const,
    retry: false,
    queryFn: async () => {
      const response = await getSupportedCountry({
        client,
        headers: { Authorization: `` },
      });
      if (response.error || !response.data) {
        throw new Error('Failed to fetch supported countries');
      }
      return response;
    },
  });
};

// Usage: consumers add their own transformations
const { client } = useClient();
const { data } = useQuery({
  ...countriesOptions(client),
  select: (response) => response.data?.filter((c) => c.active),
  staleTime: 60000,
});
```

**When to use:**

- Different consumers need different data transformations
- Need composability (enabled, select, staleTime, etc.)
- Used in prefetching or outside components
- Want to enable maximum flexibility

**Reference:** See `.cursor/rules/react-query-abstractions.mdc` and [TkDodo's article](https://tkdodo.eu/blog/creating-query-abstractions)

**Check:** Does the query need flexible transformations? Use `queryOptions`. Always returns same data? Use custom hook.

### 7. Theme and Styling

Custom theming system - maintain consistency:

- **Tailwind utility-first** - Use Tailwind classes, avoid inline styles
- **CSS variables** - Colors, spacing, radius defined as CSS variables
- **`cn()` helper** - Use for conditional class merging
- **Component variants** - Use `class-variance-authority` for variant handling
- **Prefix classes** - Public components use `RemoteFlows__` prefix
- **Dark mode support** - Test with `class="dark"` on root element
- **Theme customization** - Changes must work with theme overrides via `applyTheme()`

### 8. Performance

- **Memoization** - Use `useMemo` for expensive computations, `useCallback` for function props
- **Query invalidation** - Invalidate React Query cache appropriately on mutations
- **Avoid unnecessary re-renders** - Check React DevTools Profiler for re-render issues
- **Lazy loading** - Use dynamic imports for large components (PDF viewer, charts)
- **Virtualization** - Long lists should use virtualization (if applicable)
- **Bundle splitting** - Verify code splitting works for flows

### 9. Accessibility

Radix UI provides foundation - maintain it:

- **Keyboard navigation** - All interactive elements keyboard accessible
- **ARIA attributes** - Proper ARIA labels, roles, and states (Radix handles most)
- **Focus management** - Focus trapping in modals, focus return on close
- **Screen reader testing** - Test with screen readers when adding complex interactions
- **Color contrast** - Ensure text meets WCAG AA standards
- **Form labels** - All form fields have associated labels

### 10. Flow Structure and Organization

Each flow should follow this structure:

```
flows/[FlowName]/
├── index.ts                    # Public exports only
├── [FlowName]Flow.tsx          # Main flow component (render props)
├── hooks.tsx                   # Main business logic hook (use[FlowName])
├── api.ts                      # API query/mutation hooks
├── context.ts                  # Flow-specific context (if needed)
├── types.ts                    # TypeScript types
├── components/                 # Flow-specific components
│   ├── ComponentName.tsx
│   └── AnotherComponent.tsx
├── json-schemas/               # JSON schema definitions
│   └── schema.json
├── tests/                      # All tests for this flow
│   ├── fixtures.ts            # Test data
│   ├── [FlowName]Flow.test.tsx
│   └── hooks.test.tsx
└── utils.ts                    # Flow-specific utilities
```

**Key principles:**

- **Self-contained** - Flow should not import from other flows
- **Public exports** - Only export what's needed via `index.ts`
- **Render props** - Flow component accepts render prop with bag and components
- **Headless hook** - Expose `use[FlowName]()` hook for custom implementations
- **Tests co-located** - All tests in flow's `tests/` directory

### 11. Documentation

- **JSDoc for public APIs** - All exported functions, hooks, and components need JSDoc
- **README updates** - Update main README when adding new flows or features
- **Type documentation** - Complex types should have comments explaining usage
- **Changelog** - Follows conventional commits (auto-generated via `npm run release`)
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
- ESLint warnings for `react-hooks/exhaustive-deps` must be fixed
- Avoid disabling the rule - fix the dependency array instead

### 3. Type Safety Issues

- Using `any` without `eslint-disable` comment
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

### 8. Testing Issues

- Tests not using MSW for API mocking
- Missing `waitFor` for async assertions
- Not cleaning up React Query cache between tests
- Testing implementation details instead of behavior

### 9. Build and Release Issues

- Uncommitted changes in generated files (`src/client/*.gen.ts`)
- Breaking changes without `BREAKING CHANGE:` in commit message
- Version bump doesn't match change type (feat vs fix)
- Peer dependency changes without testing in example app

### 10. Package-Specific Issues

- Importing from `internals` in main package code (circular dependency risk)
- Not testing changes in example app (`example/`)
- Changes break backward compatibility without major version bump
- Adding dependencies that are already peer dependencies

## Review Checklist

Before approving a PR, verify:

- [ ] **No breaking changes** - Or properly documented with `BREAKING CHANGE:`
- [ ] **New tests added** - All new features/fixes have tests
- [ ] **JSDoc added** - Public APIs have documentation
- [ ] **Bundle size checked** - No unexpected size increases
- [ ] **Accessibility maintained** - Keyboard navigation and ARIA work
- [ ] **Error handling present** - All async operations handle errors
- [ ] **Type exports updated** - New types are exported for consumers
- [ ] **README updated** - If new features or public API changes
- [ ] **No console.log** - Only `console.warn` and `console.error` allowed
- [ ] **Security reviewed** - No exposed secrets, proper input validation

## Release Process

This project uses automated releases via GitHub Actions:

1. **Commit convention** - Use conventional commits (feat, fix, chore, etc.)
2. **PR merged** - Merge to `main` branch
3. **Version bump** - CI checks if version changed in `package.json`
4. **Auto-publish** - If version changed, package is published to npm
5. **Git tag created** - Tag matches package.json version
6. **GitHub release** - Auto-generated changelog from commits

**Manual release:**

```bash
npm run release
```

This will:

- Analyze commits since last release
- Determine version bump (major/minor/patch)
- Update `package.json` and `CHANGELOG.md`
- Create release branch and PR
- Open PR in browser

**IMPORTANT:** Never manually edit version in `package.json` without going through release process.

## Getting Help

- **Documentation**: Check `README.md` and flow-specific READMEs
- **Architecture questions**: Review this document and `src/` structure
- **Build issues**: Check `tsup.config.ts` and `package.json` scripts
- **Test issues**: See `vitest.config.ts` and `vitest-setup.ts`
- **CI issues**: Review `.github/workflows/ci.yml`
- **Ask the team**: When in doubt, ask for clarification before merging
