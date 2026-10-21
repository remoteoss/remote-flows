# South Korea (KOR)

Schema versions for employee onboarding in South Korea.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

- Contract details rules now run on the server. `work_hours_per_week` is now read-only and must equal the number of work days times `work_week_schedule.working_hours` (5 days for full-time). Partners using a custom UI must send that value
- For full-time fixed-term contracts shorter than 12 months, `available_pto` is locked to the number of contract months, counted from the provisional start date
- `holiday_days_for_part_time_worker` can no longer include a selected work day
- External companies can no longer use experience levels 4 to 6

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KOR: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KOR: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested (₩232,157,071). Render it but never submit it. `annual_gross_salary.description` is dropped

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KOR: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Removes `non_compete_and_non_solicitation_period_months`
- Adds required `non_compete_clause_apply` (`"yes"` / `"no"`). When `"yes"`, `non_compete_clause_halt_period_months` and `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) are required, and `non_compete_clause_compensation_amount` is shown as the amount computed from them and the annual gross salary. Partners using a custom UI must render them
- Adds `non_solicit_clause_halt_period_months` as a deprecated, read-only field. Do not send it

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KOR: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds required `probation_length_recommended` (`"recommended"` / `"custom"`)
- Adds `indefinite_termination_ack`, required when the contract is indefinite. Partners using a custom UI must render it
- Fixed-term contracts are capped at two years: `contract_end_date` defaults to and cannot go past two years from the start date
- `available_pto` must be between 15 and 25 days

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KOR: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Adds `notice_period_choice` and `notice_period_during_probation_choice` (`"recommended"` / `"custom"`), grouped in `notice_period_fieldset`
- `notice_period_days` and `notice_period_during_probation_days` now accept 30 to 60 days and default to 30. Before, the during-probation notice period was fixed at 0
- `probation_length` also accepts `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KOR: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
