# Estonia (EST)

Schema versions for employee onboarding in Estonia.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` and `contract_duration_fixed_term_reason` are rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EST: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EST: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested (€150,000.00). Render it but never submit it. `annual_gross_salary.description` is dropped

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EST: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds required `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` (`"yes"` / `"no"`). Partners using a custom UI must render and submit them
- `non_interference_halt_period`, `non_solicitation_customer_number_of_months` and `non_solicitation_employees_number_of_months` (each 1 to 12 months) are asked when their matching clause is `"yes"`
- `non_compete_clause_compensation_percentage` (at least 50% of monthly base salary) is required when `non_compete_clause_apply` is `"yes"`
- `non_compete_clause_compensation_amount` is now an integer money value in EUR instead of a plain number

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      EST: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
