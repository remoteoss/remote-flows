# Czech Republic (CZE)

Schema versions for employee onboarding in Czech Republic.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**What changed:**

- Added the `contract_duration` component, with a maximum duration of `unlimited`. `contract_duration_type` is no longer required and the old has-contract-end-date conditional is removed. A part-time salary confirmation conditional is added (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- The annual gross salary component adds the extreme salary acknowledgement (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- The annual gross salary component gains a fieldset with a `part_time_salary_confirmation` field, and a reserve message with a titled layout (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The `daily_schedule` component replaces `work_hours_per_week`. It defaults to 09:00 to 18:00 with a 60 minute break, supports flexible, core business hours and fixed hours schedule types, forces 40 hours per week for full time, allows 1 to 39 hours for part time, and subtracts breaks from work hours (inferred from the schema diff).
- The part-time maximum of 39 hours conditional is removed, and `work_hours_per_week` is no longer required (inferred from the schema diff).
- `notice_period` now has a description (at least 2 months, which can drop to 1 month for underperformance or misconduct), and its minimum depends on whether an admin is creating the contract: 1 month when admin-created, 2 months otherwise (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Added the `non_compete` component, a non-compete clause field (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: 3 },
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
      CZE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
