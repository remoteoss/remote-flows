# Thailand (THA)

Schema versions for employee onboarding in Thailand.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** risk

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      THA: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      THA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** risk

**What changed:**

- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The `annual_gross_salary` description ("In Thai Bhat.") is dropped

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      THA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- `has_variable_bonus` is replaced by `has_bonus` ("Offer other bonuses?"), which is required. Partners using a custom UI must render the new field
- `contract_end_date` now also accepts `null` and notes that fixed-term contracts in Thailand cannot exceed 2 years

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      THA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
