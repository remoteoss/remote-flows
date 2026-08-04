# Sweden (SWE)

Schema versions for employee onboarding in Sweden.

## Current Version

**Contract Details:** v3

## Contract Details

### v3 - Current

**What changed:**

- Employee schedule added
- Wage type field added

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- non compete fields migrated

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
