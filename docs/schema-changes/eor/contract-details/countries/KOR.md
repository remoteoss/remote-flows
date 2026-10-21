# South Korea (KOR)

Schema versions for employee onboarding in South Korea.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

- Contract details rules now run on the server. `work_hours_per_week` is read-only and must equal the number of work days times `work_week_schedule.working_hours` (5 days for full-time), so send it computed rather than typed
- Full-time fixed-term contracts shorter than 12 months get `available_pto` locked to the number of contract months, counted from the provisional start date
- `holiday_days_for_part_time_worker` can no longer include a selected work day
- External companies can no longer use experience levels 4 to 6; use 2 or 3

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {{
      KOR: {{ contract_details: 7 }},
    }},
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. The `annual_gross_salary` minimum is raised accordingly. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {{
      KOR: {{ contract_details: 6 }},
    }},
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, grouped with the salary field. Render it but never submit it
- `annual_gross_salary.description` is no longer set statically; the salary field is built by the component. Additive and flag-gated, no action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {{
      KOR: {{ contract_details: 5 }},
    }},
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Replaces `non_compete_and_non_solicitation_period_months` with `non_compete_clause_apply` (required), `non_compete_clause_halt_period_months`, and a compensation field: `non_compete_clause_compensation_amount` or `non_compete_clause_compensation_percentage`. The halt period and compensation are only required when the clause applies
- `non_solicit_clause_halt_period_months` is deprecated and read-only. Stop sending the removed field

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {{
      KOR: {{ contract_details: 4 }},
    }},
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- Adds the required `indefinite_termination_ack` checkbox when `contract_duration_type` is `indefinite`, and `probation_length_recommended`
- `available_pto` is limited to 15 to 25 days for contracts of 1 year or longer; fixed-term contracts shorter than 1 year get 1 day per contract month
- `contract_end_date` now has a default and a `maxDate` of two years after the start date. Fixed-term contracts are limited to two years in total

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {{
      KOR: {{ contract_details: 3 }},
    }},
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Adds `notice_period_choice`, `notice_period_during_probation_choice` and `notice_period_fieldset`. `notice_period_days` and `notice_period_during_probation_days` default to 30 and accept 30 to 60 days, and are only required when the choice asks for a custom period
- `probation_length` now accepts `null`, and its description no longer ties more than 3 months to a 30 day notice period
- `is_home_address` now lists its options through `oneOf` instead of `enum` and its title changes to "Local"

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {{
      KOR: {{ contract_details: 2 }},
    }},
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
