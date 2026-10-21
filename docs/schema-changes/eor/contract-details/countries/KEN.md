# Kenya (KEN)

Schema versions for employee onboarding in Kenya.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v1_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- `contract_end_date` now also accepts `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The related salary fields are grouped with the salary field in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Deprecates `annual_leave_carry_forward` and `carryover_details`, since paid-time-off carryover is governed by statutory policy in Kenya and is applied automatically. They are hidden from new contracts and render read-only for existing ones
- Partners integrating via the API should stop sending `carryover_details`. On read responses `annual_leave_carry_forward` may now be `null` or absent

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Raises the minimum paid time off validation to 21 days for part-time employment

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- The `daily_schedule` component (`schedule_type`, `daily_schedule`) is added and `work_hours_per_week` becomes hidden. `schedule_type` is required (`flexible`, `core_business_hours` or `fixed_hours`)
- Adds the required `available_pto_type` field (`unlimited` or `fixed`). `available_pto` is only shown for `fixed`, together with `annual_leave_carry_forward` and `carryover_details`
- Adds the required `third_party_work` yes/no question, with `third_party_work_activities` when yes
- Adds the required `overtime_compensation_type` field (`overtime_remunerated`, `time_off` or `included_in_salary`)
- Adds the required `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` yes/no questions, with a duration of 1 to 12 months when yes (`non_interference_halt_period`, `non_solicitation_customer_number_of_months`, `non_solicitation_employees_number_of_months`)
- `non_compete_clause_halt_period_months` is now required when `non_compete_clause_apply` is yes
- Partners using a custom UI must render the new required fields

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `notice_period` component
  - Handles country-specific notice period rules automatically
  - Unit, minimum, and maximum values are country-specific
- Added `notice_period_choice` field for policy-based configurations
- Old `notice_period_[unit]` field removed from required fields
- Component manages validation based on employment type and local regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      KEN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
