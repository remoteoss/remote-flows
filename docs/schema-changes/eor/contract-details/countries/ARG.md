# Argentina (ARG)

Schema versions for employee onboarding in Argentina.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARG: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance, technical

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field: a display-only `salary_overview` statement is grouped with the salary fields in an `annual_gross_salary_fieldset` built by the component.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARG: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- The minimum `available_pto` is 14 days for part-time employments too, and the field description no longer asks to pro-rate it.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARG: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Post-termination restriction fields are added and required: `non_compete_clause_apply` (with `non_compete_clause_halt_period_months` and `non_compete_clause_compensation_percentage` when applied, the percentage being at least 1% of monthly base salary), `non_solicitation_employees` and `non_solicitation_customers` (each with a duration of 1 to 12 months when applied), and `non_interference_apply` (with `non_interference_halt_period`, 1 to 12 months, when applied).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARG: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
