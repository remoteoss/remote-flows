# Spain (ESP)

Schema versions for employee onboarding in Spain.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- Removed `contract_duration_type` — Spain now only supports indefinite contracts (Royal Decree-Law 32/2021). Duration is shown as static copy instead of a selectable field.
- PTO copy update
- High-salary reserve messaging (additive; no action)
- JSON Schema Form v1 engine (internal change)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ESP: { contract_details: 5 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields, including a selectable `contract_duration_type` (indefinite vs fixed-term).
