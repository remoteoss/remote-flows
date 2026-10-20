# Peru (PER)

Schema versions for employee onboarding in Peru.

## Current Version

**Contract Details:** v4

## Contract Details

### v4 - Current

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Flag-gated, and employments created before the cutoff date are unaffected, so no action is required for existing contracts. Remote Admins can still override the block for approved exceptions.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PER: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PER: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field: a display-only `salary_overview` statement is grouped with the salary fields in an `annual_gross_salary_fieldset` built by the component.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PER: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
