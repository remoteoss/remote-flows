# `makeComponentsRequired` Implementation Plan

## Overview

Add a `makeComponentsRequired?: boolean` prop (default: `false`) to `RemoteFlows`.
When `true`, the built-in **default** components read the flag from context and return `null`, effectively making them no-ops. User-provided components are unaffected and render normally. Field wrappers keep their existing `throw` behaviour for genuine "no component found" errors.

## Files to change

### 1. `src/types/remoteFlows.ts`
Add to `RemoteFlowsSDKProps`:
```ts
/**
 * When true, built-in default components render nothing.
 * Users must provide all required components via the `components` prop.
 * @default false
 */
makeComponentsRequired?: boolean;
```

---

### 2. `src/context.ts`
Add `makeComponentsRequired` to `FormFieldsContext` and expose via `useFormFields()`:
```ts
export const FormFieldsContext = createContext<{
  components: Components;
  makeComponentsRequired: boolean;
} | null>(null);

export const useFormFields = () => {
  // ...
  return {
    components: context.components,
    makeComponentsRequired: context.makeComponentsRequired,
  };
};
```

---

### 3. `src/RemoteFlowsProvider.tsx`

**`FormFieldsProvider`** — accept and forward the new prop (lazy defaults logic unchanged):
```ts
export function FormFieldsProvider({
  children,
  components: userComponents = {},
  makeComponentsRequired = false,
}: PropsWithChildren<{
  components?: Components;
  makeComponentsRequired?: boolean;
}>) {
  const resolvedComponents = useMemo(() => {
    return { ...lazyDefaultComponents, ...userComponents } as Components;
  }, [userComponents]);

  return (
    <FormFieldsContext.Provider value={{ components: resolvedComponents, makeComponentsRequired }}>
      ...
    </FormFieldsContext.Provider>
  );
}
```

**`RemoteFlows`** — pass through the new prop:
```ts
export function RemoteFlows({ makeComponentsRequired, ... }) {
  return (
    <FormFieldsProvider components={components} makeComponentsRequired={makeComponentsRequired}>
    ...
  );
}
```

---

### 4. Default components — return `null` when `makeComponentsRequired` is true

Each component in `src/components/form/fields/default/` reads the flag from context.
If `true`, returns `null` immediately. Otherwise renders as normal.

```ts
// example: CheckboxFieldDefault.tsx
export const CheckboxFieldDefault = ({ field, fieldState, fieldData }: FieldComponentProps) => {
  const { makeComponentsRequired } = useFormFields();
  if (makeComponentsRequired) return null;
  // ... existing render
};
```

Files to update:

| File |
|------|
| `CheckboxFieldDefault.tsx` |
| `TextFieldDefault.tsx` |
| `TextAreaFieldDefault.tsx` |
| `SelectFieldDefault.tsx` |
| `RadioGroupFieldDefault.tsx` |
| `DatePickerFieldDefault.tsx` |
| `NumberFieldDefault.tsx` |
| `EmailFieldDefault.tsx` |
| `CountryFieldDefault.tsx` |
| `FileUploadFieldDefault.tsx` |
| `MultiSelectFieldDefault.tsx` |
| `ButtonDefault.tsx` |
| `StatementDefault.tsx` |
| `FieldsetToggleButtonDefault.tsx` |
| `WorkScheduleFieldDefault.tsx` |

Field wrapper `throw` logic is **not changed** — it still fires if no component at all is registered.

---

## Usage example

```tsx
// Default components are no-ops; only user-provided components render
<RemoteFlows makeComponentsRequired auth={...}>
  <ContractorOnboarding components={defaultComponents} />
</RemoteFlows>

// Default behaviour unchanged — library defaults used as fallback
<RemoteFlows auth={...}>
  <ContractorOnboarding />
</RemoteFlows>
```
