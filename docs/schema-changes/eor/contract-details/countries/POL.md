# Poland (POL)

Schema versions for employee onboarding in Poland.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `POL`) to inspect field-level diffs between your current pin and v5. Prefer jumping straight from v1 to v5 when upgrading.
- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`), unless the request is made by a Remote Admin. Flag-gated (`eor_seniority_block`, `eor_seniority_block_v2_ftc`), and employments created before the cutoff date are unaffected. No action required for existing contracts.
- The contract duration fields move to the shared `contract_duration` component with unlimited maximum duration, and the standalone `contract_duration_type` and `contract_end_date` field definitions and their help center metadata are removed from the schema (inferred from the schema diff).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      POL: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      POL: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `annual_gross_salary` adds high-salary reserve messaging, grouped with the salary field and `part_time_salary_confirmation` in `annual_gross_salary_fieldset`. Additive and flag-gated, so no action is required.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. The part-time minimum salary rule is unchanged in intent, but it is restructured for v1 (inferred from the schema diff; tiger does not call out a behavior change).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      POL: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Tiger has no changelog entry for v2; this is inferred from the v1 to v2 schema snapshot diff.
- The inline non-compete fields are replaced by the shared `non_compete` component, and `non_solicitation` and `non_interference` components are added. Field order is now defined by the shared order template. Submits that relied on the old inline non-compete fields may need to be checked against the new components.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      POL: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
