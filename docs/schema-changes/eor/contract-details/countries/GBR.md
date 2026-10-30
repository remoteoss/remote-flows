# United Kingdom (GBR)

Schema versions for employee onboarding in United Kingdom.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** product

**What changed:**

- Hourly wage type and the daily schedule are no longer hidden from Partners API (`remote_api`) consumers. `wage_type` and `hourly_gross_salary` are now returned, and the `daily_schedule` component (`daily_schedule`, `schedule_type`, `work_hours_per_week`, `shift_pattern`) replaces the plain `work_hours_per_week` field.
- `annual_gross_salary` is only required when `wage_type` is `salary`. Part-time contracts must still use `wage_type` `salary`.

**Migration:**

Render and submit `wage_type` (`salary` or `hourly`), `hourly_gross_salary` when `wage_type` is `hourly`, and the daily schedule fields instead of the plain `work_hours_per_week` field. Consumers staying on v6 or earlier are unaffected.

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      GBR: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

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

**Type of change:** compliance, technical

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

**Type of change:** compliance

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

**Type of change:** compliance, product

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

### v2 (deprecated)

**Type of change:** product

**Deprecated on 1 July 2026.** Requests pinned to this version are served the latest schema.

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

### v1 (deprecated)

**Deprecated on 1 July 2026.** Requests pinned to this version are served the latest schema.

Initial version with basic contract details fields.
