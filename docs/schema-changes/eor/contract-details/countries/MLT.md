# Malta (MLT)

Schema versions for employee onboarding in Malta.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Once the seniority block is enabled for Malta, `contract_duration_type` only accepts `indefinite` when the employee's seniority date is recognized (`has_seniority_date: yes`). `fixed_term` is removed from the options and `contract_end_date` is rejected if sent. Remote Admins can still override the block for approved exceptions
- Employments created before the seniority block cutoff date are grandfathered and unaffected
- `contract_end_date.type` is now the string `"string"` instead of a one-item list
- No action required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MLT: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MLT: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path. Pin v2 or earlier to stay on the previous engine
- No field changes. Validation and form generation follow the newer engine's semantics

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MLT: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` no longer carries the static minimum-salary sentence. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MLT: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
