# South Africa (ZAF)

Schema versions for employee onboarding in South Africa.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- Fixed-term contracts are blocked, and the option removed, when the employee has a recognized seniority date (`has_seniority_date: yes`), unless the request is made by a Remote Admin. Flag-gated (`eor_seniority_block`, `eor_seniority_block_v2_ftc`), and employments created before the cutoff date are unaffected. No action required for existing contracts. The 12-month self-serve cap from v4 is unchanged.
- The contract duration fields move to the shared `contract_duration` component with unlimited maximum duration. The standalone `contract_duration_type` and `contract_end_date` field definitions and their help center metadata are removed from the schema, and the `contract_duration_fixed_term_months` requirement moves to a later position in `allOf`.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZAF: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Self-serve fixed-term contracts are capped at 12 months: `contract_duration_fixed_term_months` is now required when `contract_duration_type` is `fixed_term` and its maximum is 12, unless the request is made by a Remote Admin.
- The `probation_period` maximum drops from 6 to 3 months for non-admin requests (Remote Admins keep 6), and the field shows a warning about running a fair process during probation.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZAF: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds the extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZAF: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with `part_time_salary_confirmation` in a fieldset titled by the field's presentation settings. Additive and flag-gated, so no action is required.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZAF: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
