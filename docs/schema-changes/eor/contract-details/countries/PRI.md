# Puerto Rico (PRI)

Schema versions for employee onboarding in Puerto Rico.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are capped at 36 months: `contract_end_date` can be at most 36 months from today (the date picker gets a `maxDate`). Its description now says fixed-term agreements cannot exceed 3 years, including renewals, correcting the previous 5-year wording
- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the seniority-block feature flags are enabled for Puerto Rico. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided. Employments created before the seniority-block cutoff date are grandfathered, and Remote Admins can still override the block. No action is required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRI: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** risk

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRI: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path. Validation and form generation follow the newer engine semantics
- No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRI: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- A new `annual_gross_salary_fieldset` groups the salary field, and the reserve statement is shown as the fieldset description. Additive and flag-gated
- `annual_gross_salary.description` static text is removed in favor of the fieldset statement

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRI: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`). No field-level changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PRI: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
