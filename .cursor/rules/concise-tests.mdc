---
alwaysApply: true
description: Write minimal, focused tests that test specific functionality without generating comprehensive test suites
glob: '**/*.test.{ts,tsx,js,jsx}'
---

# Minimal Testing Rule

## Philosophy: Less is More ✨

The most powerful tests are the simplest ones. When creating tests, embrace these principles:

- **Reduce cognitive load**: A test with 3 assertions is easier to understand than one with 10
- **Faster feedback loops**: Fewer lines mean faster execution and quicker feedback
- **Better maintainability**: Simple tests break in obvious ways and are easier to fix
- **Clarity over completeness**: One clear test is worth more than three ambiguous ones
- **Ruthless elimination**: Delete anything that doesn't directly test the feature

Remember: **If you're tempted to write "just one more test case," that's a sign to stop and ask the user first.**

## Test Writing Guidelines

When writing tests, follow these principles:

### 1. Minimal Test Focus

- Write tests that focus ONLY on the specific functionality being tested
- Don't generate comprehensive test suites unless explicitly requested
- Focus on the core functionality being tested

### 2. Test Structure

- Include only the essential setup needed for the specific test
- Remove unnecessary test cases and focus on the core functionality
- Use exact object matching in assertions (no `expect.objectContaining()`)
- Clear mocks between tests for isolation

### 3. Vitest Globals

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

### 4. Incremental Approach

- Get one test working completely before adding more
- Don't write multiple test cases until the first one passes
- Ask the user if they want additional test cases after the first one works

### 5. Example Pattern

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
