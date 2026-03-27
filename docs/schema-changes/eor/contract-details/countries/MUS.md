# Mauritius (MUS)

Schema versions for employee onboarding in Mauritius.

## Current Version

**Contract Details:** v2 (Since SDK 1.23.0)

## Contract Details

### v2 - Current (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `notice_period` component for notice period handling
  - Unit: days
  - Minimum: 30 days
  - Required: false
- Added `notice_period_choice` field
- Part-time contracts:
  - `notice_period_choice` set to null (no notice period)
  - `notice_period_days` changed from const: 0 to const: null
- Full-time contracts:
  - Added `notice_period_days` to required fields

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MUS: { contract_details: 2 }
    }
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
