# Bolivia (BOL)

Schema versions for employee onboarding in Bolivia.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** technical

**What changed:**

- `contract_duration_type` and `contract_end_date` move onto the shared contract duration component. `contract_end_date` is now nullable. Both `indefinite` and `fixed_term` stay valid, and `contract_end_date` is still required for `fixed_term` and rejected for `indefinite`
- The component can block fixed-term contracts when the seniority date is recognized, but seniority is not recognized in Bolivia, so behaviour does not change. No action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BOL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** product

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BOL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path. Pin v2 to keep the previous engine
- No field, required or validation changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BOL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. Additive and flag-gated
- `annual_gross_salary.description` is no longer a static string

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BOL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
