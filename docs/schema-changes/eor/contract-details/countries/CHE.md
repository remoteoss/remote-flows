# Switzerland (CHE)

Schema versions for employee onboarding in Switzerland.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: "yes"`): `contract_duration_type` only accepts `"indefinite"` and `contract_end_date` is rejected if provided. This depends on a backend setting that is not enabled yet and is rolled out gradually; employments created before the cutoff date are unaffected, and Remote Admins can still override the block for approved exceptions. No action required for existing contracts
- `contract_end_date` declares its type as `"string"` instead of `["string"]`. No action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in CHF and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 7 },
    },
  }}
/>
```

---

### v6 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v6 or later get the newer engine path; validation and form generation follow its semantics. Pin v5 or earlier to keep the previous engine. No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, grouped with the salary field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary` no longer has the static description about cantonal minimum wages. Additive and flag-gated; no action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- `available_pto` now has a minimum of 20 days for part-time employments too (it was 0 before), unless `available_pto_type` is `"unlimited"`. Part-time submissions with fewer than 20 days are rejected
- The `available_pto` description no longer asks to pro-rate for part-time employment. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds required `third_party_work` (`"yes"` / `"no"`). When `"yes"`, `third_party_work_activities` (text, up to 10,000 characters) is required
- Adds required `non_compete_clause_apply`, `non_solicitation_employees`, `non_solicitation_customers` and `non_interference_apply`. When one is `"yes"`, its period is required: `non_compete_clause_halt_period_months`, `non_solicitation_employees_number_of_months`, `non_solicitation_customer_number_of_months` or `non_interference_halt_period` (each 1 to 12 months)
- Partners using a custom UI must render and submit these fields

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 3 },
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
      CHE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
