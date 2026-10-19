# Egypt (EGY)

Schema versions for employee onboarding in Egypt.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Replaces `third_party_work` with two fields: a required `third_party_work_allowed` yes/no question and an optional `third_party_work_activities` text area for the allowed activities. `third_party_work` is deprecated and no longer required
- Replaces `non_solicit_clause_apply` and `non_solicit_clause_halt_period_months` with separate clauses, each a required yes/no question:
  - `non_interference_apply` (with `non_interference_halt_period` when yes)
  - `non_solicitation_customers` (with `non_solicitation_customer_number_of_months` when yes)
  - `non_solicitation_employees` (with `non_solicitation_employees_number_of_months` when yes)
- The clause durations accept 1 to 12 months. The deprecated `non_solicit_clause_halt_period_months` accepted up to 24
- Adds the required `overtime_compensation_type` field (`overtime_remunerated`, `time_off` or `included_in_salary`)
- Partners using a custom UI must render the new required questions

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EGY: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- `contract_end_date` now also accepts `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EGY: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is unusually high

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EGY: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested
- Drops the minimum-salary description from `annual_gross_salary`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EGY: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Baseline for this changelog, on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EGY: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (deprecated)

**Deprecated on 30 April 2026.** Requests pinned to this version are served the latest schema.

Initial version with basic contract details fields.
