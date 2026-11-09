# Migration Guide

This guide helps you upgrade between major versions of `@remoteoss/remote-flows`.

## Table of Contents

- [Version 1.0.0](#version-100)
  - [Overview](#overview)
  - [Breaking Changes](#breaking-changes)
    - [1. CostCalculatorFlow](#1-costcalculatorflow)
    - [2. RemoteFlows](#2-remoteflows)
    - [3. Internal imports](#3-internal-imports)
    - [4. handleValidation and parseFormValues](#4-handlevalidation-and-parseformvalues)
- [JSON Schema Form v1 migration](#json-schema-form-v1-migration)
  - [What is changing](#what-is-changing)
  - [How to read this section](#how-to-read-this-section)
  - [Replacement patterns](#replacement-patterns)
    - [Field descriptions: x-jsf-presentation.description](#field-descriptions-x-jsf-presentationdescription)
    - [Value cleanup: parseJSFToValidate](#value-cleanup-parsejsftovalidate)
    - [Schema changes: jsfModify](#schema-changes-jsfmodify)
    - [Validation: JSON Schema errors](#validation-json-schema-errors)
  - [Payroll Admin onboarding: select country step](#payroll-admin-onboarding-select-country-step)
  - [EOR and Contractor onboarding: select country step](#eor-and-contractor-onboarding-select-country-step)
  - [Cost Calculator](#cost-calculator)
  - [Termination](#termination)

## Version 1.0.0

### Overview

Version 1.0.0 marks the first stable release of `@remoteoss/remote-flows`. This release includes:

- ✅ Fix file uploads, now the FileUpload will only emit files
- ✅ `handleValidation` and `parseFormValues` from the flowBags will be async
- ✅ `ZendeskTriggerButton` import removed from `@remoteoss/remote-flows/internals`
- ✅ `CostCalculatorResults`, `CostCalculatorDisclaimer`, and `disclaimerUtils` will not be exported
- ✅ `authId` removed from `RemoteFlows` props

### Breaking Changes

#### 1. CostCalculatorFlow

Review that you aren't using any of these import names: `CostCalculatorResults`, `CostCalculatorDisclaimer`, and `disclaimerUtils`.

If you are, remove these imports as they are no longer exported from the main package.

#### 2. RemoteFlows

If you're using the `RemoteFlows` component, remove the `authId` property if it was previously used.

**Before:**

```tsx
<RemoteFlows auth={fetchToken} authId='user-123'>
  {/* flows */}
</RemoteFlows>
```

**After:**

```tsx
<RemoteFlows auth={fetchToken}>{/* flows */}</RemoteFlows>
```

#### 3. Internal imports

If you're importing `ZendeskTriggerButton` from the internals entry point, update the import path.

**Before:**

```tsx
import { ZendeskTriggerButton } from '@remoteoss/remote-flows/internals';
```

**After:**

```tsx
import { ZendeskTriggerButton } from '@remoteoss/remote-flows'#### 4. TerminationFlow and OnboardingFlow
```

#### 4. handleValidation and parseFormValues

`handleValidation` and `parseFormValues` method is now async

**Before:**

```tsx
onboardingBag.handleValidation(values);
```

**After**

```tsx
await onboardingBag.handleValidation(values);
```

**Before:**

```tsx
onboardingBag.parseFormValues(values);
```

**After**

```tsx
await onboardingBag.parseFormValues(values);
```

## JSON Schema Form v1 migration

### What is changing

The SDK builds its forms from JSON Schemas with [json-schema-form](https://github.com/remoteoss/json-schema-form) (JSF). The schemas the SDK ships itself (for example the country pickers and the Cost Calculator form) are moving from JSF v0 to JSF v1, one flow at a time.

Most of what changes fails silently. Nothing breaks at build time or in a type check. Instead, your users can hit a field that is never valid, a submit button that never enables, or an error message that never shows. **Before you update, search your code for the identifiers listed in each flow below.** Don't wait for a compiler error.

If you only use the SDK's prebuilt flows and default components, without `jsfModify`, you have nothing to change.

### How to read this section

- **Breaking**: you may need to change your code.
- **Non-breaking**: nothing to change, listed so you know what to expect.
- **Who is affected**:
  - **Headless consumers**: you render your own UI from the flow bag (`fields`, `handleValidation`, `parseFormValues`, ...) or the headless hook.
  - **Everyone using the flow**: the change applies to the prebuilt UI too.
- **Deprecated**: still works, but stop using it. Removal: to be decided by the SDK team.

### Replacement patterns

These patterns apply to every form that runs on JSF v1.

#### Field descriptions: x-jsf-presentation.description

A field's description is data in the schema. It is a string, which may contain HTML. React elements or functions passed as `description` are not supported: JSF v1 copies the schema as plain data on every validation, so they are lost after the first one.

To change a description, set `x-jsf-presentation.description` (it takes priority over `description`). To add a help center link, set `x-jsf-presentation.meta.helpCenter`.

**Before:**

```tsx
jsfModify: {
  fields: {
    currency: {
      description: (
        <>
          Select the billing currency.{' '}
          <ZendeskTriggerButton zendeskId={articleId}>Learn more</ZendeskTriggerButton>
        </>
      ),
    },
  },
}
```

**After:**

```tsx
jsfModify: {
  fields: {
    currency: {
      'x-jsf-presentation': {
        description: 'Select the <strong>billing currency</strong>.',
        meta: { helpCenter: { id: articleId, callToAction: 'Learn more' } },
      },
    },
  },
}
```

In a custom UI, read `field.description` (or `fieldData.description` in a custom field component) as an HTML string. Sanitize it before you render it, or pass it to `fieldData.transformHtml`. Render the help center link from `field.meta.helpCenter` (`fieldData.meta.helpCenter`). The SDK's default components already do both.

#### Value cleanup: parseJSFToValidate

`parseJSFToValidate` is internal: you don't call it. The bag's `handleValidation` and `parseFormValues` run it for you. It cleans the form values before they reach JSF: it trims text, removes empty values, and (in `parseFormValues`) leaves out the values of hidden fields and keys the step doesn't know.

What this means for you:

- Pass the raw form values to `handleValidation`. Don't validate them with JSF yourself.
- An empty or blank value counts as missing, so you get `Required field`.
- Use the result of `parseFormValues` as the payload. Don't send the raw values.

**Before** (JSF v1 called directly, without the cleanup):

```ts
form.handleValidation({ country: '' });
// { formErrors: { country: 'The option "" is not valid.' } }
```

**After** (through the bag):

```ts
await bag.handleValidation({ country: '' });
// { formErrors: { country: 'Required field' } }

await bag.parseFormValues({ country: 'PRT', region: 'lisbon' });
// { country: 'PRT' }
```

#### Schema changes: jsfModify

Change a form through the flow's `options.jsfModify`, which edits the schema before the form is built. Don't write onto `fields` after the form is built (`field.options = ...`, `field.label = ...`, `field.isVisible = ...`): on JSF v1 the next validation resets the fields from the schema, so those writes are lost.

`jsfModify.fields.<name>` accepts an object or a function that receives the field's schema. Data the SDK loads from the API, such as the country options, is set by the SDK and replaces what you pass for it.

**Before:**

```tsx
const country = onboardingBag.fields.find((field) => field.name === 'country');
country.label = 'Country of residence';
```

**After:**

```tsx
<OnboardingFlow
  options={{
    jsfModify: {
      select_country: {
        fields: { country: { title: 'Country of residence' } },
      },
    },
  }}
  {...otherProps}
/>
```

#### Validation: JSON Schema errors

Errors come from the JSON Schema, not from Yup.

- `handleValidation` resolves to `{ formErrors }`. There is no `yupError` on migrated forms (the Cost Calculator keeps a deprecated one, see below).
- `formErrors` is nested like the values: an error inside a fieldset is at `formErrors.<fieldset>.<field>`, not at a dotted `'<fieldset>.<field>'` key.
- When the values are valid, `formErrors` is missing or empty, depending on the flow. Check both: `!formErrors || Object.keys(formErrors).length === 0`.
- The default messages are `Required field`, `The option "<value>" is not valid.` and `The value must be a number`. A schema can set its own message for a rule with `x-jsf-errorMessage` (for example `Region is required`).
- Fields no longer carry a Yup schema (`field.schema`).

**Before:**

```ts
const { formErrors, yupError } = await bag.handleValidation(values);
const feeError = formErrors['management.management_fee'];
const hasErrors = yupError.inner.length > 0;
```

**After:**

```ts
const { formErrors } = (await bag.handleValidation(values)) ?? {};
const feeError = formErrors?.management?.management_fee;
const hasErrors = Boolean(formErrors && Object.keys(formErrors).length > 0);
```

### Payroll Admin onboarding: select country step

First released in v1.70.1 (#1879). The country picker at the start of `PayrollAdminOnboardingFlow` and `usePayrollAdminOnboarding` (field `country_code`) runs on JSF v1. It offers the same countries and is built once instead of on every render.

**Search for:** `yupError` and `.schema` in code that handles the `country_code` step, and code that writes onto the step's `fields`.

| Change                                                                                                           | Type         | Who is affected         |
| ---------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- |
| `handleValidation` on the country picker no longer returns `yupError`. Read `formErrors` instead.                | Breaking     | Headless consumers      |
| The `country_code` field has no Yup `schema` any more.                                                           | Breaking     | Headless consumers      |
| An empty country still fails with `Required field`, and an unknown one with `The option "<value>" is not valid.` | Non-breaking | Everyone using the flow |
| The country options stay on the field after `handleValidation` and a re-render.                                  | Non-breaking | Headless consumers      |

**Before:**

```ts
const result = await adminBag.handleValidation({ country_code: '' });
if (result?.yupError) {
  showErrors(result.yupError.inner);
}
```

**After:**

```ts
const result = await adminBag.handleValidation({ country_code: '' });
if (result?.formErrors) {
  showErrors(result.formErrors); // { country_code: 'Required field' }
}
```

This flow doesn't take a `jsfModify` option.

### EOR and Contractor onboarding: select country step

First released in v1.53.0 (#1310). The `select_country` step of `OnboardingFlow` and `ContractorOnboardingFlow` runs on JSF v1. The country options go into the schema as `oneOf` through `jsfModify`, and nothing is written onto the fields after the form is built.

**Search for:** `employment_agreement_preview_available`, `eor_onboarding`, `contractor_products_available`, `yupError`, `jsfModify.select_country` / `select_country:`, and code that reads `onboardingBag.fields` or `contractorOnboardingBag.fields` on the `select_country` step.

| Change                                                                                                                                                                                                                                                      | Type         | Who is affected         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- |
| The country options in `fields` are `{ label, value }` only. They no longer carry `employment_agreement_preview_available` (EOR) or `eor_onboarding` and `contractor_products_available` (Contractor). Read them from `GET /v1/countries` if you need them. | Breaking     | Headless consumers      |
| `handleValidation` on the step no longer returns `yupError`. Read `formErrors` instead.                                                                                                                                                                     | Breaking     | Headless consumers      |
| A country code that is not in the options now fails with `The option "<value>" is not valid.` Before, any code passed.                                                                                                                                      | Breaking     | Headless consumers      |
| `parseFormValues` on the step returns only the country (for example `{ country: 'PRT' }`). Empty values and keys that are not part of the step, such as a region, are left out. Before, it returned the values unchanged.                                   | Breaking     | Headless consumers      |
| A `description` passed through `jsfModify.select_country` must be a string (see [Field descriptions](#field-descriptions-x-jsf-presentationdescription)).                                                                                                   | Breaking     | Everyone using the flow |
| An empty country fails with `Required field`.                                                                                                                                                                                                               | Non-breaking | Everyone using the flow |
| `jsfModify.select_country.fields.country` is applied on top of the country options, as an object or as a function. The SDK's country list replaces any `oneOf` you pass.                                                                                    | Non-breaking | Everyone using the flow |

**Before:**

```ts
const country = onboardingBag.fields[0].options.find(
  (option) => option.value === code,
);
const hasPreview = country.employment_agreement_preview_available;
```

**After:**

```ts
const country = onboardingBag.fields[0].options.find(
  (option) => option.value === code,
); // { label, value }
const hasPreview = countriesFromApi.find(
  (item) => item.code === code,
)?.employment_agreement_preview_available; // your own GET /v1/countries data
```

### Cost Calculator

The Cost Calculator form (`CostCalculatorFlow` and `useCostCalculator`) runs on JSF v1 and is validated by its JSON Schema instead of Yup. Countries, currencies and regions go into the schema as `oneOf`, and the change handlers go through `jsfModify`.

**Search for:** `yupError`, `validationSchema`, `management.management_fee`, `childRegions`, `hasAdditionalFields`, `regionSlug`, the `currency` property of a country option, `name === 'region'`, `isVisible` on the region field, and any `description` you pass through `jsfModify`.

| Change                                                                                                                                                                                                                             | Type         | Who is affected         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- |
| `handleValidation` errors come from `formErrors`. `yupError` is still returned but deprecated. Removal: to be decided by the SDK team.                                                                                             | Deprecated   | Headless consumers      |
| The management fee error is nested at `formErrors.management.management_fee`. Before, it was at the `'management.management_fee'` key.                                                                                             | Breaking     | Headless consumers      |
| A country or currency that is not in the options fails with `The option "<value>" is not valid.` Before, any value passed.                                                                                                         | Breaking     | Headless consumers      |
| The country options are `{ label, value }`. `childRegions`, `hasAdditionalFields`, `regionSlug` and `currency` are still on them but deprecated. Removal: to be decided by the SDK team. Use `useCostCalculatorCountries` instead. | Deprecated   | Headless consumers      |
| When the selected country has no regions, `fields` has no `region` field. Before, it was there with `isVisible: false`.                                                                                                            | Breaking     | Headless consumers      |
| `validationSchema` (Yup) is kept but deprecated. Use `handleValidation`. Removal: to be decided by the SDK team.                                                                                                                   | Deprecated   | Headless consumers      |
| A `description` passed through `jsfModify` must be a string. Use `x-jsf-presentation.meta.helpCenter` for help center links (see [Field descriptions](#field-descriptions-x-jsf-presentationdescription)).                         | Breaking     | Everyone using the flow |
| The management fee maximum no longer rejects every fee when the billing currency has no base rate.                                                                                                                                 | Non-breaking | Everyone using the flow |

**Before:**

```ts
const { formErrors, yupError } =
  await costCalculatorBag.handleValidation(values);
const feeError = formErrors['management.management_fee'];
const regionField = costCalculatorBag.fields.find((f) => f.name === 'region');
const showRegion = regionField.isVisible;
const regions = selectedCountryOption.childRegions;
```

**After:**

```ts
const { formErrors } = await costCalculatorBag.handleValidation(values);
const feeError = formErrors?.management?.management_fee;
const regionField = costCalculatorBag.fields.find((f) => f.name === 'region');
const showRegion = Boolean(regionField?.isVisible);
const { data: countries } = useCostCalculatorCountries({
  includePremiumBenefits,
});
const regions = countries?.find((c) => c.value === country)?.childRegions;
```

### Termination

To be completed. The Termination detail steps (termination details, employee communication, paid time off, additional information) are being migrated. This section will be filled in when that change ships.

---

## Version History

- **v1.0.0** (2025-11-30) - First major release
- **v0.32.0** (2025-11-21) - before 1.00

---

_Last updated: [2025-11-30]_
