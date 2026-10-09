# Canada (CAN)

Schema versions for employee onboarding in Canada.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `CAN`) to inspect field-level diffs between your current pin and v7. Prefer jumping straight from v1 to v7 when upgrading.
- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Flag-gated, and employments created before the cutoff date are unaffected — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CAN: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Adds a structured daily working schedule: a required `schedule_type` and a `daily_schedule` fieldset. `work_hours_per_week` keeps its name but now lives in the schedule fieldset, and its bounds come from the schedule instead of `work_schedule`.
- Adds a required `third_party_work` question (with `third_party_work_activities` when the answer is `"yes"`).
- The post-termination restriction fields are replaced by the shared ones: `non_compete_clause_apply`, `non_solicitation_employees`, `non_solicitation_customers` and `non_interference_apply` are required. `non_compete_clause_apply` is hidden and must be omitted when `province_of_residency` is `ON`, because Ontario law prohibits non-compete clauses.
- `non_compete_clause`, `non_solicitation_clause` and `non_solicitation_clause_halt_period_months` are deprecated and read-only. They're no longer required, and new submissions shouldn't send them.
- **Breaking for submits:** payloads built for v5 or earlier fail validation until the new required fields are sent.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CAN: { contract_details: 6 },
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
      CAN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds high-salary reserve messaging: the annual gross salary description is now computed and gains a reserve sentence when the salary is above the high-salary threshold for the selected currency. A display-only `salary_overview` statement is added and never submitted.
- The salary, the currency selection and `part_time_salary_confirmation` are grouped in an `annual_gross_salary_fieldset`. Field names and values are unchanged.
- The schema moves to the jsf v1 engine.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CAN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `standard_hours` is computed from `work_hours_per_week` (weekly hours × 52 / 24, rounded to two decimals) and locked to that value, shown as a "Standard Hours" statement.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CAN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- The annual gross salary field and its minimum-wage check come from a shared Canada salary component. The field name and the submitted value are unchanged.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CAN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version.
