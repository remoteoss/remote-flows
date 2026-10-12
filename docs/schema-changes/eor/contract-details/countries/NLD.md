# Netherlands (NLD)

Schema versions for employee onboarding in the Netherlands.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `NLD`) to inspect field-level diffs between your current pin and v6. Prefer jumping straight from v2 to v6 when upgrading.
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
