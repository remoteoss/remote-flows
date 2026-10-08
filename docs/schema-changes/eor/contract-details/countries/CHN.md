# China (CHN)

Schema versions for employee onboarding in China.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Use the [JSON schema comparison](https://remote-flows-eight.vercel.app/?demo=json-schema-comparison) tool (country `CHN`) to inspect field-level diffs between your current pin and v8. Prefer jumping straight from v3 to v8 when upgrading.
- Adds an extreme-salary acknowledgement: a warning plus a required checkbox when the annual salary is at or above the USD 1,000,000 equivalent. Additive change — no action required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHN: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- `contract_duration_type` and `contract_end_date` are now provided by the `contract_duration` component instead of being top-level fields.
- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: "yes"`): `contract_duration_type` only accepts `"indefinite"` and `contract_end_date` is rejected. This is being rolled out gradually; employments created before the cutoff date are unaffected, and Remote Admins can still override the block for approved exceptions.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHN: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Adds reserve messaging to the annual gross salary field for high salaries: the field description becomes a computed value, grouped with a salary overview statement. Additive change — no action required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHN: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- No field changes. Updates a help center link only.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- **Breaking:** the post-termination restriction fields are replaced by the `non_compete`, `non_solicitation` and `non_interference` components. These top-level fields are removed: `post_termination_restrictions`, `non_compete_clause_apply`, `non_compete_clause_compensation_percentage`, `non_compete_clause_halt_period_months`, `non_solicitation_employees`, `non_solicitation_employees_number_of_months`, `non_solicitation_customers`, `non_solicitation_customer_number_of_months`, `non_interference_apply` and `non_interference_halt_period`. The non-interference halt period is capped at 24 months.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 (Since SDK 1.23.0, March 2026)

- China employment contracts now only support 4 provinces (Beijing, Guangdong, Shanghai, Zhejiang) instead of 8, to align with Remote's officially registered locations where Social Insurance and Housing Fund benefits are available.

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
      CHN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
