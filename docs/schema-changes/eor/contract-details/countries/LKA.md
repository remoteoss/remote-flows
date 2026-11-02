# Sri Lanka (LKA)

Schema versions for employee onboarding in Sri Lanka.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** compliance

**What changed:**

- Fixed-term contracts are blocked when the employee's seniority date is recognized (`has_seniority_date: yes`), consistent with other countries that use the contract duration component. `contract_duration_type` then only accepts `indefinite`, and `contract_end_date` is rejected if provided, unless the request is made by a Remote Admin. Employments created before the seniority block cutoff date are unaffected. This depends on a backend setting that is not enabled yet, so no action is required for existing contracts

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** compliance

**What changed:**

- Adds the `extreme_salary_warning` message and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and depends on a backend setting that is not enabled yet, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 7 },
    },
  }}
/>
```

---

### v6 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v6 or later get the newer engine path; validation and form generation follow its semantics. Pin v5 or earlier to keep the previous engine

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance

**What changed:**

- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `salary_overview` and the existing salary-related fields are grouped with `annual_gross_salary` in an `annual_gross_salary_fieldset` built by the component. Additive and depends on a backend setting that is not enabled yet, so no action is required

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** technical

**What changed:**

No changelog was published for this version; the changes below come from comparing the schemas.

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds the required `compensation_currency_code` field. It only offers `LKR`, defaults to `LKR` and is read-only. Partners with a custom UI must send `LKR`
- Adds the hidden `payout_currency_code` field, fixed to `LKR`
- Removes `has_non_compete_clause_compensation`. When `non_compete_clause_apply` is `"yes"`, `non_compete_clause_halt_period_months` and `non_compete_clause_compensation_percentage` are now both required
- `non_compete_clause_compensation_percentage` changes from a text input (string or number, up to 255 characters) to a number input with a minimum of 1, shown as a percentage
- Adds `non_compete_clause_compensation_amount`, computed from `non_compete_clause_compensation_percentage` and `annual_gross_salary` and shown as a statement when the non-compete applies. The non-compete fields are grouped in a `non_compete_fieldset`
- Removes the USD salary and bonus currency rules, including the USD minimum annual salary. The LKR minimum for full-time employees (LKR 360,000.00) is unchanged

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** technical

**What changed:**

No changelog was published for this version; the changes below come from comparing the schemas.

- Adds the required `notice_period_choice` field: `recommended` (1 month) or `custom`
- `notice_period` is now hidden and fixed at 1 when `notice_period_choice` is `recommended`. When it is `custom`, `notice_period` is shown as a number input with a minimum of 0 and is required. Partners with a custom UI must render `notice_period_choice` and send `notice_period` accordingly

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** technical

**What changed:**

No changelog was published for this version; the changes below come from comparing the schemas.

- Removes the required `has_variable_bonus` field. Stop sending it
- `variable_bonus_details` no longer depends on `has_variable_bonus`: it is always available and optional (up to 1000 characters)

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      LKA: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
