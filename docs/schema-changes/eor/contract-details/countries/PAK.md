# Pakistan (PAK)

Schema versions for employee onboarding in Pakistan.

## Current Version

**Contract Details:** v2 (Since SDK 1.23.0)

## Contract Details

### v2 - Current (Since SDK 1.23.0, March 2026)

**What changed:**

- Removed `has_variable_bonus` field entirely from the schema

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAK: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
