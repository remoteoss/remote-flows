# Cyprus (CYP)

Schema versions for employee onboarding in Cyprus.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Only `indefinite` is valid then. Gated by the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags for Cyprus, and employments created before the cutoff date are unaffected. Remote Admins can still override the block.
- `contract_end_date` is now typed as a plain `string` instead of a one-item list. No action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CYP: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CYP: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics. No field changes.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CYP: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is dropped from the schema in favour of it. Additive and flag-gated, so no action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CYP: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the required `work_from_home_allowance_ack` checkbox, which acknowledges the monthly remote work allowance, and `work_in_person_days_per_week` (1 to 5), which is required when `work_address_is_home_address` is `no`. Render and submit both.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CYP: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds `non_compete_clause_compensation_percentage` and the non-interference and non-solicitation fields (`non_interference_apply`, `non_interference_halt_period`, `non_solicitation_customers`, `non_solicitation_customer_number_of_months`, `non_solicitation_employees`, `non_solicitation_employees_number_of_months`), which are required or conditionally required.
- `non_compete_clause_compensation_amount` is now an integer money field in EUR, and `non_compete_clause_halt_period_months` has a minimum of 1.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CYP: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
