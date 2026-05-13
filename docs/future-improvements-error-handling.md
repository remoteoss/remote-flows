# Future Improvements: Error Handling Standardization

This document tracks opportunities to further standardize error handling across the codebase using the `safeGetErrorPath` utility.

## Overview

The `safeGetErrorPath` utility was introduced to handle inconsistent API error response structures between environments. Currently, it's only applied to `extractAiValidationError`, but several other areas could benefit from the same defensive approach.

## Areas for Future Refactoring

### 1. src/lib/mutations.ts

#### extractFieldErrors (line 48)

**Current:**

```typescript
const errors = error.error || error;
```

**Potential improvement:**

```typescript
const errors = safeGetErrorPath(error, ['error', '']) || {};
```

#### mutateAsyncOrThrow (line 103)

**Current:**

```typescript
const errorData = response.error.error || response.error;
```

**Potential improvement:**

```typescript
const errorData =
  safeGetErrorPath(response, ['error.error', 'error']) || response.error;
```

#### mutateAsync (line 144)

**Current:**

```typescript
const errorData = response.error.error || response.error;
```

**Potential improvement:**

```typescript
const errorData =
  safeGetErrorPath(response, ['error.error', 'error']) || response.error;
```

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
  error: safeGetErrorPath<Error>(error, ['error', '']) || (error as Error),
  rawError:
    safeGetErrorPath<Record<string, unknown>>(error, ['rawError', '']) ||
    (error as Record<string, unknown>),
  fieldErrors: normalizedFieldErrors,
});
```

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
