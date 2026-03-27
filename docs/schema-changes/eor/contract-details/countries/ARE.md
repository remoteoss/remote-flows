# United Arab Emirates (ARE)

Schema versions for employee onboarding in United Arab Emirates.

## Current Version

**Contract Details:** v2 (Since SDK 1.23.0)

## Contract Details

### v3 - Current (Since SDK 1.23.0, March 2026)

**What changed:**

- refactors `notice_period_days` and `work_address` into reusable components and removes the conditional that hides carryover fields when unlimited PTO is selected.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 3 },
    },
  }}
/>
```

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- enforces UAE's exact statutory requirements for carryover

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
