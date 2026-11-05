# Dominican Republic (DOM)

Schema versions for employee onboarding in the Dominican Republic.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** product, compliance

**What changed:**

- The acknowledgement-based work schedule is replaced by a structured schedule:
  - `work_schedule` (`full_time` or `part_time`, required) replaces `work_week_schedule`. The `weekly_rest_full_time` acknowledgement now appears and is required when `work_schedule` is `full_time`
  - `schedule_type` (`flexible`, `core_business_hours` or `fixed_hours`, required)
  - `work_hours_per_week` (number from 1 to 44, required)
  - `daily_schedule` is required when `schedule_type` is `core_business_hours` or `fixed_hours`, and must not be sent otherwise. It requires `selected_days`, and each selected day (`monday` to `sunday`) requires `start_time` and `end_time` in `HH:MM` (defaults `09:00` and `18:00`) and `break_duration_minutes`
- Paid time off: new required `available_pto_type` (`unlimited` or `fixed`). `available_pto` changes from the acknowledgement string `"14"` to a number and is no longer required on its own. With `fixed` it is required and must be at least 14; with `unlimited` it is locked to 14 when sent
- New required `third_party_work` (`yes` or `no`). `yes` requires `third_party_work_activities` (text, up to 10,000 characters)
- New required `work_equipment_provided_by` (`provided_by_client` or `provided_by_employee`), which replaces the free-text `work_equipment`
- New restrictive covenants, all required `yes` or `no`:
  - `non_solicitation_employees`: `yes` requires `non_solicitation_employees_number_of_months` (1 to 12)
  - `non_solicitation_customers`: `yes` requires `non_solicitation_customer_number_of_months` (1 to 12)
  - `non_interference_apply`: `yes` requires `non_interference_halt_period` (1 to 12)
- Deprecated: `work_week_schedule`, `work_hours_week_full_time`, `work_hours_full_time`, `lunch_break_full_time`, `work_days`, `work_hours_part_time`, `work_hours_week_part_time` and `work_equipment`. They are hidden, read-only and no longer required, but existing records keep their values and still return them

If you render a custom UI, render and submit the nine new required fields and their conditional follow-ups, and read `work_schedule`, `schedule_type`, `daily_schedule`, `work_hours_per_week` and `work_equipment_provided_by` instead of the deprecated fields. Treat `available_pto` as a number. Pin v6 to keep the acknowledgement-based schedule.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 7 },
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
      DOM: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Contract duration moves to the Dominican Republic `dom_contract_duration` component with admin override. The standalone `contract_duration_type` field (indefinite, fixed-term variants) is removed from the schema. Fixed-term is blocked for employees with a recognized seniority date, except for Remote Admins. Flag-gated; no action is required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with `annual_bonus_ack` in a fieldset titled "Annual gross salary" (now driven by the field's presentation settings instead of `annual_gross_salary_fieldset`). Additive and flag-gated, so no action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Schema metadata only: marks the form as using the previous JSON Schema Form engine. No field changes.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
