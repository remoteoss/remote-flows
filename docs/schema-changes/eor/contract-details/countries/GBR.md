# United Kingdom (GBR)

Schema versions for employee onboarding in United Kingdom.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `GBR`) to inspect field-level diffs between your current pin and v6. Prefer jumping straight from v3 to v6 when upgrading.
- Adds an extreme-salary acknowledgement: `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent, resolved per contract currency. Shown only for salaried wage types. Additive and flag-gated — no action required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- `annual_gross_salary` moves to the shared annual gross salary component and adds high-salary reserve messaging: a `salary_overview` statement grouped with the salary field, plus a computed description on `annual_gross_salary`. Not rendered when `wage_type` is hourly. Additive and flag-gated — no action required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- `available_pto_type` is now required and only accepts `"unlimited"` or `"fixed"`. The `N/A` (`null`) option is removed, so submissions that omit the field or send `null` now fail validation.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Removed `shift_pattern` field
- Added `risks_acknowledgment` required field — acknowledgement of UK employment law risks
- Added `work_schedule` as a required field

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Added `overtime_eligible` field

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
