# Germany (DEU)

Schema versions for employee onboarding in Germany.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `DEU`) to inspect field-level diffs between your current pin and v7. Intermediate versions (v4–v6) also exist; prefer jumping straight to v7 when upgrading.
- Added a reserve messaging notice on the annual gross salary field for high salaries, grouped with the part-time salary confirmation. Additive change — no action required.
- Corrected the minimum comparable-role salary calculation for German AUG employments that use fractional weekly working hours. If you submit AUG contract details with comparable-role data, ensure annual_gross_salary meets the corrected minimum.
- Added an acknowledgement step for extreme high salaries: a warning message and a required confirmation checkbox now appear when the salary exceeds the extreme-high threshold. Additive change — no action required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DEU: { contract_details: 7 },
    },
  }}
/>
```

---

### v4

**What changed:**

- New Germany schema using the new hiring compliant model

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DEU: { contract_details: 4 },
    },
  }}
/>
```

---

### v1 (deprecated)

Initial version with basic contract details fields but it was deprecated as it was using the OLD compliance model
