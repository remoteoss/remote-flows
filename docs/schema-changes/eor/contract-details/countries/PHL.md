# Philippines (PHL)

Schema versions for employee onboarding in the Philippines.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `PHL`) to inspect field-level diffs between your current pin and v6. Prefer jumping straight from v1 to v6 when upgrading.
- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Flag-gated, and employments created before the cutoff date are unaffected — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PHL: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- The De Minimis benefit fields are grouped in a `de_minimis_benefits_fieldset` and their copy is reworded: `has_additional_de_minimis_benefits` now states the mandatory monthly De Minimis amount, and `additional_de_minimis_benefits_amount` / `additional_de_minimis_benefits_covers` get new titles. Field names and values are unchanged.
- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated — no action required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PHL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The form moves to the JSON Schema Form v1 engine. Fields and values are unchanged; validation and form generation follow v1 semantics.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PHL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `annual_gross_salary` moves to the shared annual gross salary component and adds high-salary reserve messaging, grouped with the salary field in `annual_gross_salary_fieldset`. Additive and flag-gated — no action required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PHL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Added `has_night_shift` required field (`"yes"` / `"no"`) — whether the employee works between 10:00 p.m. and 6:00 a.m.
- Added `overtime_eligible` required field (`"yes"` / `"no"`)
- Added `time_tracking_rules_ack` checkbox — required when `has_night_shift` or `overtime_eligible` is `"yes"`
- `probation_length` and `has_additional_de_minimis_benefits` gain help center links

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PHL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
