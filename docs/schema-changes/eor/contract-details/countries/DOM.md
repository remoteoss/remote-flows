# Dominican Republic (DOM)

Schema versions for employee onboarding in the Dominican Republic.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Contract duration moves to the Dominican Republic `dom_contract_duration` component with admin override. The standalone `contract_duration_type` field (indefinite, fixed-term variants) is removed from the schema. Fixed-term is blocked for employees with a recognized seniority date, except for Remote Admins. Flag-gated; no action is required for existing contracts (component and field removal inferred from the schema diff; the seniority block from the tiger commit message).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with `annual_bonus_ack` in a fieldset titled "Annual gross salary" (now driven by the field's presentation settings instead of `annual_gross_salary_fieldset`). Additive and flag-gated, so no action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Schema metadata only: marks the form as using the previous JSON Schema Form engine. No field changes (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DOM: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
