# Costa Rica (CRI)

Schema versions for employee onboarding in Costa Rica.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** risk

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CRI: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** risk

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field: a display-only `salary_overview` statement is grouped with the salary fields in an `annual_gross_salary_fieldset` built by the component.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CRI: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance, product

**What changed:**

- Adds a structured daily working schedule: a required `schedule_type` and a `daily_schedule` fieldset. `work_hours_per_week` keeps its name but now lives in the schedule fieldset, with a minimum of 1 and a maximum of 40.
- `work_days`, `off_work_day`, `has_probation_period`, `probation_length` and `work_equipment` are deprecated and hidden, and `work_days`, `off_work_day` and `has_probation_period` are no longer required. A `probation_ack` statement explains that probation is fixed at 3 months for indefinite-term contracts.
- Adds a required `available_pto_type`, and the minimum `available_pto` goes from 12 to 14 days.
- Adds a required `third_party_work` question (with `third_party_work_activities` when the answer is `"yes"`) and a required `non_interference_apply` (with `non_interference_halt_period`, 1 to 12 months, when applied).
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CRI: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- The non-compete fields are regrouped in a `non_compete_fieldset`: `non_compete_clause_apply` and `non_compete_clause_halt_period_months` (1 to 24 months) are kept with new titles and descriptions, and `non_compete_clause_compensation_amount` is removed.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CRI: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
