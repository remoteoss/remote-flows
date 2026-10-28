# Morocco (MAR)

Schema versions for employee onboarding in Morocco.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** compliance

**What changed:**

- Once the seniority block is enabled for Morocco, `contract_duration_type` only accepts `indefinite` when the employee's seniority date is recognized (`has_seniority_date: yes`). `fixed_term` is removed from the options and `contract_end_date` is rejected if sent. Remote Admins can still override the block for approved exceptions
- Employments created before the seniority block cutoff date are grandfathered and unaffected
- `contract_end_date.type` is now the string `"string"` instead of a one-item list
- No action required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Fixed-term contracts now cap probation at 2 weeks, entered through the new `probation_length_weeks` field. It is required when the contract is fixed-term and probation applies
- `probation_length` (1 to 3 months) now applies to indefinite-term contracts only
- For fixed-term contracts with an existing `probation_length` value in months, convert it to weeks and resubmit under `probation_length_weeks` (max 2). Indefinite-term contracts are unaffected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` no longer carries the static minimum-salary sentence, and `salary_overview` and `part_time_salary_confirmation` are now grouped with the salary field. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** technical

**What changed:**

- Deprecates the carryover fields `annual_leave_carry_forward` and `carryover_details`, since paid time off carryover in Morocco follows statutory policy. Both are hidden from new contracts and shown read-only for existing ones, with a deprecation notice in their presentation
- `annual_leave_carry_forward` is no longer required and now accepts `null` (a new `N/A` option). On the read representation it may be `null` or absent. Do not send it for new contracts
- `can_expire`, `carry_over_pto_days` and `expiry_months` are read-only
- No action required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- `available_pto` keeps the 18-day statutory minimum but is now validated for part-time employment too, with a clearer description. Part-time contracts below 18 days are rejected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path. Pin v1 to stay on the previous engine
- The newer schema lists the contract clause and schedule fields up front: `schedule_type`, `daily_schedule`, `work_equipment_provided_by`, `third_party_work` and `third_party_work_activities`, `non_compete_clause_apply` and its halt period, `non_interference_apply` and its halt period, `non_solicitation_customers` and `non_solicitation_employees` with their month counts, and the carryover fields
- `schedule_type`, `work_equipment_provided_by`, `third_party_work`, `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers`, `non_solicitation_employees` and `annual_leave_carry_forward` are required. Render and submit them
- `work_hours_per_week` is capped at 44 and its description now says so

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MAR: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
