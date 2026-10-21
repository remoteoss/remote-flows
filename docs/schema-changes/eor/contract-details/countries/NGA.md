# Nigeria (NGA)

Schema versions for employee onboarding in Nigeria.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Only `indefinite` is valid in that case.
- Flag-gated: applies once the `eor_seniority_block` and `eor_seniority_block_v1_ftc` feature flags are enabled for Nigeria. Employments created before the cutoff date are unaffected, and Remote Admins can still override the block.
- No action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NGA: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds the extreme high salary acknowledgement: a warning and a mandatory checkbox when the annual salary is at or above the USD 1,000,000 equivalent.
- Additive and flag-gated. No action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NGA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds high-salary reserve messaging to the annual gross salary field. A display-only `salary_overview` statement is shown above the salary block, and the salary description appends a reserve sentence when the salary exceeds the high-salary threshold for the selected currency.
- The salary field, the currency selection and `part_time_salary_confirmation` are grouped in `annual_gross_salary_fieldset`.
- The schema moves to the jsf v1 engine, which the per-currency threshold rule needs.
- `annual_gross_salary.description` now arrives as a computed attribute instead of a static string. Custom renderers must handle that and ignore `salary_overview`, which is never submitted.
- The `has_bonus` conditional no longer hides `bonus_amount`, a field Nigeria does not declare.
- No action required for existing contracts. Validation behavior is unchanged.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NGA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `notice_period` component
  - Handles country-specific notice period rules automatically
  - Unit, minimum, and maximum values are country-specific
- Added `notice_period_choice` field for policy-based configurations
- Old `notice_period_[unit]` field removed from required fields
- Component manages validation based on employment type and local regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NGA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
