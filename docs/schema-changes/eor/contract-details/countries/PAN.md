# Panama (PAN)

Schema versions for employee onboarding in Panama.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the seniority-block feature flags are enabled for Panama. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided. Employments created before the seniority-block cutoff date are grandfathered, and Remote Admins can still override the block. No action is required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAN: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** risk

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAN: { contract_details: 6 },
    },
  }}
/>
```

---

### v5 - jsf v1

**Type of change:** technical, product

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. Additive and flag-gated. The `annual_gross_salary` static description is removed in favor of the computed one
- Validation behavior is unchanged between the two engines for this schema

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- `available_pto` is now fixed at 30 calendar days (`const` and `default` are 30) and no longer has a minimum. Its description cites Panamanian Labour Code Article 54 and says the value cannot be changed, and it carries help center content. Render it as read-only and send 30

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- `available_pto` now has a minimum of 30 calendar days and no maximum, replacing the tenure-based range (15 to 30 days). Its description says the minimum entitlement is 30 calendar days of paid annual leave per year

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Marks the schema as the previous form engine version (`x-rmt-meta.jsfOldVersion` is `true`). No field-level changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      PAN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
