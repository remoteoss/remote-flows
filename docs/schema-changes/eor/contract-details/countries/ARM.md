# Armenia (ARM)

Schema versions for employee onboarding in Armenia.

## Current Version

**Contract Details:** v4

## Contract Details

### v4 - Current

**Type of change:** compliance

**What changed:**

- The probation period is blocked for employments with a recognized seniority date, the same way it already is for fixed-term contracts. For such an employment, `probation_length` must be `0`; any other submitted value is rejected.
- `probation_length` gets a help-center link about probation periods (presentation only).

**Migration:**

No action is required for most submissions. For employments with a recognized seniority date, send `probation_length: 0`.

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARM: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARM: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 - jsf v1

**Type of change:** compliance, technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested (AMD 63,359,884.14). Render it but never submit it. `annual_gross_salary.description` is dropped

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARM: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields, on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`).
