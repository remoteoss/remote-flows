# Hungary (HUN)

Schema versions for employee onboarding in Hungary.

## Current Version

**Contract Details:** v4

## Contract Details

### v4 - Current

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HUN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** technical, compliance

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary`, `salary_overview` and the salary-adjacent fields are now grouped in `annual_gross_salary_fieldset`. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HUN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- `available_pto` now requires at least 20 days for part-time employment too. Before, part-time employees (`work_schedule: part_time`) could be given fewer days. Partners using a custom UI must not submit fewer than 20 days for part-time employees
- The `available_pto` description no longer asks you to pro-rate the days for part-time employment

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HUN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
