# Bosnia and Herzegovina (BIH)

Schema versions for employee onboarding in Bosnia and Herzegovina.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** product

**What changed:**

- When the employee's seniority date is recognized, the probation period is blocked: `has_probation_period` is locked to `"no"` and `probation_length` to `0`, and any other submitted value is rejected. Most submissions are unaffected. Partners using a custom UI should send `"no"` for `has_probation_period` for such employments
- `has_probation_period` gains help center content explaining probation periods

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BIH: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in BAM and stay hidden below it. Submit `extreme_salary_acknowledgement` with the value `"acknowledged"` when it is shown. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BIH: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v5 or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is grouped with `annual_gross_salary` in the `annual_gross_salary_fieldset`. Render it but never submit it
- `annual_gross_salary` no longer has the static "In Bosnian Mark." description. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BIH: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** product

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Removes `post_termination_restrictions` and `has_non_compete_clause_compensation`. `non_compete_clause_apply`, `non_solicitation_customers` and `non_solicitation_employees` are now always required and accept only `"yes"` / `"no"` (no longer `null`). `non_interference_apply` is no longer required and accepts `null`
- When `non_compete_clause_apply` is `"yes"`, `non_compete_clause_halt_period_months` and `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) are required, and `non_compete_clause_compensation_amount` is computed from the percentage and the annual gross salary. When a non-solicitation clause is `"yes"`, its duration field (`non_solicitation_customer_number_of_months` or `non_solicitation_employees_number_of_months`, 1 to 24 months) is required
- The duration fields are retitled "Duration in months" and the clause descriptions are reworded. Partners using a custom UI must render and submit the new fields and stop sending the removed ones

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BIH: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Adds required `notice_period_choice`: `"recommended"` (30 days) or `"custom"`. With `"recommended"`, `notice_period_days` is hidden and fixed at 30. With `"custom"`, `notice_period_days` is shown and required. Partners using a custom UI must render and submit `notice_period_choice`
- `notice_period_days` loses its help center content and its description now reads "In Bosnia and Herzegovina, the notice period can last between 7 and 30 days."

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BIH: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- Replaces required `has_variable_bonus` with required `has_bonus` (`"yes"` / `"no"`). Partners using a custom UI must render and submit `has_bonus` instead of `has_variable_bonus`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BIH: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
