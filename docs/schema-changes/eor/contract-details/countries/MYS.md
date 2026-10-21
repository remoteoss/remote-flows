# Malaysia (MYS)

Schema versions for employee onboarding in Malaysia.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- The contract duration fields move to the shared `contract_duration` component with unlimited maximum duration. The standalone `contract_duration_type` and `contract_end_date` field definitions and the contract duration help center metadata are removed from the schema.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MYS: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MYS: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with the currency selection in a titled fieldset. Additive and flag-gated, so no action is required.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MYS: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `notice_period` component
  - Handles country-specific notice period rules automatically
  - Unit, minimum, and maximum values are country-specific
- Added `notice_period_choice` field for policy-based configurations
- Old `notice_period_[unit]` field removed from required fields
- Component manages validation based on employment type and local regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MYS: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
