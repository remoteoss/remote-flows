# Ecuador (ECU)

Schema versions for employee onboarding in Ecuador.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: "yes"`): `contract_duration_type` only accepts `"indefinite"` and `contract_end_date` is rejected if provided. This depends on a backend setting that is not enabled yet and is rolled out gradually; employments created before the cutoff date are unaffected, and Remote Admins can still override the block for approved exceptions. No action required for existing contracts
- `contract_end_date` declares its type as `"string"` instead of `["string"]`. No action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ECU: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** product

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when `annual_gross_salary` is at or above USD 1,000,000 and stay hidden below it. Additive and depends on a backend setting, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ECU: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v5 or later get the newer engine path; validation and form generation follow its semantics. Pin v4 or earlier to keep the previous engine. No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ECU: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- `available_pto` now has a minimum of 15 days for part-time employments too (it was 0 before; full-time already required 15). Part-time submissions with fewer than 15 days are rejected
- The `available_pto` description no longer suggests 25 days or asks to pro-rate for part-time employment. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ECU: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** technical

**What changed:**

- The salary fields are regrouped: `salary_overview` and `annual_bonus_ack` stay grouped with `annual_gross_salary`. No field, validation or required changes; no action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ECU: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, grouped with the salary field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary` no longer has the static description about the legal minimum salary. Additive and depends on a backend setting; no action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ECU: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
