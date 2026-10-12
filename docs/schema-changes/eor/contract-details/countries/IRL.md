# Ireland (IRL)

Schema versions for employee onboarding in Ireland.

## Current Version

**Contract Details:** v4

## Contract Details

### v4 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `IRL`) to inspect field-level diffs between your current pin and v4. Prefer jumping straight from v1 to v4 when upgrading.
- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Flag-gated, and employments created before the cutoff date are unaffected — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Adds high-salary reserve messaging: a display-only `salary_overview` statement is added to the `annual_gross_salary_fieldset` and is never submitted. The fieldset title and the fields it groups are unchanged.
- The schema moves to the jsf v1 engine, which activates two validations that did nothing before: a part-time annual gross salary below the hourly-derived minimum is now rejected, and a missing annual gross salary is now rejected. Both are corrections, but payloads that relied on the old behavior can start failing validation.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      IRL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version.
