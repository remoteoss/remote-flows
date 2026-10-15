# Portugal (PRT)

Schema versions for employee onboarding in Portugal.

## Current Version

**Contract Details:** v9

## Contract Details

### v9 - Current

**What changed:**

- New required `tax_and_social_security_numbers_ack` field: send `"acknowledged"` to confirm the employee must provide their tax number (NIF) and social security number (NISS) before starting. It also applies when updating contract details of employments created before this version. Consumers staying on v8 or earlier are unaffected.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 9 },
    },
  }}
/>
```

---

### v8

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field, grouped with the related salary fields in an `annual_gross_salary_fieldset` built by the component. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- The minimum `available_pto` for part-time employments is now 22 days.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds the shared `non_compete`, `non_solicitation` and `non_interference` components after the contract duration fields (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 (Since SDK 1.23.0, March 2026)

**What changed:**

- New offboarding acknowledgment - requires employers to acknowledge complex statutory requirements about vacation pay, vacation allowance, and Christmas allowance upon termination
- Enhanced descriptions - provides more detailed and accurate information about allowances, training requirements, and offboarding entitlements
- Help center links updated - new documentation references added

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 3 },
    },
  }}
/>
```

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Work address standardization - moved from inline definition to reusable component
- Probation period UX improvement - introduced a yes/no question (has_probation_period) before asking for duration, and tightened the validation rules to match legal requirements more precisely (90-180 days instead of 15-240 days)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRT: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
