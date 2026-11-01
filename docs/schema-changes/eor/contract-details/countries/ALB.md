# Albania (ALB)

Schema versions for employee onboarding in Albania.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- The probation period is blocked for employments with a recognized seniority date, the same way the fixed-term contract seniority block works. For those employments `has_probation_period` must be `"no"` and `probation_length` must be `0`, and any other value is rejected unless a Remote Admin makes the request. Other submissions need no change.
- `probation_length` no longer has custom `x-jsf-errorMessage` texts for `minimum` and `maximum`. The bounds (1 to 3 months) are unchanged, so your form will show the engine's default messages instead.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ALB: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ALB: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 - jsf v1

**Type of change:** technical, compliance

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics.
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is dropped from the schema in favour of it. Additive and flag-gated.
- `bonus_amount` is removed from the schema. Stop rendering and submitting it when you pin this version.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ALB: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds `non_compete_clause_compensation_amount` and `non_compete_clause_compensation_percentage`, conditionally required when a post-termination restriction (non-compete) applies.
- Reworded the non-compete, non-interference and non-solicitation titles and descriptions, and the `probation_length` description.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ALB: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
