# Vietnam (VNM)

Schema versions for employee onboarding in Vietnam.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked and the option is removed when the employee's seniority date is recognized (`has_seniority_date: yes`), once the seniority block feature flags are enabled for Vietnam. Employments created before the seniority block cutoff date are grandfathered, and Remote Admins can still override the block for approved exceptions
- When the block applies, only `indefinite` is valid for `contract_duration_type` and `contract_end_date` is rejected if provided
- `contract_duration_type` gains help center content, and `contract_end_date` is now typed as a single `string`

Flag-gated, so no action is required until the flags are enabled.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      VNM: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual salary is at or above the USD 1,000,000 equivalent and stay hidden below it
- The `minimum` attribute on `annual_gross_salary` changed. Read it from the schema instead of hardcoding it

Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      VNM: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` is no longer a static string

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      VNM: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance, product

**What changed:**

- Adds `working_hours_ack`
- `start_time`, `end_time`, `lunch_start_time` and `lunch_end_time` now use `inputType: "time"` instead of `"text"`
- `work_week_schedule` carries a `workScheduleConfig` with the allowed window: start no earlier than `06:00`, end no later than `22:00`, a rest break of at least 30 minutes, and breaks not subtracted from work hours

Custom UIs must render the schedule times as time inputs and enforce the same window.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      VNM: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- Removes `non_compete_clause_apply`, `non_compete_clause_halt_period_months`, `non_solicit_clause_apply` and `non_solicit_clause_halt_period_months`
- Adds `non_solicitation_customers` and `non_solicitation_employees`, both required, with `non_solicitation_customer_number_of_months` and `non_solicitation_employees_number_of_months` required when the matching answer is yes
- `non_interference_apply` is now a required `yes` or `no` (the N/A option is gone) and `non_interference_halt_period` is required when it is yes
- `available_pto` minimum drops from 12 to 1 day, subject to pro-ration

Custom UIs must replace the removed fields with the new non-solicitation ones.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      VNM: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Adds `non_interference_apply` and `third_party_work`, both required, with `non_interference_halt_period` and `third_party_work_activities` required when the matching answer is yes
- Deprecates `damages`, `has_retention_bonus`, `retention_bonus_amount`, `non_compete_clause_apply`, `non_compete_clause_halt_period_months` and `work_equipment_provided`. They become read-only, optional and accept `null`, and the titles are prefixed with "(Deprecated)"

Custom UIs must send the two new required answers and stop asking for the deprecated fields.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      VNM: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
