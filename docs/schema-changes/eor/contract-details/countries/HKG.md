# Hong Kong (HKG)

Schema versions for employee onboarding in Hong Kong.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Once the seniority block is enabled for Hong Kong, an employee whose seniority date is recognized (`has_seniority_date` is `yes`) can no longer be given a fixed-term contract: `contract_duration_type` only accepts `indefinite` and `contract_end_date` is rejected if provided. Employments created before the seniority block cutoff date are unaffected, and Remote Admins can still override the block
- `contract_duration_type` gets updated help center copy
- No action required for existing contracts. Custom UIs should not offer `fixed_term` when the seniority date is recognized

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      HKG: { contract_details: 6 },
    },
  }
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      HKG: { contract_details: 5 },
    },
  }
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path
- No field changes. Pin to v3 or earlier to keep using the previous engine

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      HKG: { contract_details: 4 },
    },
  }
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` is no longer a static string. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      HKG: { contract_details: 3 },
    },
  }
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**Type of change:** compliance

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
      HKG: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
