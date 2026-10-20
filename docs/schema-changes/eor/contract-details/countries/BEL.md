# Belgium (BEL)

Schema versions for employee onboarding in Belgium.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Adds required `schedule_type` (`"flexible"` / `"fixed_hours"`). Full-time contracts can only be `"flexible"`; part-time contracts can be either. Partners using a custom UI must render and submit it
- When `schedule_type` is `"fixed_hours"`, `daily_schedule` is required: `selected_days` plus a `start_time`, `end_time` and `break_duration_minutes` entry for each selected day (Monday to Friday). `work_hours_part_time` must equal the weekly hours of that schedule
- Pin v7 to keep the previous shape

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in EUR and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Blocks fixed-term contracts when the employee's seniority date is recognized (`has_seniority_date` is `"yes"`). Flag-gated: once the seniority block flags are enabled for Belgium, `contract_duration_type` only accepts `"indefinite"` and `contract_end_date` is rejected for those employments, unless the request is made by a Remote admin. Employments created before the cutoff date are unaffected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v5 or later get the newer engine path. No field changes; pin v4 or earlier to keep the previous engine

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. Additive and flag-gated

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds required `non_compete_clause_apply` (`"yes"` / `"no"`). When `"yes"`, `non_compete_clause_halt_period_months`, `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) and `non_compete_clause_compensation_amount` apply
- Adds required `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` (each `"yes"` / `"no"`). `non_interference_halt_period` (1 to 12 months) is asked when `non_interference_apply` is `"yes"`; `non_solicitation_customer_number_of_months` and `non_solicitation_employees_number_of_months` are asked when their matching clause is `"yes"`. Partners using a custom UI must render and submit them
- Reworded the `annual_gross_salary` description (minimum salary now depends on years of experience) and the `bonus_salary` description for the 13th and 14th salaries

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Adds required `work_location_telework_ack` checkbox acknowledging that only telework arrangements are supported in Belgium. Partners using a custom UI must render and submit it
- `work_address_is_home_address` is now hidden and defaults to `"yes"`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BEL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
