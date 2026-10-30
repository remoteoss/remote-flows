# Sweden (SWE)

Schema versions for employee onboarding in Sweden.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**What changed:**

- Adds an extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SWE: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds high-salary reserve messaging: the annual gross salary description gains a reserve sentence when the salary is above the high-salary threshold for the selected currency. A display-only `salary_overview` statement is added and never submitted.
- The salary, `compensation_currency_code` and `part_time_salary_confirmation` are grouped together with the salary field. Field names and values are unchanged.
- The schema moves to the jsf v1 engine.
- Additive and flag-gated, no action required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SWE: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- The post-termination restriction fields come from the shared components: `non_compete_clause_apply` (with its halt period and compensation fields when the answer is `"yes"`), `non_solicitation` and `non_interference`.
- **Breaking for submits:** `non_compete_clause_apply` is now required, so payloads built for v2 fail validation until it is sent.
- The probation period field gains a help center link.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SWE: { contract_details: 3 },
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
      SWE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
