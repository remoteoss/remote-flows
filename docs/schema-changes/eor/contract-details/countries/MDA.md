# Moldova (MDA)

Schema versions for employee onboarding in Moldova.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: "yes"`): `contract_duration_type` only accepts `"indefinite"`, and `contract_end_date` is rejected if provided. This depends on a backend setting that is not enabled yet; employments created before the cutoff date are unaffected, and Remote Admins can still override the block for approved exceptions. No action required for existing contracts
- `contract_end_date` now has a maximum selectable date, 5 years ahead, and declares its type as `"string"` instead of `["string"]`
- `contract_duration_fixed_term_reason` is retitled "Reason for fixed term contract". Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MDA: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when `annual_gross_salary` is at or above the USD 1,000,000 equivalent in MDL and stay hidden below it. Additive and depends on a backend setting, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MDA: { contract_details: 5 },
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
      MDA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- `annual_leave_carry_forward` is deprecated because paid-time-off carryover is governed by statutory policy: it is no longer required, is read-only, accepts `null` and is titled "(Deprecated) Offer carryover paid time off?". Stop submitting it for new contracts. Stored values on existing contracts stay valid; on read, the field may be `null` or absent

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MDA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- The schema is marked as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`)
- Removes `post_termination_restrictions`. Stop submitting it
- `non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers` and `non_solicitation_employees` are now always required and accept only `"yes"` or `"no"` (the `null` / "N/A" option is gone). Partners using a custom UI must render and submit all four
- When `non_compete_clause_apply` is `"yes"`, the new `non_compete_clause_compensation_percentage` (minimum 1% of monthly base salary), `non_compete_clause_halt_period_months` and `non_compete_breach_compensation` are required. The new `non_compete_clause_compensation_amount` is computed from `annual_gross_salary` and the percentage. `non_compete_clause_halt_period_months` changes from integer to number
- When `non_interference_apply`, `non_solicitation_customers` or `non_solicitation_employees` is `"yes"`, its duration (`non_interference_halt_period`, `non_solicitation_customer_number_of_months` or `non_solicitation_employees_number_of_months`, 1 to 12 months) is required and no longer accepts `null`. When it is `"no"`, the duration must not be sent
- Reworded titles and descriptions for these fields. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MDA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
