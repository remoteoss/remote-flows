# France (FRA)

Schema versions for employee onboarding in France.

## Current Version

**Contract Details:** v2

> **Scope.** This guide targets the Remote SAS legal entity form of France (`FRA_SAS` in tiger). The SDK resolves the pin by country code, so there is no separate `FRA_SAS` key: `jsonSchemaVersionByCountry.FRA` applies to both the SAS form and the standard France form. Pinning `FRA` to v2 is the only way to reach the SAS latest, and it also moves the standard France form to its v2. The standard France form has newer versions (latest is v5) that are not covered here.

## Contract Details

### v2 - Current

**What changed for the Remote SAS form:**

- Nothing. Tiger's SAS form has a single frozen snapshot (v1), and the current SAS schema is identical to it. Tiger publishes no `version_changelog` for it. Requesting v2 gives the same form as v1.

**What changed for the standard France form (same pin):**

- The 38.5-hour lump-sum option of `work_hours_per_week` now has the value `38.5` instead of `38`. This is breaking for submits: a saved or submitted `work_hours_per_week` of `"38"` no longer matches an option.
- The 38.5-hour option description says "3.5 hours" instead of "3.5H hours".
- The paid time off statement is reworded to "25 days of paid time off".
- The autonomous-roles notice links to the support team and opens the support chat instead of showing an email address.
- The probation extension texts point to the support team instead of `help@remote.com`.
- Tiger publishes no `version_changelog` for this version. These changes come from diffing the standard `FRA` v1 and v2 snapshots.

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
