# Colombia (COL)

Schema versions for employee onboarding in Colombia.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance, product

**What changed:**

- The probation period is blocked for employments with a recognized seniority date, the same way fixed-term contracts already are. For such an employment, `probation_length` is locked to `0` and any other submitted value is rejected, unless the request is made by a Remote Admin. Partners with a custom UI should send `probation_length: 0` for employees with a recognized seniority date.
- The custom "Must be smaller or equal to 2 months" error message on `probation_length` is replaced by the default maximum message. The maximum itself is unchanged.
- `probation_length` gains a help center link about probation periods in `x-jsf-presentation.meta.helpCenter`.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      COL: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      COL: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field, grouped with the related salary fields in an `annual_gross_salary_fieldset` built by the component.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      COL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The minimum `available_pto` for part-time employments is now 15 days.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      COL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- New required `col_experience_level` field (`support`, `technical`, `professional`, `management_executive`, `other`). The old `experience_level` field is deprecated, read-only and no longer required.
- New required `remote_working_type` field (`remote`, `hybrid`, `on_site`) rendered as radio options.
- Full-time `work_hours_per_week` minimum lowers from 40 to 35 hours.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      COL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Full-time `work_hours_per_week` maximum lowers from 44 to 42 hours.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      COL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
