# Serbia (SRB)

Schema versions for employee onboarding in Serbia.

## Current Version

**Contract Details:** v9

## Contract Details

### v9 - Current

**Type of change:** compliance

**What changed:**

- The statutory paid break now counts as working time. The minimum break depends on the shift length: 15 minutes for shifts longer than 4 and shorter than 6 hours, 30 minutes for shifts of 6 to 10 hours and 45 minutes for shifts longer than 10 hours. Only break time above that minimum is subtracted from working time, and a break shorter than the day's minimum is rejected.
- Each day's `break_duration_minutes` must meet the minimum for that day's shift length. Per-day hours and `work_hours_per_week` count the statutory break as working time: an 8-hour shift with a 30-minute break gives 8.0 working hours, not 7.5.
- The default schedule is now 09:00-17:00 with a 30-minute break, instead of 09:00-18:00 with a 60-minute break.
- Adds the display-only `break_rules_statement` property. Render it but never submit it (`ignoreValue` is true).
- Consumers using the JSON Schema Form library need `@remoteoss/remote-json-schema-form-kit` 1.2.0 or later for the `time_diff_minutes` operator and the fourth `compute_work_hours` argument.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 9 },
    },
  }}
/>
```

---

### v8

**Type of change:** compliance

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Only `indefinite` is valid then. Gated by the `eor_seniority_block` and `eor_seniority_block_v1_ftc` feature flags for Serbia, and employments created before the cutoff date are unaffected. Remote Admins can still override the block.
- `contract_duration_fixed_term_reason` can now be `null`, `contract_end_date` is typed as a plain `string`, and `contract_duration_type` gains help-center content. No action is required for these.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. The `annual_gross_salary` minimum is also raised to match the new bounds. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is dropped from the schema in favour of it. Additive and flag-gated, so no action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics.
- Adds the `daily_schedule` component with its `schedule_type`, `selected_days`, `start_time`, `end_time` and `break_duration_minutes` fields and one object per weekday. `work_hours_per_week` is now owned by the component and arrives hidden, so provide it through the schedule.
- Adds the required `work_address` fieldset (`address`, `address_line_2`, `city`, `postal_code`, `is_home_address`) and required `field_of_work` and `required_qualifications`. Partners using a custom UI must render and submit them.
- Adds required `overtime_compensation_type`, `third_party_work` (with `third_party_work_activities` when allowed), `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees`, with `non_interference_halt_period`, `non_solicitation_customer_number_of_months` and `non_solicitation_employees_number_of_months` asked when the matching answer is `"yes"`.
- Deprecated and read-only, no longer required: `overtime_pay_confirmation` (use `overtime_compensation_type`), `skills_and_qualifications` (use `required_qualifications` and `field_of_work`) and `work_address_is_home_address` (use `work_address`). The `has_non_compete_non_solicitation` and `non_solicitation_preceding_period_months` fields and the unused `bonus_amount` are removed.
- `transportation_allowance_ack` is no longer required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance, technical

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds required `non_compete_clause_apply`. When it is `"yes"`, one of `non_compete_clause_compensation_amount` or `non_compete_clause_compensation_percentage` is asked, together with `non_compete_clause_halt_period_months` (1 to 24 months). Partners using a custom UI must render and submit them.
- `has_non_compete_non_solicitation` is reworded to "Apply non-solicitation clause?" and no longer mentions a non-compete.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the `transportation_allowance_ack` checkbox, required when the transportation allowance applies. `work_address_is_home_address` is fixed to `"no"`. Partners using a custom UI must render and submit the acknowledgement.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SRB: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**Type of change:** compliance

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
      SRB: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
