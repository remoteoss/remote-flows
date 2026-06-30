# United Kingdom (GBR)

Schema versions for employee onboarding in United Kingdom.

## Current Version

**Contract Details:** v3

## Contract Details

### v3 - Current

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

### v2

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

### v1

Initial version with basic contract details fields.
