# Bulgaria (BGR)

Schema versions for employee onboarding in Bulgaria.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), once the `eor_seniority_block` and `eor_seniority_block_v2_ftc` feature flags are enabled for the country. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected
- `contract_end_date` now also accepts `null`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**What changed:**

- Adds the `extreme_salary_acknowledgement` checkbox and the `extreme_salary_warning` message, shown when the annual gross salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 7 },
    },
  }}
/>
```

---

### v6 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v6 or later get the newer engine path
- No field, property or validation-rule changes

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Adds the `salary_overview` field, which notes the salary at or above which a reserve payment is requested. It is display-only: render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. The related salary fields are grouped with the salary field in an `annual_gross_salary_fieldset` built by the component

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds the optional `job_code` field (Bulgarian NCOD work position)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- Bulgaria moves to the euro: `compensation_currency_code` is removed and the `annual_gross_salary`, `bonus_amount` and `signing_bonus_amount` fields are now in EUR instead of BGN
- Partners using a custom UI must stop rendering and submitting `compensation_currency_code`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- Adds the `notice_period_choice` field (`recommended` for 1 month, or `custom`). `notice_period` is read-only at the recommended value and is only editable (1 to 3 months) when `custom` is chosen
- Partners using a custom UI must render `notice_period_choice`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGR: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
