# Latvia (LVA)

Schema versions for employee onboarding in Latvia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when `annual_gross_salary` is at or above the USD 1,000,000 equivalent in EUR and stay hidden below it. Additive and depends on a backend setting, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LVA: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, grouped with the salary field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary` no longer has the static description about the legal minimum salary. Additive and depends on a backend setting; no action required
- The `overtime_compensation_type` option `overtime_pay_included` is retitled "Employee will be paid for any overtime hours worked". Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LVA: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path; validation and form generation follow its semantics. Pin v3 or earlier to keep the previous engine
- Adds required `probation_length_recommended` (`"recommended"` or `"custom"`). `"recommended"` sets `probation_length` to the longest probation allowed for the contract; `"custom"` lets the user enter `probation_length`, up to that maximum. `probation_length` is now always required, has a minimum of 0 (0 waives probation) and no longer has a fixed maximum of 3
- For a fixed-term contract of 6 months or less, probation is fixed at 1 month and `probation_length_recommended` is fixed to `"recommended"`. This is driven by the new hidden helper `computed_is_fixed_probation`, which is never submitted
- `has_probation_period` is deprecated in favor of `probation_length_recommended`: it is no longer required, is read-only, accepts `null` and is titled "(Deprecated) Include a probation period?". Stop submitting it
- `available_pto` is shown once `work_schedule` is chosen (or `available_pto_type` is `"unlimited"`) and keeps its minimum of 20 days. It is retitled "Minimum paid time off days"
- `additional_holiday_days` is no longer shown. Stop submitting it
- `latvian_position_code` is now a hidden field
- `contract_end_date` now has a maximum selectable date, 5 years ahead
- Help content moves into help-center drawers on `contract_duration_type`, `notice_period_ack` and `time_tracking_rules_ack`. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LVA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- The schema is marked as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`)
- Removes `post_termination_restrictions` and `post_termination_restrictions_compensation_percentage`. Stop submitting them
- `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` are now always required. `non_compete_clause_apply`, `non_solicitation_customers` and `non_solicitation_employees` accept only `"yes"` or `"no"` (the `null` / "N/A" option is gone). Partners using a custom UI must render and submit all four
- When `non_compete_clause_apply` is `"yes"`, the new `non_compete_clause_compensation_percentage` (minimum 40% of monthly base salary) and `non_compete_clause_halt_period_months` are required. The new `non_compete_clause_compensation_amount` is computed from `annual_gross_salary` and the percentage
- When `non_interference_apply`, `non_solicitation_customers` or `non_solicitation_employees` is `"yes"`, its duration (`non_interference_halt_period`, `non_solicitation_customer_number_of_months` or `non_solicitation_employees_number_of_months`, 1 to 24 months) is required. When it is `"no"`, the duration must not be sent
- Reworded titles and descriptions for these fields. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LVA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Replaces the required `has_variable_bonus` with the required `has_bonus` (`"yes"` / `"no"`, titled "Offer other bonuses?"). Partners using a custom UI must submit `has_bonus` instead of `has_variable_bonus`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LVA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
