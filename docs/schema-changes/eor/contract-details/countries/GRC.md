# Greece (GRC)

Schema versions for employee onboarding in Greece.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Once the seniority block is enabled for Greece, an employee whose seniority date is recognized (`has_seniority_date` is `yes`) can no longer be given a fixed-term contract: `contract_duration_type` only accepts `indefinite` and `contract_end_date` is rejected if provided. Employments created before the seniority block cutoff date are unaffected, and Remote Admins can still override the block
- `contract_duration_type` gets updated help center copy
- No action required for existing contracts. Custom UIs should not offer `fixed_term` when the seniority date is recognized

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GRC: { contract_details: 6 },
    },
  }
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GRC: { contract_details: 5 },
    },
  }
/>
```

---

### v4

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` is no longer a static string. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GRC: { contract_details: 4 },
    },
  }
/>
```

---

### v3 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- `work_days` is removed. Work hours now come from the shared `daily_schedule` component: a required `schedule_type` (`flexible`, `core_business_hours` or `fixed_hours`), plus a `daily_schedule` fieldset that is required for `core_business_hours` and `fixed_hours`
- `work_hours_per_week` is now required and bounded by `work_schedule`: fixed at 40 for `full_time` and 1 to 39 for `part_time`
- Custom UIs that rendered `work_days` must render `schedule_type` and `daily_schedule` instead

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GRC: { contract_details: 3 },
    },
  }
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- No field changes. The schema is marked as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`)

**Migration:**

```tsx
<OnboardingFlow
  options={
    jsonSchemaVersionByCountry: {
      GRC: { contract_details: 2 },
    },
  }
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
