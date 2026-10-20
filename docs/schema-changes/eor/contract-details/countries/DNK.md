# Denmark (DNK)

Schema versions for employee onboarding in Denmark.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DNK: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** risk

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DNK: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DNK: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** risk

**What changed:**

- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The related salary fields are grouped with the salary field in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DNK: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Adds the non-compete, non-interference and non-solicitation clauses: `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` are now required, with their dependent duration and compensation fields (`non_compete_clause_halt_period_months`, `non_compete_clause_compensation_percentage`, `non_compete_clause_compensation_amount`, `non_interference_halt_period`, `non_solicitation_customer_number_of_months`, `non_solicitation_employees_number_of_months`) shown conditionally. Partners using a custom UI must render them

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DNK: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
