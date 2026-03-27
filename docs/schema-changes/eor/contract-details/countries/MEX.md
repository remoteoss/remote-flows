# Mexico (MEX)

Schema versions for employee onboarding in México.

## Current Version

**Contract Details:** v2 (Since SDK 1.24.0)

## Contract Details

### v2 - Current (Since SDK 1.24.0, March 2026)

**What changed:**

- Mexico contracts now require employers to classify roles as managerial/specialized (which allows extended 90-180 day probation periods with risk acknowledgment) versus standard roles (30 days only). Completely redesign fields for `probation_period`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MUS: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
