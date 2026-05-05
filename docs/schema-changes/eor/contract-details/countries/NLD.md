# Netherlands (NLD)

Schema versions for employee onboarding in Nigeria.

## Current Version

**Contract Details:** v2 (Since SDK 1.29.0)

## Contract Details

### v2 - Current (Since SDK 1.29.0, May 2026)

**What changed:**

- Probation periods are now correctly limited based on contract type (fixed-term vs indefinite)
- Non-compete clauses are only enforced for indefinite contracts
- Notice period presentation adapts to contract type

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
