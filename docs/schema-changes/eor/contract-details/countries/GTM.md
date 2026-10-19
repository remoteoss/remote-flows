# Guatemala (GTM)

Schema versions for employee onboarding in Guatemala.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v1_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` and `contract_duration_fixed_term_reason` are rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- `contract_end_date` and `contract_duration_fixed_term_reason` no longer accept `null`

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GTM: { contract_details: 6 },
    },
  }
/>
```

---

### v5

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GTM: { contract_details: 5 },
    },
  }
/>
```

---

### v4 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path
- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary` no longer has a static description. The related salary fields are grouped with it in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GTM: { contract_details: 4 },
    },
  }
/>
```

---

### v3

**What changed:**

- `incentive_bonus_amount` is replaced by the required `incentive_bonus_ack` checkbox (`acknowledged`): the monthly incentive bonus is fixed by law at GTQ 250.00 and is no longer entered. Partners using a custom UI must render the checkbox and stop sending `incentive_bonus_amount`
- Adds the optional `monthly_teleworking_contribution` money field (GTQ, at least 250.00 per month when provided)
- `post_termination_restrictions` is removed, so `non_interference_apply` is now always asked and required. Its duration, `non_interference_halt_period`, must be between 1 and 12 months
- `available_pto_type` is now a read-only hidden field fixed to `fixed`, so `available_pto` is always required. The `unlimited` option is gone
- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GTM: { contract_details: 3 },
    },
  }
/>
```

---

### v2

**What changed:**

- `non_compete_clause_apply` and `non_compete_clause_halt_period_months` are removed
- `non_solicitation_employees` and `non_solicitation_customers` no longer offer an N/A option and are now always required
- `non_solicitation_employees_number_of_months` and `non_solicitation_customer_number_of_months` are required when their clause applies and now accept 1 to 12 months (the minimum was 0), and are relabelled "Duration in months"
- Labels and descriptions of the non-solicitation questions are reworded

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GTM: { contract_details: 2 },
    },
  }
/>
```

---

### v1

Initial version with basic contract details fields.
