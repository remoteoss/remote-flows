# Chile (CHL)

Schema versions for employee onboarding in Chile.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- `contract_end_date` now also accepts `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHL: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHL: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The related salary fields are grouped with the salary field in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Removes the `carryover` field from new contracts and no longer accepts it, since paid-time-off carryover is governed by statutory policy in Chile and is applied automatically
- Partners integrating via the API should stop sending `carryover`. Existing contracts are unaffected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- The `daily_schedule` component (`schedule_type`, `daily_schedule`, `work_hours_per_week`) and the required `is_excluded_from_working_hours` question are added. `work_hours_per_week` is now always required, from 1 to 45 hours
- Adds the required `available_pto_type` field (`unlimited` or `fixed`). `available_pto` is no longer required and is only shown for `fixed`, together with the `carryover` field
- Adds the `work_address` fieldset with a required `is_home_address` question. `work_address_is_home_address` is deprecated, read-only and no longer required
- Adds the required `non_interference_apply` yes/no question, with `non_interference_halt_period` (1 to 12 months) when yes
- Partners using a custom UI must render the new required fields

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds the required `non_compete_clause_apply` yes/no question. When yes, `non_compete_clause_halt_period_months` and either `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) or `non_compete_clause_compensation_amount` are required
- Adds the required `non_solicitation_customers` and `non_solicitation_employees` yes/no questions, each with a duration of 1 to 12 months when yes (`non_solicitation_customer_number_of_months`, `non_solicitation_employees_number_of_months`)
- Partners using a custom UI must render the new required questions

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
