# Israel (ISR)

Schema versions for employee onboarding in Israel.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the seniority-block feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided. Employments created before the seniority-block cutoff date are grandfathered, and Remote Admins can still override the block. No action is required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ISR: { contract_details: 8 },
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
      ISR: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- New `study_fund_basis` field (`ceiling` or `full_salary`) for Keren Hishtalmut (study fund) contributions. It is required when `study_fund_eligibility` is `yes` and must not be sent when it is `no`. Pin v5 to keep the previous behaviour.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ISR: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field, grouped with the related salary fields in an `annual_gross_salary_fieldset` built by the component. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ISR: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Carryover now validates the maximum `carry_over_pto_days` with an Israel-specific rule (inferred from the schema diff). The field order is now shared with the other countries.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ISR: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- The `carryover` component is now used for annual leave carryover, with Israel-specific descriptions for the carry-forward, maximum days and expiry fields (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ISR: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- The `daily_schedule` component (`daily_schedule`, `schedule_type`, `work_hours_per_week`) replaces the plain `work_hours_per_week` field. Render and submit the daily schedule fields instead.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ISR: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
