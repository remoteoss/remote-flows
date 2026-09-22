# Spain (ESP)

Schema versions for employee onboarding in Spain.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

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
