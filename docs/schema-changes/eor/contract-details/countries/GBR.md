# United Kingdom (GBR)

Schema versions for employee onboarding in United Kingdom.

## Current Version

**Contract Details:** v3 (Since SDK TBD, enforced July 1, 2026)

## Contract Details

### v3 - Current (Since SDK TBD, enforced July 1, 2026)

**What changed:**

- Removed `shift_pattern` field
- Added `risks_acknowledgment` required field — acknowledgement of UK employment law risks
- Added `work_schedule` as a required field

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

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
