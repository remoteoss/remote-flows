# Spain (ESP)

Schema versions for employee onboarding in Spain.

## Current Version

**Contract Details:** v9

## Contract Details

### v9 - Current

**Type of change:** compliance

**What changed:**

- The required `has_social_security_number` yes/no question is replaced by `social_security_number_ack`, a required checkbox (`const: "acknowledged"`) confirming that the employee must have a Spanish Social Security number before their employment can begin.
- `has_social_security_number` is now deprecated and read-only, is no longer required, and accepts `"yes"`, `"no"` or `null`.
- Custom UIs must render the `social_security_number_ack` checkbox and send `"acknowledged"` when the schema requires it, and stop asking for `has_social_security_number`. Stored answers stay readable and are preserved when the field is omitted on save. Do not convert old answers into acknowledgments.
- Existing employments that already have a saved `has_social_security_number` answer and no saved acknowledgment may omit `social_security_number_ack` or send `null`; once an acknowledgment is saved it stays required.
- Pin to `contract_details: 8` to keep the previous shape.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ESP: { contract_details: 9 },
    },
  }}
/>
```

---

### v8

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

**Type of change:** compliance

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

**Type of change:** compliance, product, technical

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
