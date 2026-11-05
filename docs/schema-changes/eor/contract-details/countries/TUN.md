# Tunisia (TUN)

Schema versions for employee onboarding in Tunisia.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in TND and stay hidden below it. Submit `extreme_salary_acknowledgement` with the value `"acknowledged"` when it is shown. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 8 },
    },
  }}
/>
```

---

### v7 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v7 or later get the newer engine path. No field changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**Type of change:** product

**What changed:**

- Deprecates `annual_leave_carry_forward`, because carryover of paid time off is governed by statutory policy. It is now read-only, titled "(Deprecated)" and hidden from new contracts
- `annual_leave_carry_forward` is no longer required and accepts `null` (N/A). Partners using a custom UI should stop rendering and submitting it. On read, it may be `null` or absent. Existing contracts are unaffected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** product

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is grouped with `annual_gross_salary` in the `annual_gross_salary_fieldset`. Render it but never submit it
- `annual_gross_salary` no longer has a static description. The enforced minimum salary is unchanged. Additive and flag-gated, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- `available_pto` now has a minimum of 12 days, including for part-time employment. Values below 12 are rejected. Its description now says not to include statutory, bank or public holidays

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** product

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds required `notice_period_choice`: `"recommended"` (30 days) or `"custom"`. With `"recommended"`, `notice_period_days` is hidden and fixed at 30. With `"custom"`, `notice_period_days` is shown and required. Partners using a custom UI must render and submit `notice_period_choice`
- `notice_period_days` is retitled "Notice period in days" and its description now reads "In Tunisia, the notice period can last at least 30 days."

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- `contract_duration_type` only accepts `"indefinite"`, which is now the default. `"fixed_term"` is rejected and `contract_end_date` is removed. The field gains help center content explaining contract types
- Replaces required `has_variable_bonus` with required `has_bonus` (`"yes"` / `"no"`). Partners using a custom UI must render and submit `has_bonus` instead of `has_variable_bonus`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
