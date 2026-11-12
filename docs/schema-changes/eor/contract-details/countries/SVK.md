# Slovakia (SVK)

Schema versions for employee onboarding in Slovakia.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Once the seniority block is enabled for Slovakia, new submissions for employments with a recognized seniority date (`has_seniority_date: yes`) no longer accept `fixed_term` for `contract_duration_type` (only `indefinite` is valid) and `contract_end_date` is rejected if provided. Remote Admins can still override the block for approved exceptions
- Employments created before the seniority block cutoff date are grandfathered
- `contract_end_date` is now nullable. No action required for existing contracts or until the block is enabled

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVK: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVK: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path. Pin v3 to keep the previous engine
- No field, required or validation changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVK: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** technical

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. Additive and flag-gated
- `annual_gross_salary.description` is no longer a static string

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVK: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

- Adds the optional hidden `job_code` field (`SK ISCO work position`). It is not required; send it only if you have a value. No other field or required changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SVK: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
