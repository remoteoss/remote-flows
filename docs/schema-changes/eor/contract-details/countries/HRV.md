# Croatia (HRV)

Schema versions for employee onboarding in Croatia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: "yes"`): `contract_duration_type` only accepts `"indefinite"`, and `contract_end_date` and `contract_duration_fixed_term_reason` are rejected if provided. This depends on a backend setting that is not enabled yet and is rolled out gradually; employments created before the cutoff date are unaffected, and Remote Admins can still override the block for approved exceptions. No action required for existing contracts
- `contract_duration_fixed_term_reason` is retitled "Reason for fixed term contract". Copy only
- `contract_end_date` declares its type as `"string"` instead of `["string"]`. No action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HRV: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when `annual_gross_salary` is at or above the USD 1,000,000 equivalent in EUR and stay hidden below it. Additive and depends on a backend setting, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HRV: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path; validation and form generation follow its semantics. Pin v3 or earlier to keep the previous engine
- Adds the display-only `salary_overview` field, grouped with the salary field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary` no longer has the static description about the legal minimum salary. Additive and depends on a backend setting; no action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HRV: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- The schema is marked as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`)
- Removes `post_termination_restrictions` and `has_non_compete_clause_compensation`. Stop submitting them
- `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` are now always required and accept only `"yes"` or `"no"` (the `null` / "N/A" option is gone). Partners using a custom UI must render and submit all four
- When a clause is `"yes"`, its duration is required: `non_compete_clause_halt_period_months`, `non_interference_halt_period`, `non_solicitation_customer_number_of_months` or `non_solicitation_employees_number_of_months`, each a number from 1 to 12 months. When it is `"no"`, the duration must not be sent
- Reworded titles and descriptions for these fields. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HRV: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- Adds required `post_termination_restrictions` (`"yes"` / `"no"`). When `"yes"`, `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` are required; when one of the last three is `"yes"`, its duration in months (`non_interference_halt_period`, `non_solicitation_customer_number_of_months`, `non_solicitation_employees_number_of_months`) is required too
- Adds optional `non_compete_clause_halt_period_months` and `has_non_compete_clause_compensation`
- Adds required `third_party_work` (`"yes"` / `"no"`). When `"yes"`, `third_party_work_activities` (text, up to 10,000 characters) is required. Partners using a custom UI must render and submit them
- `confidentiality_agreement` is deprecated in favor of the post-termination restriction fields: it is no longer required, is read-only, accepts `null` and is titled "(Deprecated) Confidentiality Agreement, non-solicit clause"
- Whitespace change in the `available_pto` description. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HRV: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
