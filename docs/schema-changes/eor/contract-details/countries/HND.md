# Honduras (HND)

Schema versions for employee onboarding in Honduras.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: "yes"`): `contract_duration_type` only accepts `"indefinite"`. This depends on a backend setting that is not enabled yet and is rolled out gradually; employments created before the cutoff date are unaffected, and Remote Admins can still override the block for approved exceptions. No action required for existing contracts
- `contract_duration_fixed_term_months` (1 to 12 months) still caps fixed-term contracts and is unchanged
- `contract_duration_type` gains help center content ("Learn about contract duration") in `x-jsf-presentation.meta.helpCenter`. Display only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HND: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when `annual_gross_salary` is at or above the USD 1,000,000 equivalent in HNL and stay hidden below it. Additive and depends on a backend setting, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HND: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path; validation and form generation follow its semantics. Pin v3 or earlier to keep the previous engine. No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HND: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, grouped with the salary field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary` no longer has the static description about the legal minimum salary. Additive and depends on a backend setting; no action required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HND: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- The `work_hours_per_week` description now says part-time employees must work between 18 and 32 hours per week, instead of saying the full-time workweek is capped at 44 hours. Copy only: no field, required or validation changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      HND: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
