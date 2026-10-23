# Mauritius (MUS)

Schema versions for employee onboarding in Mauritius.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance, technical

**What changed:**

- Contract details rules now run on the server, so some values are fixed and the form must send them as computed
- `work_hours_per_week` is now read-only and must equal the number of `work_days` times `work_week_schedule.working_hours`
- `available_pto` is now read-only and locked to the legal minimum: 22 days for full-time, otherwise 22 / 5 times the number of work days, rounded
- `contract_end_date` must be on or after the provisional start date
- On fixed-term contracts, `notice_period` (between 1 and 6) and `probation_length` (between 1 and 12) can't exceed the contract length in months, counted from the provisional start date
- The "waiving the probation period is discouraged" warning now shows on `probation_length` when it is `0`, instead of on `has_probation_period`

Custom UIs must render `work_hours_per_week` and `available_pto` as read-only and send the computed values, and keep the notice period and probation length within the contract length.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MUS: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked and the option is removed when the employee's seniority date is recognized (`has_seniority_date: yes`), once the seniority block feature flags are enabled for Mauritius. Employments created before the seniority block cutoff date are grandfathered, and Remote Admins can still override the block for approved exceptions
- `contract_end_date` is now typed as a single `string` instead of a one-item type list

Flag-gated, so no action is required until the flags are enabled.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MUS: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual salary is at or above the USD 1,000,000 equivalent and stay hidden below it
- The `minimum` attribute on `annual_gross_salary` changed. Read it from the schema instead of hardcoding it

Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MUS: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v3 or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- Removes the `bonus_amount` field
- `annual_gross_salary.description` is no longer a static string

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      MUS: { contract_details: 3 },
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
      MUS: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
