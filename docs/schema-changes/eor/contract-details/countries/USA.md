# United States (USA)

Schema versions for employee onboarding in United States.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**What changed:**

- Adds an extreme-salary acknowledgement: a warning plus a required checkbox when the annual salary is USD 1,000,000 or more.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- Adds `non_compete_severance_amount`, required for Virginia employees when `non_compete_clause_apply` is `"yes"`, under Virginia SB 170 (effective 2026-07-01).

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Outside Montana, fixed-term contracts are removed and `contract_duration_type` only accepts `"indefinite"`, because US employment is at-will.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds a high-salary reserve message to the annual gross salary field.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Employee schedule added
- Wage type field added

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- non compete fields migrated

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      USA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
