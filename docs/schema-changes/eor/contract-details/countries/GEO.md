# Georgia (GEO)

Schema versions for employee onboarding in Georgia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Only `indefinite` is valid then. Gated by the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags for Georgia, and employments created before the cutoff date are unaffected. Remote Admins can still override the block.
- `contract_end_date` is now typed as a plain `string` instead of a one-item list. No action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GEO: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GEO: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical, compliance

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics.
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is now a computed attribute instead of a static string so it can append the reserve sentence. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GEO: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`).
- Minimum paid time off validation is now 24 days for part-time employment as well, and the `available_pto` description no longer asks to pro-rate for part-time employees.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GEO: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds `non_compete_clause_compensation_amount` and `non_compete_clause_compensation_percentage`, conditionally required when a post-termination restriction (non-compete) applies. `non_compete_clause_halt_period_months` now has a minimum of 0.
- Reworded the `non_compete_clause_apply` and `non_compete_clause_halt_period_months` title and description.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GEO: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
