# New Zealand (NZL)

Schema versions for employee onboarding in New Zealand.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the seniority-block feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` and `contract_duration_fixed_term_reason` are rejected if provided. Employments created before the seniority-block cutoff date are grandfathered, and Remote Admins can still override the block. No action is required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NZL: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NZL: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field, grouped with the related salary fields in an `annual_gross_salary_fieldset` built by the component. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NZL: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- `annual_leave_carry_forward` becomes optional and nullable (previously required and non-nullable) and, together with `carryover_details`, is hidden from new contracts, since paid-time-off carryover is governed by statutory policy in New Zealand. Stored values remain valid and render read-only. On read responses `annual_leave_carry_forward` may now be `null` or absent.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NZL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- The `daily_schedule` component (`daily_schedule`, `schedule_type`, `work_hours_per_week`) replaces the plain `work_hours_per_week` field. Render and submit the daily schedule fields instead.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NZL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `available_pto` now has a minimum of 20 days, and its description is reworded to be based on ordinary hours of work.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NZL: { contract_details: 3 },
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
      NZL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
