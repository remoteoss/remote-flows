# France (FRA)

Schema versions for employee onboarding in France.

## Current Version

**Contract Details:** v2

## Contract Details

### v2 - Current

**What changed:**

- No field, property or validation-rule changes. The v2 schema served by the gateway is identical to v1 (`has_wage_portage_years_of_experience` and `has_wage_portage_higher_degree` remain required), so pinning v2 needs no changes in a custom UI
- The pinned `FRA` version in remote-flows is the one the backend tracks as `FRA_SAS`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      FRA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
