# India (IND)

Schema versions for employee onboarding in India.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `IND`) to inspect field-level diffs between your current pin and v6. Prefer jumping straight from v2 to v6 when upgrading.
- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Flag-gated, and employments created before the cutoff date are unaffected — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IND: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated — no action required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IND: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The form moves to the JSON Schema Form v1 engine. Fields and values are unchanged; validation and form generation follow v1 semantics.
- `annual_gross_salary` adds high-salary reserve messaging and is grouped with `compensation_currency_code` and `part_time_salary_confirmation` in `annual_gross_salary_fieldset`. Additive and flag-gated — no action required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IND: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds post-termination restrictions. `post_termination_restrictions` (`"yes"` / `"no"`) is now required. When it's `"yes"`, `non_solicitation_employees`, `non_solicitation_customers` and `non_interference_apply` are required, and each `"yes"` requires its length in months (`non_solicitation_employees_number_of_months`, `non_solicitation_customer_number_of_months`, `non_interference_halt_period`).
- Adds a required `third_party_work` (`"yes"` / `"no"`). When it's `"yes"`, `third_party_work_activities` is required.
- `has_non_compete_clause` and `non_compete_clause_halt_period_months` are deprecated and read-only. They're no longer required, and new submissions shouldn't send them.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IND: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Added two new required fields: `work_location` and `professional_tax_location_state_name`
- These fields capture the employee's work location and state for professional tax purposes to comply with India's state-level tax regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IND: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
