# Finland (FIN)

Schema versions for employee onboarding in Finland.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- `contract_end_date` now also accepts `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      FIN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      FIN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The related salary fields are grouped with the salary field in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      FIN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- When `non_compete_clause_apply` is yes, `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) is now required, and `non_compete_clause_compensation_amount` is shown as the amount computed from it and the annual gross salary. Partners using a custom UI must render them
- `non_compete_clause_halt_period_months` is relabelled "Duration in months" and no longer has the 6-month maximum

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      FIN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
