# Portugal (PRT)

Schema versions for employee onboarding in Portugal.

## Current Version

**Contract Details:** v9

## Contract Details

### v9 - Current

**Type of change:** compliance

**What changed:**

- Adds the required `tax_and_social_security_numbers_ack` checkbox (title "Tax and social security number") - partners using a custom UI must render it and send "acknowledged"

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 9 },
    },
  }}
/>
```

### v8

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_acknowledgement` and `extreme_salary_warning`, shown when the annual gross salary is unusually high

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 8 },
    },
  }}
/>
```

### v7

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`); no field changes
- Partners pinning v7 or later get the newer engine path

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 7 },
    },
  }}
/>
```

### v6

**Type of change:** compliance

**What changed:**

- Adds the `salary_overview` field
- Extends the annual gross salary field with a computed attribute and a longer description

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 6 },
    },
  }}
/>
```

### v5

**Type of change:** compliance

**What changed:**

- No field changes
- `available_pto` now has a minimum of 22 days for part-time employees too. Before, part-time contracts accepted any value from 0, so submissions that were valid on v4 can fail validation

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 5 },
    },
  }}
/>
```

### v4

**Type of change:** compliance

**What changed:**

- Adds the post-termination restriction fields, all required to be answered with yes or no:
  - `non_interference_apply` (with `non_interference_halt_period` when yes)
  - `non_solicitation_customers` (with `non_solicitation_customer_number_of_months` when yes)
  - `non_solicitation_employees` (with `non_solicitation_employees_number_of_months` when yes)
  - `non_compete_clause_apply` (with `non_compete_clause_halt_period_months`, `non_compete_clause_compensation_percentage` and a computed `non_compete_clause_compensation_amount` when yes)
- Partners using a custom UI must render these four yes/no questions

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 4 },
    },
  }}
/>
```

### v3 (Since SDK 1.23.0, March 2026)

**Type of change:** compliance, product

**What changed:**

- New offboarding acknowledgment - requires employers to acknowledge complex statutory requirements about vacation pay, vacation allowance, and Christmas allowance upon termination
- Enhanced descriptions - provides more detailed and accurate information about allowances, training requirements, and offboarding entitlements
- Help center links updated - new documentation references added

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 3 },
    },
  }}
/>
```

### v2 (Since SDK 1.23.0, March 2026)

**Type of change:** compliance, technical, product

**What changed:**

- Work address standardization - moved from inline definition to reusable component
- Probation period UX improvement - introduced a yes/no question (has_probation_period) before asking for duration, and tightened the validation rules to match legal requirements more precisely (90-180 days instead of 15-240 days)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
