# Indonesia (IDN)

Schema versions for employee onboarding in Indonesia.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`). `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- This depends on a backend setting that is not enabled yet, so no action is required for now

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IDN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- `retirement_age` is deprecated: it is no longer required, it is read-only and it accepts `null`. The previous field stated a retirement age below Indonesian statutory law and let employers set their own. Partners using a custom UI should stop rendering and sending it. Existing stored values are kept and may be returned, or returned as `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IDN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IDN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 - jsf v1

**Type of change:** technical, compliance

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary`, `salary_overview` and the salary-adjacent fields are now grouped in `annual_gross_salary_fieldset`. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IDN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
