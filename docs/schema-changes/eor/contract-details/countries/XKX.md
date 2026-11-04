# Kosovo (XKX)

Schema versions for employee onboarding in Kosovo.

## Current Version

**Contract Details:** v3

## Contract Details

### v3 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in EUR and stay hidden below it. Submit `extreme_salary_acknowledgement` with the value `"acknowledged"` when it is shown. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      XKX: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v2 or later get the newer engine path
- `contract_duration_type` now only offers `"fixed_term"` and defaults to it; `"indefinite"` is removed and is rejected on submit. Its description now says Remote currently supports only fixed-term contracts in Kosovo. Partners using a custom UI must stop offering or sending `"indefinite"`
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is grouped with `annual_gross_salary` and `part_time_salary_confirmation`. Render it but never submit it
- `annual_gross_salary` no longer has a static description. Its minimum salary rules are unchanged: €6,000.00 for full-time, and a minimum computed from `work_hours_per_week` for part-time

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      XKX: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
