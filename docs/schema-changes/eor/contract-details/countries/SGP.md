# Singapore (SGP)

Schema versions for employee onboarding in Singapore.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- `has_notice_period` is relabelled "Do you want to use a customary notice period instead of the statutory notice period?"

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SGP: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SGP: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The salary field, the currency selection and `part_time_salary_confirmation` are grouped in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SGP: { contract_details: 3 },
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
      SGP: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
