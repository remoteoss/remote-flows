# Malaysia (MYS)

Schema versions for employee onboarding in Malaysia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** product

**What changed:**

- Adds four required `"yes"`/`"no"` questions: `third_party_work`, `non_solicitation_employees`, `non_solicitation_customers` and `non_interference_apply`
- Answering `"yes"` to `third_party_work` requires `third_party_work_activities`, a non-empty string of up to 10,000 characters
- Answering `"yes"` to a clause requires its duration, a whole number of months from 1 to 12: `non_solicitation_employees_number_of_months`, `non_solicitation_customer_number_of_months` or `non_interference_halt_period`
- Non-compete is not offered in Malaysia
- `available_pto` gets a reworded description: the legal minimum paid time off increases with the employee's tenure and differs for full-time and part-time employees. Copy only
- Custom UIs must render the new questions and send them on every submission

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MYS: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

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
