# North Macedonia (MKD)

Schema versions for employee onboarding in North Macedonia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in MKD and stay hidden below it. Submit `extreme_salary_acknowledgement` with the value `"acknowledged"` when it is shown. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MKD: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v5 or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is grouped with `annual_gross_salary` and `part_time_salary_confirmation`. Render it but never submit it
- `annual_gross_salary` no longer has a static description. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MKD: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** technical

**What changed:**

- The schema is marked as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`)
- Removes `post_termination_restrictions`. The clauses are no longer asked behind that question: `non_compete_clause_apply`, `non_solicitation_employees` and `non_solicitation_customers` are now always required, each `"yes"` or `"no"` (the `null` / N/A option is removed). `non_interference_apply` is optional and also accepts `null`. Partners using a custom UI must render and submit them
- Removes the `has_non_compete_clause_compensation` checkbox. When `non_compete_clause_apply` is `"yes"`, `non_compete_clause_halt_period_months` (1 to 24 months) and the new `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) are required, and the new `non_compete_clause_compensation_amount` is computed from them and the annual gross salary
- `non_solicitation_employees_number_of_months` and `non_solicitation_customer_number_of_months` (each 1 to 24 months) are required when their matching clause is `"yes"`, and `non_interference_halt_period` when `non_interference_apply` is `"yes"`
- Retitled and reworded the clause fields, for example `non_compete_clause_apply` is now "Do you want to apply post-termination restrictions (non-compete)?" and `non_solicitation_customers` is now "Apply a non-solicitation of customers clause?"

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MKD: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** technical

**What changed:**

- Adds required `notice_period_choice`: `"recommended"` (1 month) or `"custom"`. With `"recommended"`, `notice_period` is hidden, read-only and fixed to `1`. With `"custom"`, `notice_period` (1 to 3 months) is shown and required. Partners using a custom UI must render and submit `notice_period_choice`
- `notice_period` now defaults to `1` and its description is reworded

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MKD: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Renames the required bonus question `has_variable_bonus` to `has_bonus` (`"yes"` / `"no"`). Partners using a custom UI must submit `has_bonus` instead of `has_variable_bonus`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MKD: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
