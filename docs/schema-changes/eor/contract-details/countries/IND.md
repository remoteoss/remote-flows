# India (IND)

Schema versions for employee onboarding in India.

## Current Version

**Contract Details:** v2 (Since SDK 1.23.0)

## Contract Details

### v2 - Current (Since SDK 1.23.0, March 2026)

**What changed:**

- Added two new required fields: `work_location` and `professional_tax_location_state_name`
- These fields capture the employee's work location and state for professional tax purposes to comply with India's state-level tax regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IND: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
