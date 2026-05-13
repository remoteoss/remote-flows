# Future Improvements: Error Handling Standardization

This document tracks opportunities to further standardize error handling across the codebase using the `safeGetErrorPath` utility.

## Overview

The `safeGetErrorPath` utility was introduced to handle inconsistent API error response structures between environments. Currently, it's only applied to `extractAiValidationError`, but several other areas could benefit from the same defensive approach.

### How safeGetErrorPath Works

```typescript
safeGetErrorPath(error, ['path1.nested', 'path2', 'path3']);
```

- Tries each path in order: `error.path1.nested`, then `error.path2`, then `error.path3`
- Returns the first value that exists (not `null` or `undefined`)
- Returns `null` if all paths fail
- Safe to use - handles `null`/`undefined` objects gracefully

**Important:** Since `safeGetErrorPath` already checks multiple paths, avoid redundant fallbacks. For example:

- ❌ `safeGetErrorPath(error, ['error']) || error` - redundant if you want `error` as fallback
- ✅ `safeGetErrorPath(error, ['error.nested', 'error'])` - check nested first, then parent
- ✅ `safeGetErrorPath(error, ['error']) || {}` - use when you want a different default

## Areas for Future Refactoring

### 1. src/lib/mutations.ts

#### extractFieldErrors (line 48)

**Current:**

```typescript
const errors = error.error || error;
```

**Potential improvement:**

```typescript
const errors = safeGetErrorPath(error, ['error']) || {};
```

**Explanation:** Provides safe access to `error.error`. If not found, returns empty object which is safe for the subsequent `errors.errors` check on line 49.

#### mutateAsyncOrThrow (line 103)

**Current:**

```typescript
const errorData = response.error.error || response.error;
```

**Potential improvement:**

```typescript
const errorData = safeGetErrorPath(response, ['error.error', 'error']) || {};
```

**Explanation:** `safeGetErrorPath` already checks both `response.error.error` and `response.error`, so no need for a redundant `|| response.error` fallback. Use `|| {}` as a safe default if both paths are missing.

#### mutateAsync (line 144)

**Current:**

```typescript
const errorData = response.error.error || response.error;
```

**Potential improvement:**

```typescript
const errorData = safeGetErrorPath(response, ['error.error', 'error']) || {};
```

**Explanation:** Same as `mutateAsyncOrThrow` - `safeGetErrorPath` already checks both paths, so `|| {}` provides a safe default.

### 2. src/flows/ContractorOnboarding/components/ContractorOnboardingForm.tsx

#### Error handling (lines 86-87)

**Current:**

```typescript
onError?.({
  error: error?.error || (error as Error),
  rawError: error?.rawError || (error as Record<string, unknown>),
  fieldErrors: normalizedFieldErrors,
});
```

**Potential improvement:**

```typescript
onError?.({
  error: safeGetErrorPath<Error>(error, ['error']) || (error as Error),
  rawError:
    safeGetErrorPath<Record<string, unknown>>(error, ['rawError']) ||
    (error as Record<string, unknown>),
  fieldErrors: normalizedFieldErrors,
});
```

**Explanation:** Removes the optional chaining (`?.`) in favor of `safeGetErrorPath`, which safely handles null/undefined. The cast to the expected type serves as the final fallback.

## Benefits of Future Refactoring

- Centralizes all defensive error handling logic
- Makes error path inconsistencies easier to debug
- Provides a single point of modification if error structures change
- Improves code maintainability and readability

## Implementation Considerations

Before implementing these changes:

1. Verify current error handling behavior with comprehensive tests
2. Ensure no breaking changes to existing error handling flows
3. Add tests for both old and new error formats
4. Consider gradual rollout to minimize risk
5. Document any changes in behavior

## Related Issues

- Original issue: AI validation errors not detected in production due to inconsistent error response structures between environments
