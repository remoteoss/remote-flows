# Australia (AUS)

Schema versions for employee onboarding in Australia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Extends the extreme-salary acknowledgement to Australia: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUS: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with `part_time_salary_confirmation` in a fieldset. Additive and flag-gated, so no action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUS: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The maximum contract duration changes from unlimited to 24 months, counted from the provisional start date. Fixed-term contracts longer than that fail validation.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUS: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `work_hours_per_week` is replaced by the shared `daily_schedule` component, so work hours are now submitted through the daily schedule.
- New required fields: `third_party_work`, `work_equipment_provided_by`, `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees`, with follow-up fields (`non_compete_clause_halt_period_months`, `non_interference_halt_period`, `non_solicitation_*_number_of_months`, `third_party_work_activities`). Submits that omit them fail validation.
- The part-time minimum salary rule moves under the full-time minimum rule's conditions, same intent.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUS: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- `available_pto` now has a minimum of 20 days for every schedule, and the PTO copy is reworded to say the 20 days are based on ordinary hours of work.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUS: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
