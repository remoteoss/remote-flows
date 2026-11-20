# Netherlands (NLD)

Schema versions for employee onboarding in the Netherlands.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** compliance, product

**What changed:**

- `notice_period` is required and applies to both employer and employee. It accepts whole months from 1 to 6. Missing or `null` values are rejected
- Adds `notice_period_choice` (`"recommended"` or `"custom"`), required when a recommended notice period is available. With the one-month recommendation, send `"recommended"` with `notice_period: 1`, or `"custom"` with a whole-month `notice_period`. When the notice period is fixed by the contract length, the field is hidden and read-only
- Existing notice-period values are kept. Stored contract details can come back with `notice_period_choice` filled in, but v7 does not accept that property on submission, so drop it before writing if you stay on v7
- `sick_leave_pay_cap_70` and `sick_leave_pay_cap_100` change their radio presentation from `variant: "card-expandable"` to `expandable: true` with `separator: true`. Display only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- The `probation_length` field moves to a dedicated Netherlands probation period component. It renders and validates the same for existing consumers, so no action is required.
- Once the seniority block is enabled for the Netherlands, `probation_length` is forced to a hidden `0` for employments with a recognized seniority date.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Only `indefinite` is valid then. Gated by the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags, and employments created before the cutoff date are unaffected. Remote Admins can still override the block.
- `contract_duration_type` no longer pre-fills a default, so the user has to choose an option.
- The `contract_end_date` nested-field reference under the Fixed Term option moves from `nested_field` to `nested_fields` (a list), like every other country on the shared contract duration component. Custom renderers that read it directly need to expect a list.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds high-salary reserve messaging to the annual gross salary field.
- The annual gross salary, holiday allowance and part-time salary confirmation fields are now built by the shared `annual_gross_salary` component and grouped in `annual_gross_salary_fieldset`, together with `salary_overview`. Additive and flag-gated, no action required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds a prorated minimum for part-time employees: `annual_gross_salary` must be at least the minimum wage scaled by `work_hours_per_week` (against a 40-hour week), taking into account whether `holiday_allowance` is included in the salary. The error reads "In Netherlands, employees are entitled to a minimum annual salary of EUR ...".
- **Breaking for submits:** part-time salaries that were accepted on v2 can now fail validation if they are below the prorated minimum.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.29.0, May 2026)

**What changed:**

- Probation periods are now correctly limited based on contract type (fixed-term vs indefinite)
- Non-compete clauses are only enforced for indefinite contracts
- Notice period presentation adapts to contract type

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      NLD: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
