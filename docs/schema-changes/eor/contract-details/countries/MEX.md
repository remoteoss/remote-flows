# Mexico (MEX)

Schema versions for employee onboarding in México.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- `christmas_bonus` is now covered by the extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.
- The Christmas bonus description now calls it the 13th month salary, typically 15 to 30 days' salary. Copy only.

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 8 },
    },
  }
/>
```

---

### v7

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with `annual_bonus_ack` and `ergonomic_chair_ack` in a fieldset titled "Annual gross salary" (now driven by the field's presentation settings instead of `annual_gross_salary_fieldset`). Additive and flag-gated.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics.

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 7 },
    },
  }
/>
```

---

### v6

**What changed:**

- Admin-only fixed-term contracts: `contract_duration_type` is still indefinite-only for employers, but Remote Admins can set a fixed term with unlimited maximum duration.
- `contract_end_date` and its "deprecated, Mexico doesn't allow fixed-term" definition are removed from the schema (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 6 },
    },
  }
/>
```

---

### v5

**What changed:**

- The `non_compete`, `non_solicitation` and `non_interference` components added in v4 are removed again. Payloads must not send non-compete fields.

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 5 },
    },
  }
/>
```

---

### v4

**What changed:**

- Adds the shared `non_compete`, `non_solicitation` and `non_interference` components after the contract duration fields (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 4 },
    },
  }
/>
```

---

### v3

**What changed:**

- Adds the required `ergonomic_chair_ack` acknowledgement: the employer confirms they will reimburse up to 3,000 MXN for an ergonomic chair if the employee works remotely. Submits that omit it fail validation.
- The indefinite-only contract duration is now expressed with `indefinite_duration_only` instead of `contract_duration_options` and a forced-value statement (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 3 },
    },
  }
/>
```

---

### v2 (Since SDK 1.24.0, March 2026)

**What changed:**

- Mexico contracts now require employers to classify roles as managerial/specialized (which allows extended 90-180 day probation periods with risk acknowledgment) versus standard roles (30 days only). Completely redesign fields for `probation_period`

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      MEX: { contract_details: 2 },
    },
  }
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
