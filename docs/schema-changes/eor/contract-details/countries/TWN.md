# Taiwan (TWN)

Schema versions for employee onboarding in Taiwan.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- `contract_duration_type` is now locked to `indefinite` (`const` and `default`), with a statement explaining that only indefinite-term contracts are supported in Taiwan. Fixed-term contracts were already unavailable; the schema now enforces it
- `contract_end_date` is removed from the schema and from the fixed-term conditional. Do not render or send it: it is rejected if provided, including for Remote Admins
- Once the seniority block is enabled for Taiwan, employees with a recognized seniority date (`has_seniority_date: yes`) see a seniority-specific explanation. No action required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TWN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TWN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. Additive and flag-gated
- `annual_gross_salary` and `hourly_gross_salary` are grouped in a Salary fieldset, and `annual_gross_salary.description` is no longer a static string
- `non_compete_non_relationship_non_solicit_clause_apply` gains an `N/A` option (`null`) in its `oneOf`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TWN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Adds the non-compete, non-interference and non-solicitation fields: `non_compete_clause_apply`, `non_compete_clause_halt_period_months`, `non_compete_clause_compensation_amount`, `non_compete_clause_compensation_percentage`, `non_interference_apply`, `non_interference_halt_period`, `non_solicitation_customers`, `non_solicitation_customer_number_of_months`, `non_solicitation_employees` and `non_solicitation_employees_number_of_months`
- `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` are required. The halt-period, compensation and number-of-months fields are required only when their parent field is answered yes
- Deprecates `non_compete_non_relationship_non_solicit_clause_apply`, `non_compete_non_relationship_non_solicit_clause_halt_period` and `non_competition_non_relationship_and_non_solicitation_compensation_amount`. They are now read-only, no longer required and lose their min/max limits. Custom UIs should send the new fields instead

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TWN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
