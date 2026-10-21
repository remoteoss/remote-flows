# Ireland (IRL)

Schema versions for employee onboarding in Ireland.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- Hourly wage type and the daily schedule are no longer hidden from Partners API (`remote_api`) consumers. `wage_type` and `hourly_gross_salary` are now returned, and the `daily_schedule` component (`daily_schedule`, `schedule_type`, `work_hours_per_week`) replaces the plain `work_hours_per_week` field.
- Part-time contracts must still use `wage_type` `salary`.

**Migration:**

Render and submit `wage_type` (`salary` or `hourly`), `hourly_gross_salary` when `wage_type` is `hourly`, and the daily schedule fields instead of the plain `work_hours_per_week` field. Consumers staying on v4 or earlier are unaffected.

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Flag-gated, and employments created before the cutoff date are unaffected — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Adds high-salary reserve messaging: a display-only `salary_overview` statement is added to the `annual_gross_salary_fieldset` and is never submitted. The fieldset title and the fields it groups are unchanged.
- The schema moves to the jsf v1 engine, which activates two validations that did nothing before: a part-time annual gross salary below the hourly-derived minimum is now rejected, and a missing annual gross salary is now rejected. Both are corrections, but payloads that relied on the old behavior can start failing validation.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version.
