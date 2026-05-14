---
alwaysApply: true
description: Always use isMutationError type guard when catching errors from mutateAsyncOrThrow
glob: 'src/**/*.{ts,tsx}'
---

# Mutation Error Handling Rule

## Philosophy: Type-Safe Error Handling

When catching errors from mutation operations, always use the `isMutationError` type guard to ensure type-safe access to error properties. This prevents runtime errors and enables TypeScript autocomplete.

## Pattern to Follow

### ✅ CORRECT: Use isMutationError Type Guard

```typescript
import { isMutationError } from '@/src/lib/mutations';

try {
  const result = await createEmploymentMutationAsync(payload);
  // Handle success
} catch (error) {
  if (isMutationError(error)) {
    // ✅ Type-safe access to error properties
    console.log(error.normalizedErrors); // Direct access to errors object
    console.log(error.fieldErrors);      // Array of field errors
    console.log(error.rawError);         // Original API error
    console.log(error.response);         // HTTP response

    // Example: Check for specific field errors
    const aiError = error.normalizedErrors.services_and_deliverables as {
      error: string[];
      source: string;
      skippable: boolean;
    } | undefined;

    if (aiError?.source === 'remote_ai') {
      // Handle AI validation error
      setFieldValues({
        ...values,
        services_and_deliverables_ai_warning: transformAiErrorResponse(),
        services_and_deliverables_error_skippable: aiError.skippable,
      });
    }
  }
  throw error; // Re-throw after handling
}
```

### ❌ INCORRECT: Don't Access Error Properties Without Type Guard

```typescript
// BAD: No type safety, error could be anything
catch (error: any) {
  const rawError = error.rawError; // Might not exist!
  const errors = error.rawError?.errors; // Unsafe navigation
}
```

