# Portugal (PRT)

Schema versions for employee onboarding in Portugal.

## Current Version

**Contract Details:** v2 (Since SDK 1.23.0)

## Contract Details

### v3 - Current (Since SDK 1.23.0, March 2026)

**What changed:**

- New offboarding acknowledgment - requires employers to acknowledge complex statutory requirements about vacation pay, vacation allowance, and Christmas allowance upon termination
- Enhanced descriptions - provides more detailed and accurate information about allowances, training requirements, and offboarding entitlements
- Help center links updated - new documentation references added

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 2 },
    },
  }}
/>
```

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Work address standardization - moved from inline definition to reusable component
- Probation period UX improvement - introduced a yes/no question (has_probation_period) before asking for duration, and tightened the validation rules to match legal requirements more precisely (90-180 days instead of 15-240 days)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
