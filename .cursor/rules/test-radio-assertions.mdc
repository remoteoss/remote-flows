---
description: Use assertRadioValue helper for radio button assertions in tests
globs: **/*.test.{ts,tsx}
alwaysApply: false
---

# Radio Button Assertions in Tests

When asserting radio button values in tests, use the `assertRadioValue` helper function instead of manually querying and asserting.

## Pattern to Use

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
