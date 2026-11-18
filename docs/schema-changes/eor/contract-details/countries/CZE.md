# Czech Republic (CZE)

Schema versions for employee onboarding in Czech Republic.

## Current Version

**Contract Details:** v7 (consulting), v1 (TEA)

## Hiring models

A Czech employment is hired under one of two hiring models, and the employment's `eor_hiring_model` says which: `cze_consulting` or `cze_tea` (Temporary Employment Agency). Each model has its own contract details schema and its own version numbers.

| Hiring model     | Versions | Current |
| ---------------- | -------- | ------- |
| `cze_consulting` | v1 to v7 | v7      |
| `cze_tea`        | v1       | v1      |

The versions listed under [Contract Details](#contract-details) below are the `cze_consulting` ones. A plain number in `jsonSchemaVersionByCountry` pins `cze_consulting`, so existing integrations keep working unchanged. To pin the TEA schema, pass an object with a version per model:

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: {
        contract_details: { cze_consulting: 7, cze_tea: 1 },
      },
    },
  }}
/>
```

- A model you leave out gets version 1. It never gets another model's number, so a `cze_tea` employment is not asked for v7.
- The model comes from the employment, so the contract details schema loads once the employment has loaded.

See [Hiring models](../../../../../src/flows/Onboarding/README.md#hiring-models) in the Onboarding docs for how the option works across countries.

### TEA v1 - Current

**What changed:**

- First version of the contract details schema for `cze_tea` employments. Render the fields the schema returns; they differ from the `cze_consulting` schema.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: {
        contract_details: { cze_consulting: 7, cze_tea: 1 },
      },
    },
  }}
/>
```

---

## Contract Details

### v7 - Current

**What changed:**

- Added the `contract_duration` component, with a maximum duration of `unlimited`. `contract_duration_type` is no longer required and the old has-contract-end-date conditional is removed.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- The annual gross salary component adds the extreme salary acknowledgement.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- The annual gross salary component gains a fieldset with a `part_time_salary_confirmation` field, and a reserve message with a titled layout.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The `daily_schedule` component replaces `work_hours_per_week`. It defaults to 09:00 to 18:00 with a 60 minute break, supports flexible, core business hours and fixed hours schedule types, forces 40 hours per week for full time, allows 1 to 39 hours for part time, and subtracts breaks from work hours.
- The part-time maximum of 39 hours conditional is removed, and `work_hours_per_week` is no longer required.
- `notice_period` now has a description (at least 2 months, which can drop to 1 month for underperformance or misconduct), and its minimum depends on whether an admin is creating the contract: 1 month when admin-created, 2 months otherwise.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Added the `non_compete` component, a non-compete clause field.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `notice_period` component
  - Handles country-specific notice period rules automatically
  - Unit, minimum, and maximum values are country-specific
- Added `notice_period_choice` field for policy-based configurations
- Old `notice_period_[unit]` field removed from required fields
- Component manages validation based on employment type and local regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
