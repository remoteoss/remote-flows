---
description: Build JSON Schema forms with useHeadlessForm, never by calling createHeadlessForm directly
paths:
  - 'src/flows/**'
  - 'src/common/**'
  - 'src/components/**'
---

# useHeadlessForm Rule

## Philosophy: One Hook Owns the Form Engine

`useHeadlessForm` (`src/common/useHeadlessForm.ts`) is the only place app code builds a form from a JSON Schema. It builds the form once per schema and options, then recomputes conditionals through `handleValidation`, which mutates the same `fields` array in place. Calling `createHeadlessForm` again on every value change throws that array away and rebuilds the whole form from the raw schema.

Importing `createHeadlessForm` is an oxlint error (`no-restricted-imports` in `.oxlintrc.json`).

## Pattern to Follow

### ❌ DON'T: Call createHeadlessForm yourself

```typescript
const form = useMemo(
  () => (schema ? createHeadlessForm(schema, fieldValues, options) : null),
  [schema, fieldValues, options],
);
```

### ✅ DO: Fetch the schema, hand it to useHeadlessForm

```typescript
const { data: schema, isLoading } = useQuery({
  queryKey: ['my-form-schema', countryCode],
  queryFn: fetchMySchema,
  select: ({ data }) => data?.data,
});

const { form, handleValidation, parseFormValues, onValuesChange } =
  useHeadlessForm({
    schema,
    initialValues: savedValues,
    options: { jsfModify: options?.jsfModify },
    strategy: 'buildOnce',
  });
```

`initialValues` are the saved values in API units (partner initial values merged with the employment's saved step data), not the live form values. They seed the first build so conditional fields are visible before the step mounts; after that, visibility follows `handleValidation`, and a rebuild caused by a `jsfModify` change keeps the last validated values.

Expose `handleValidation` and `parseFormValues` from the hook on the flow bag rather than calling `parseJSFToValidate` by hand, and call `onValuesChange` when the form values change.

**Reference:** `useBasicInformationSchema` and `useContractDetailsSchema` in `src/flows/Onboarding/api.ts`.

## Dynamic Data Goes in the Schema

Options, defaults, `disabled` flags, and anything else that comes from an API response go into the schema before the form is built, never onto `form.fields` afterwards.

jsf v1's `handleValidation` rebuilds every field from the schema and merges the result onto the same field objects. A property that isn't in the schema gets overwritten: options written after the build become `[]`. Nothing tells React, so the next render that doesn't rebuild the form shows the wiped field. The SDK's own submit usually re-renders straight afterwards and hides this. A partner who calls `flowBag.handleValidation` and then re-renders through their own state (opening a modal, say) doesn't get that re-render. That's how the contractor pricing plans (#1446) and the create company dropdowns (#1447) went empty.

### ❌ DON'T: Write onto the built fields

```typescript
const form = createHeadlessForm(schema, {}, options);
const field = form.fields.find((f) => f.name === 'country_code');
field.options = countries;
```

### ✅ DO: Build the schema from the data, memoized

```typescript
const schema = useMemo(
  () => ({
    ...baseSchema,
    properties: {
      ...baseSchema.properties,
      country_code: {
        ...baseSchema.properties.country_code,
        oneOf: countries.map(({ label, value, ...presentation }) => ({
          const: value,
          title: label,
          'x-jsf-presentation': presentation,
        })),
      },
    },
  }),
  [countries],
);

const { form, handleValidation, parseFormValues, onValuesChange } =
  useHeadlessForm({ schema, options: { jsfModify }, strategy: 'buildOnce' });
```

- **Option shape**: `title` becomes the option's `label` and `const` its `value`. Keys in `x-jsf-presentation` (`meta`, `disabled`) and other keys such as `description` are copied onto the option, so components that render `fieldData.options` see the same shape as before.
- **Keep the schema stable**: the form is rebuilt whenever `schema` is a new object, so memoize every input it's derived from. React Query `data` and `select` results keep their reference while the data is equal. Objects you derive yourself need their own `useMemo`.
- **Functions in `jsfModify` need a stable reference**: the hook deep-compares `options`, and two different functions are never equal. Use a module-level function or a memoized one, never an inline arrow.
- **Validation now checks the value**: with real `oneOf` entries, a preselected or partner-supplied value that isn't in the list fails with `The option "…" is not valid.` Check what the step preselects before migrating.
- **Read `checkFieldUpdates` through a ref** when a `watch` subscription is created once on mount, as `useJSONSchemaForm` does. Otherwise the subscription keeps calling the first render's `onValuesChange`.

**Reference:** `useCountriesSchemaField` in `src/flows/CreateCompany/api.ts`.

**Test it like a partner:** in the flow's render prop, a component calls `flowBag.handleValidation(...)` and then sets its own state. Assert the options are still there afterwards. `CompanyBasicInformationOptions.test.tsx` in `src/flows/CreateCompany/tests/` does this.

## Express Form Behaviour in the Schema First

Visibility, defaults, required-ness and values derived from other fields belong in the JSON schema, not in a `*Form.tsx`. A `useEffect` that calls `setValue` or `watch` to keep one field in step with another is a sign the schema was skipped: it only exists for the SDK's own form, so partners using the headless hook don't get it.

Try these in order, and stop at the first that works:

1. **Conditionals**: `if` / `then` / `else` in `allOf`, with `else: { properties: { field: false } }` to hide a field.
2. **Computed values**: `x-jsf-logic` `computedValues` (JSON Logic rules), applied to a field with `x-jsf-logic-computedAttrs`.
3. **Derived read-only value**: a `readOnly` field whose `const` and `default` are computed attributes, with a computed `statement` to show it. See `monthly_allowance` in `src/common/tests/jsfEngineSituations.ts`.
4. **Form code**: only when the schema can't express it. Say why in the PR description.

Before writing form code, search for a precedent: `src/common/tests/jsfEngineSituations.ts` and the existing schemas under `src/common/` and `src/flows/**/json-schemas/`.

Gotchas:

- A field with a `const` is a forced value. The SDK sets its value, and renders it only when it has a description or `statement`. It is always a statement, never a disabled input. If the design needs a disabled input, that is form code.
- Selects submit strings. Use string `const`s in `oneOf` (and string `default`s), not integers.
- JSON Logic `var` reads nested values with a dot path, e.g. `group.field`.

## Strategies

- **`buildOnce`**: use this for all new code.
- **`rebuild`**: only for moving a legacy call site onto the hook without changing behaviour. It will be removed (see `docs/USE_HEADLESS_FORM_ROLLOUT.md`).

## Known Exception: Legacy Call Sites

Files that still call `createHeadlessForm` directly carry a `// oxlint-disable-next-line no-restricted-imports -- TODO` comment on the import and are tracked in `docs/USE_HEADLESS_FORM_ROLLOUT.md`. That's debt, not a pattern to copy. Moving a file onto the hook removes its comment (lint fails on unused ones). New code never adds one.

Tests, `scripts/`, and `example/e2e` helpers (e.g. `fillOnboardingBenefitsStepDynamically` in `example/e2e/helpers/benefits.ts`) may still use the engine directly.
