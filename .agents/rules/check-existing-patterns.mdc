---
alwaysApply: true
description: Always verify existing code patterns before proposing solutions
---

# Check Existing Patterns Rule

## Philosophy: Verify Before You Code

Before proposing or implementing any solution, **always** check the existing codebase patterns. Never make up functions, imports, or patterns that don't exist.

## Critical Requirements

### 1. Read Before You Write

**ALWAYS** use the Read tool to check existing files before:

- Creating new components
- Adding new functions
- Importing modules or utilities
- Proposing architectural changes
- Suggesting API calls or hooks

### 2. Search for Similar Patterns

When implementing something new, **first search** for similar implementations:

```bash
# Find similar components
Glob: **/*StepComponent*.tsx

# Find similar API hooks
Grep: "export const use.*Options"

# Find similar type definitions
Grep: "export type.*FormPayload"
```

### 3. Follow Established Conventions

After finding existing patterns:

- ✅ **DO**: Follow the same structure, naming, and organization
- ✅ **DO**: Import from the same utility locations
- ✅ **DO**: Use the same helper functions
- ❌ **DON'T**: Create new utilities when existing ones exist
- ❌ **DON'T**: Invent new patterns without justification
- ❌ **DON'T**: Make assumptions about function signatures

## Examples

### ❌ BAD: Making Up Functions

```typescript
// Proposing this without checking if normalizeErrors exists:
import { normalizeErrors } from '@/src/lib/utils';

const errors = normalizeErrors(response.errors);
```

### ✅ GOOD: Verify First, Then Use

```typescript
// After reading src/lib/mutations.ts and finding normalizeFieldErrors:
import { normalizeFieldErrors } from '@/src/lib/mutations';

const errors = normalizeFieldErrors(response.fieldErrors, fields);
```

### ❌ BAD: Assuming Hook Patterns

```typescript
// Proposing a custom hook without checking the React Query pattern:
export const useCountries = () => {
  return useQuery(['countries'], fetchCountries);
};
```

### ✅ GOOD: Check Existing Patterns

```typescript
// After reading src/common/api/countries.ts and seeing the queryOptions pattern:
export const countriesOptions = (client: Client) => {
  return queryOptions({
    queryKey: ['countries'] as const,
    queryFn: () => getCountries(client),
  });
};
```

## Verification Checklist

Before implementing any code, verify:

- [ ] Similar components/functions exist
- [ ] Import paths are correct and files exist
- [ ] Utility functions are used correctly
- [ ] Type definitions match the established pattern
- [ ] API hooks follow the project's React Query pattern
- [ ] Error handling matches the existing approach
- [ ] File structure follows the established conventions

## When Creating New Patterns

If you genuinely need to create a new pattern (not just follow an existing one):

1. **Explain why** existing patterns don't work
2. **Show examples** of similar patterns in the codebase
3. **Document the decision** clearly
4. **Be consistent** with overall project architecture

## Red Flags

Stop and verify the codebase if you find yourself:

- Creating utilities that "should" exist
- Importing from paths you haven't read
- Proposing function signatures you haven't verified
- Suggesting "standard" approaches without checking the project's standards
- Using libraries or APIs without confirming they're installed/available

## Remember

**The codebase is the source of truth.** Always verify patterns exist before using them. Reading files takes seconds; debugging non-existent imports wastes minutes or hours.
