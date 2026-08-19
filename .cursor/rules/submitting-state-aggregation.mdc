# Submitting State Aggregation Pattern

## Overview

When adding mutations to flow hooks (Onboarding, ContractorOnboarding, CreateCompany, etc.), you must aggregate their `.isPending` states into `isSubmitting`. This prevents double submissions and provides consistent loading states.

## The mutationToPromise Pattern

Most flow mutations are wrapped with `mutationToPromise()` for structured error handling.

### What it does

`mutationToPromise()` (from `@/src/lib/mutations.ts`) wraps a React Query mutation and returns a `mutateAsyncOrThrow` function that:

- Returns a promise resolving with unwrapped data (`response.data`)
- Rejects with structured errors (`error`, `rawError`, `normalizedErrors`, `fieldErrors`, `response`)
- Enables type-safe error handling with `isMutationError()` type guard

### Usage Pattern

```typescript
// 1. Define mutation
const createEmploymentMutation = useCreateEmployment();

// 2. Wrap with mutationToPromise
const { mutateAsyncOrThrow: createEmploymentMutationAsync } =
  mutationToPromise(createEmploymentMutation);

// 3. Call in handlers
try {
  const result = await createEmploymentMutationAsync(payload);
} catch (error) {
  if (isMutationError(error)) {
    console.error(error.normalizedErrors);
  }
}
```

### Critical: Two Variables

Wrapping creates TWO variables:

1. **Original mutation** (`createEmploymentMutation`) - Has `.isPending`, `.isSuccess`, etc.
2. **Wrapped function** (`createEmploymentMutationAsync`) - Only has the `mutateAsyncOrThrow` function

**Always use the ORIGINAL mutation for `.isPending`** — the wrapped function doesn't have it!

## Aggregating isSubmitting

After defining (and optionally wrapping) your mutations, aggregate ALL their `.isPending` states:

```typescript
// Define mutations
const createEmploymentMutation = useCreateEmployment();
const updateEmploymentMutation = useUpdateEmployment();
const signContractMutation = useSignContract();

// Wrap with mutationToPromise (optional, for error handling)
const { mutateAsyncOrThrow: createEmploymentMutationAsync } =
  mutationToPromise(createEmploymentMutation);
const { mutateAsyncOrThrow: updateEmploymentMutationAsync } =
  mutationToPromise(updateEmploymentMutation);
const { mutateAsyncOrThrow: signContractMutationAsync } =
  mutationToPromise(signContractMutation);

// Aggregate isSubmitting - use ORIGINAL mutations
isSubmitting:
  createEmploymentMutation.isPending ||  // ✅ Original mutation
  updateEmploymentMutation.isPending ||   // ✅ Original mutation
  signContractMutation.isPending,         // ✅ Original mutation
```

## Why This Matters

- **Prevents double submissions** - Submit buttons are disabled during mutations
- **Consistent UX** - Flow bag exposes `isSubmitting` for loading indicators
- **Avoids race conditions** - Only one mutation at a time

## Quick Checklist

When adding a new mutation:

- [ ] Define mutation using custom hook
- [ ] Wrap with `mutationToPromise()` if you need structured error handling
- [ ] Add **original mutation's** `.isPending` to `isSubmitting` aggregation
- [ ] Use `mutateAsyncOrThrow` (from wrapped function) in handlers

## Real Example: ContractorOnboarding

```typescript
import { mutationToPromise, isMutationError } from '@/src/lib/mutations';

// Define all mutations
const createEmploymentMutation = useCreateEmployment();
const updateEmploymentMutation = useUpdateEmployment();
const createContractDocumentMutation = useCreateContractorContractDocument();
const signContractDocumentMutation = useSignContractDocument();
const uploadFileMutation = useUploadFile();
const createInvoiceScheduleMutation = useCreateInvoiceSchedule();
const updateInvoiceScheduleMutation = useUpdateInvoiceSchedule();

// Wrap with mutationToPromise for error handling
const { mutateAsyncOrThrow: createEmploymentMutationAsync } =
  mutationToPromise(createEmploymentMutation);
const { mutateAsyncOrThrow: updateEmploymentMutationAsync } =
  mutationToPromise(updateEmploymentMutation);
const { mutateAsyncOrThrow: createContractDocumentMutationAsync } =
  mutationToPromise(createContractDocumentMutation);
const { mutateAsyncOrThrow: signContractDocumentMutationAsync } =
  mutationToPromise(signContractDocumentMutation);
const { mutateAsyncOrThrow: createInvoiceScheduleMutationAsync } =
  mutationToPromise(createInvoiceScheduleMutation);
const { mutateAsyncOrThrow: updateInvoiceScheduleMutationAsync } =
  mutationToPromise(updateInvoiceScheduleMutation);

// Aggregate isSubmitting - use ORIGINAL mutations
return {
  isSubmitting:
    createEmploymentMutation.isPending ||
    updateEmploymentMutation.isPending ||
    createContractDocumentMutation.isPending ||
    signContractDocumentMutation.isPending ||
    uploadFileMutation.isPending ||
    createInvoiceScheduleMutation.isPending ||
    updateInvoiceScheduleMutation.isPending,
};
```

## Common Mistakes

### ❌ Using Wrapped Function for isPending

```typescript
const createEmploymentMutation = useCreateEmployment();
const { mutateAsyncOrThrow: createEmploymentMutationAsync } =
  mutationToPromise(createEmploymentMutation);

// ❌ WRONG - wrapped function doesn't have isPending
isSubmitting: createEmploymentMutationAsync.isPending;

// ✅ CORRECT - use original mutation
isSubmitting: createEmploymentMutation.isPending;
```

### ❌ Forgetting to Add New Mutation

```typescript
// Added new mutation
const createInvoiceScheduleMutation = useCreateInvoiceSchedule();

// But forgot to add to isSubmitting
isSubmitting:
  createEmploymentMutation.isPending ||
  updateEmploymentMutation.isPending;
  // ❌ Missing createInvoiceScheduleMutation.isPending
```

**Result:** Users can double-submit, causing duplicate API calls.

### ❌ Using .isLoading Instead of .isPending

```typescript
// ❌ WRONG - mutations use .isPending
isSubmitting: createEmploymentMutation.isLoading;

// ✅ CORRECT
isSubmitting: createEmploymentMutation.isPending;
```

## Integration with Submit Buttons

```typescript
<button disabled={flowBag.isSubmitting}>
  {flowBag.isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

## When to Add a Mutation

**Add if:**

- ✅ User-initiated action (form submit, button click)
- ✅ Modifies server state (POST, PATCH, PUT, DELETE)
- ✅ Should block concurrent submissions

**Don't add if:**

- ❌ Background operation that shouldn't block UI
- ❌ Read operation (use `isLoading` aggregation instead)
- ❌ Optimistic update that completes instantly

## Testing

```typescript
// 1. Submit button disabled during mutation
expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();

// 2. isSubmitting is true
expect(result.current.isSubmitting).toBe(true);

// 3. Multiple submissions prevented
expect(mockMutation).toHaveBeenCalledTimes(1);
```

## Remember

**Every mutation that affects flow submission must be in the `isSubmitting` aggregation.** Missing even one mutation can cause double submissions and race conditions.
