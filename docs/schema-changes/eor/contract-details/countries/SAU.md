# Saudi Arabia (SAU)

Schema versions for employee onboarding in Saudi Arabia.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SAU: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics. No field changes.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SAU: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is dropped from the schema in favour of it. Additive and flag-gated, so no action is required.
- The `bonus_amount` field is removed from the schema. Custom UIs must stop rendering and submitting it.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SAU: { contract_details: 3 },
    },
  }}
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
      SAU: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
