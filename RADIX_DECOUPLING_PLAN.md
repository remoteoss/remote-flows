# Radix UI Decoupling Plan

## Goal

Make `src/flows/CreateCompany/` work without any dependency on `@radix-ui/*` or `cmdk`.
Not a public release — internal use only. No monorepo needed.

## Current State

The branch (`own-library-radix`) has partially done the migration:

- **Done**: All field components (`CheckBoxField`, `SelectField`, `RadioGroupField`, `DatePickerField`, `NumberField`, `TextAreaField`, `WorkScheduleField`, `CurrencyConversionField`) now import from `src/components/form/FormField.tsx` (the new radix-free version) instead of `src/components/ui/form.tsx`.
- **Done**: All flow forms (`CreateCompanyForm`, `OnboardingForm`, etc.) import from `src/components/form/FormField.tsx`.
- **Not done**: Field components still `throw new Error` when no consumer-provided component is found. They need to return `null` instead.
- **Not done**: `src/components/ui/form.tsx` still uses `@radix-ui/react-label` and `@radix-ui/react-slot` — but this file is only consumed by `src/components/form/fields/default/` implementations, which are not used by CreateCompany.

## Dependency Map for CreateCompany

```
CreateCompany.tsx
  -> hooks.ts                         (no radix)
  -> context.ts                       (no radix)
  -> components/CreateCompanyForm.tsx
       -> FormField (src/components/form/FormField.tsx)  <- NEW, no radix
       -> JSONSchemaForm
            -> field components (CheckBoxField, SelectField, etc.)
                 -> FormField (src/components/form/FormField.tsx)  <- NEW, no radix
                 -> components?.checkbox | components?.select | ...  <- consumer provides or -> null
```

Radix is **not in this path** — as long as the field components don't throw when no component is provided.

## What Needs to Change

### Step 1 — Field components: return `null` instead of throwing

In each field component, replace the throw guard with a `null` return:

**Files to change:**
- `src/components/form/fields/CheckBoxField.tsx`
- `src/components/form/fields/SelectField.tsx`
- `src/components/form/fields/RadioGroupField.tsx`
- `src/components/form/fields/DatePickerField.tsx`
- `src/components/form/fields/NumberField.tsx`
- `src/components/form/fields/TextAreaField.tsx`
- `src/components/form/fields/WorkScheduleField.tsx`
- `src/components/form/fields/CurrencyConversionField.tsx`

**Pattern — before:**
```tsx
if (!Component) {
  throw new Error(`Select component not found for field ${name}`);
}
```

**Pattern — after:**
```tsx
if (!Component) {
  return null;
}
```

For fields that check before the `FormField` wrapper (like `NumberField`), the null return goes outside the render prop:
```tsx
const Component = props.component || components.number;
if (!Component) return null;
```

### Step 2 — `src/components/form/FormField.tsx` (untracked, already created)

This file is already the radix-free replacement. Verify it exports:
- `Form` (from react-hook-form's `FormProvider`)
- `FormField` (Controller wrapper)
- `FormFieldContext`, `FormItemContext`
- `FormItem`, `FormDescription`, `FormMessage`
- `useFormField`

It must NOT export `FormLabel` or `FormControl` (those use radix Slot/Label).
Any imports of `FormLabel` or `FormControl` from this file elsewhere need to be removed or replaced.

### Step 3 — Remove or stub `src/components/ui/` radix wrappers (optional for CreateCompany)

These files are only used by `src/components/form/fields/default/` implementations.
Since CreateCompany doesn't use the default implementations, **no action needed for now**.

If you want to clean up the package deps to prove no radix import leaks in:

```bash
# Verify CreateCompany build path has no radix imports
grep -r "@radix-ui\|cmdk" src/flows/CreateCompany src/components/form/FormField.tsx src/components/form/fields/CheckBoxField.tsx # etc
```

### Step 4 — Remove packages from `package.json` (optional, future)

Once ALL flows are migrated and `src/components/ui/` radix wrappers are gone:

```json
// Remove from "dependencies":
"@radix-ui/react-accordion": ...,
"@radix-ui/react-checkbox": ...,
"@radix-ui/react-collapsible": ...,
"@radix-ui/react-dialog": ...,
"@radix-ui/react-label": ...,
"@radix-ui/react-popover": ...,
"@radix-ui/react-radio-group": ...,
"@radix-ui/react-scroll-area": ...,
"@radix-ui/react-select": ...,
"@radix-ui/react-slot": ...,
"@radix-ui/react-tabs": ...,
"cmdk": ...
```

## Immediate Action (25% migration — make CreateCompany work now)

Only do Steps 1 and 2. That's it.

1. Change all `throw new Error(...)` guards in field components to `return null`.
2. Confirm `src/components/form/FormField.tsx` is correct and doesn't import radix.

CreateCompany will then render fields via consumer-provided components (or render nothing for unsupported field types), with zero radix dependency in its render path.

## What Is NOT Changed

- `src/components/ui/*.tsx` — left as-is (still uses radix, still consumed by `default/` implementations).
- `src/components/form/fields/default/*.tsx` — left as-is.
- All other flows (`Onboarding`, `Termination`, `ContractAmendment`, etc.) — untouched.
- No symlinks needed since the new `FormField.tsx` is a direct file in the repo.

## Verification

After changes, test CreateCompany renders without errors when no consumer components are passed:
```tsx
<CreateCompanyFlow
  render={({ components }) => (
    <>
      <components.CompanyBasicInformationStep />
    </>
  )}
/>
```
Fields with no matching consumer component should silently return null instead of throwing.
