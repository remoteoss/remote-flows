# Brazil (BRA)

Schema versions for employee onboarding in Brazil.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Adds the required `health_check_ack` checkbox. A health check must be completed and uploaded to the employee's profile at least 3 business days before the start date, and requests without `health_check_ack: "acknowledged"` fail validation. Partners using a custom UI must render it

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BRA: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BRA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The `annual_gross_salary` minimum is dropped, and the related salary fields (`annual_bonus_ack`, `part_time_salary_confirmation`) are grouped with the salary field in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BRA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Baseline for this changelog, on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`). No field changes compared with v1

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BRA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
