# Lebanon (LBN)

Schema versions for employee onboarding in Lebanon.

## Current Version

**Contract Details:** v4

## Contract Details

### v4 - Current

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LBN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested ($175,000.00). Render it but never submit it. `annual_gross_salary.description` is dropped
- Full-time contracts have a minimum `annual_gross_salary` of USD 3,960, and part-time contracts a minimum computed from the schedule. `annual_gross_salary` is now required
- `bonus_amount` is no longer part of the schema. `has_bonus` and `bonus_details` stay

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LBN: { contract_details: 3 },
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
      LBN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
