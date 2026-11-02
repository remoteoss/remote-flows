# Japan (JPN)

Schema versions for employee onboarding in Japan.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_warning` message and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and depends on a backend setting that is not enabled yet, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      JPN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path; validation and form generation follow its semantics. Pin v3 or earlier to keep the previous engine

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      JPN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `salary_overview` and the existing salary-related fields are grouped with `annual_gross_salary` in an `annual_gross_salary_fieldset` built by the component. Additive and depends on a backend setting that is not enabled yet, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      JPN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

No changelog was published for this version; the changes below come from comparing the schemas.

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- `notice_period_days` is now fixed at 30 (`const: 30`, `default: 30`) instead of accepting any value of at least 30. Partners with a custom UI must send exactly `30`; any other value is rejected
- `contract_duration_type` gains a description about fixed-term agreements in Japan
- `available_pto` and `has_probation_period` gain help center content (`x-jsf-presentation.meta.helpCenter`)
- `contract_duration_type` and `work_schedule` radios are now laid out in a row (`x-jsf-presentation.direction: "row"`)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      JPN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
