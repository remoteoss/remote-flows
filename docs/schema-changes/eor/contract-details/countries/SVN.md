# Slovenia (SVN)

Schema versions for employee onboarding in Slovenia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVN: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical, compliance

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics.
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is dropped from the schema in favour of it. Additive and flag-gated.
- Only indefinite-term contracts are supported: `contract_duration_type` now defaults to `indefinite` and `contract_end_date` is removed. Stop rendering and submitting `contract_end_date` when you pin this version.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`).
- `post_termination_restrictions` is removed. Adds `non_compete_clause_compensation_amount` and `non_compete_clause_compensation_percentage`, conditionally required when a non-compete applies.
- The `yes`/`no` clause questions (`non_compete_clause_apply`, `non_interference_apply`, `non_solicitation_customers`, `non_solicitation_employees`) no longer accept an `N/A` answer, and the duration fields are now plain numbers instead of nullable ones.
- Reworded the clause titles and descriptions, and added help center content to `contract_duration_type`.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds `notice_period_choice`, which is required. `notice_period_days` defaults to and is fixed at 30 days, and is only required when the choice calls for it.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- `has_variable_bonus` is replaced by the required `has_bonus` field. Stop rendering and submitting `has_variable_bonus`.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
