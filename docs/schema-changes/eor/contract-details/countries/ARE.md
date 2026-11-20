# United Arab Emirates (ARE)

Schema versions for employee onboarding in United Arab Emirates.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** technical

**What changed:**

- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field: a display-only `salary_overview` statement is grouped with the salary fields in an `annual_gross_salary_fieldset` built by the component.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 4 },
    },
  }}
/>
```

---

### v3 (Since SDK 1.23.0, March 2026)

**Type of change:** technical

**What changed:**

- refactors `notice_period_days` and `work_address` into reusable components and removes the conditional that hides carryover fields when unlimited PTO is selected.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 3 },
    },
  }}
/>
```

---

### v2 (Since SDK 1.23.0, March 2026)

**Type of change:** compliance

**What changed:**

- enforces UAE's exact statutory requirements for carryover

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ARE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
