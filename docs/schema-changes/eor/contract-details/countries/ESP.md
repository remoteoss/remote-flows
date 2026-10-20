# Spain (ESP)

Schema versions for employee onboarding in Spain.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Probation can no longer be set when the employee has a recognized seniority date (`has_seniority_date: "yes"`), so the probation length field is not available for those employments. Flag-gated, and employments created before the cutoff date are unaffected — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ESP: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** risk

**What changed:**

- Added an acknowledgement step for extreme high salaries: if annual salary is at/above ~USD 1M equivalent, a warning message and a required confirmation checkbox now appear. Additive / flag-gated change — no action required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ESP: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** compliance

**What changed:**

- Collective bargaining classification (`cba_categories`: area, group, level) is now visible to clients and required. Previously it was only visible to Remote admins. Omitting it fails validation; pin to `contract_details: 5` or below to keep the old behaviour.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ESP: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** risk, product, technical

**What changed:**

- Removed `contract_duration_type` — Spain now only supports indefinite contracts (Royal Decree-Law 32/2021). Duration is shown as static copy instead of a selectable field.
- PTO copy update
- High-salary reserve messaging (additive; no action)
- JSON Schema Form v1 engine (internal change)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ESP: { contract_details: 5 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields, including a selectable `contract_duration_type` (indefinite vs fixed-term).
