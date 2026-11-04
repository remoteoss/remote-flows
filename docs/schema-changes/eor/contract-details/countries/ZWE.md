# Zimbabwe (ZWE)

Schema versions for employee onboarding in Zimbabwe.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above USD 1,000,000 and stay hidden below it. Submit `extreme_salary_acknowledgement` with the value `"acknowledged"` when it is shown. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZWE: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- `contract_duration_type` gains help center content explaining the two contract types
- When the employee's seniority date is recognized (`has_seniority_date` is `"yes"`), fixed-term contracts will be blocked: only `"indefinite"` is accepted for `contract_duration_type` and `contract_end_date` is rejected if sent. This depends on a backend setting that is not enabled yet, and employments created before the cutoff date are unaffected. No action required until then

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZWE: { contract_details: 5 },
    },
  }}
/>
```

---

### v4 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v4 or later get the newer engine path. No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZWE: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Deprecates `annual_leave_carry_forward` and `carry_over_pto_days`, because carryover of paid time off is governed by statutory policy. Both are now read-only, titled "(Deprecated)" and hidden from new contracts
- `annual_leave_carry_forward` is no longer required and accepts `null` (N/A); `carry_over_pto_days` also accepts `null`. Partners using a custom UI should stop rendering and submitting both fields. On read, `annual_leave_carry_forward` may be `null` or absent

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZWE: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is grouped with `annual_gross_salary` in the new `annual_gross_salary_fieldset`. Render it but never submit it
- `annual_gross_salary` no longer has a static description

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ZWE: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
