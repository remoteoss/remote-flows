# Bangladesh (BGD)

Schema versions for employee onboarding in Bangladesh.

## Current Version

**Contract Details:** v8

## Contract Details

### v8 - Current

**Type of change:** compliance

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 8 },
    },
  }}
/>
```

---

### v7

**Type of change:** compliance

**What changed:**

- `contract_duration_type` no longer offers `fixed_term`, and `contract_end_date` is rejected, when the employee has a recognized seniority date (`has_seniority_date: "yes"`). Only `indefinite` is valid then. Gated by the `eor_seniority_block` and `eor_seniority_block_v1_ftc` feature flags for Bangladesh, and employments created before the cutoff date are unaffected. Remote Admins can still override the block.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 7 },
    },
  }}
/>
```

---

### v6 - jsf v1

**Type of change:** technical

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning this version or later get the newer engine path; validation and form generation follow JSON Schema Form v1 semantics. No field changes.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**Type of change:** compliance, technical

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`).
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it. `annual_gross_salary.description` is dropped from the schema in favour of it. Additive and flag-gated, so no action is required.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Non-solicitation clause reworked. The `non_solicit_clause_apply` and `non_solicitation_clause_halt_period_months` fields are removed. Required `non_solicitation_customers` and `non_solicitation_employees` (`"yes"` / `"no"`) replace them. Each is followed by `non_solicitation_customer_number_of_months` or `non_solicitation_employees_number_of_months` when its answer is `"yes"`. Partners using a custom UI must render and submit them.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Adds the `notice_period_choice` field and makes `notice_period_days` optional (`?notice_period_days`), so it is only asked for when the choice is custom. The recommended choice sets `notice_period_days` to 120.
- `notice_period_days` copy changes: the title is now "Notice period in days", and the help-center content is removed from its presentation. Custom UIs must render `notice_period_choice` and send it.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** product

**What changed:**

- Removes the `has_variable_bonus` field and its requirement. `has_bonus` gains help-center content about the bonus. Custom UIs must stop rendering and submitting `has_variable_bonus`.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      BGD: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
