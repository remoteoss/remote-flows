# United Kingdom (GBR)

Schema versions for employee onboarding in United Kingdom.

## Current Version

**Contract Details:** v2 (Since SDK 1.23.0)

## Contract Details

### v2 - Current (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `overtime_eligible` field

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
