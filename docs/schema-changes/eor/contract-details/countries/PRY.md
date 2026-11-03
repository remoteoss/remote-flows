# Paraguay (PRY)

Schema versions for employee onboarding in Paraguay.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** product

**What changed:**

- Adds four required fields, each `"yes"` or `"no"`: `third_party_work`, `non_solicitation_employees`, `non_solicitation_customers` and `non_interference_apply`. Partners using a custom UI must render and submit them
- Answering `"yes"` to `third_party_work` also requires `third_party_work_activities` (text, up to 1000 characters)
- Answering `"yes"` to `non_solicitation_employees` or `non_solicitation_customers` requires its matching `non_solicitation_employees_number_of_months` or `non_solicitation_customer_number_of_months` (each 1 to 12 months)
- Answering `"yes"` to `non_interference_apply` requires `non_interference_halt_period` (1 to 12 months)
- Nothing else changes. Pin to v7 to keep the previous shape

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`). This depends on a backend setting that is not enabled yet. Once it is, `contract_duration_type` only accepts `indefinite` for those employments and `contract_end_date` is rejected if provided. Employments created before the cutoff date are unaffected, and Remote Admins can still override the block
- `contract_duration_type` gains help center content about contract duration types
- No action is required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** product

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in PYG and stay hidden below it. Submit `extreme_salary_acknowledgement` with the value `"acknowledged"` when it is shown. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical

**What changed:**

- The contract details form moves to the newer form engine (`x-rmt-meta.jsfVersion` is `"1"`). Validation and form generation follow the newer engine. Pin to an earlier version to keep the previous engine. No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is grouped with `annual_gross_salary` and the related salary fields. Render it but never submit it
- `annual_gross_salary` no longer has a static description. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- The minimum paid time off validation of 12 days now also applies to part-time employment, so `available_pto` below 12 is rejected for part-time employees
- `available_pto` description is reworded and asks not to include statutory, bank or public holidays

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

No changelog was published for this version; the changes below come from comparing the schemas.

- The schema is marked as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`)
- Removes the `non_compete_clause_compensation` checkbox. When `non_compete_clause_apply` is `"yes"`, the new `non_compete_clause_compensation_percentage` (at least 100% of monthly base salary) is required, and the new `non_compete_clause_compensation_amount` is computed from it and the annual gross salary. Partners using a custom UI must submit the percentage instead of the checkbox
- Retitled `non_compete_clause_apply` to "Do you want to apply post-termination restrictions (non-compete)?" and `non_compete_clause_halt_period_months` to "Duration in months" (still up to 6 months), with reworded descriptions

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRY: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
