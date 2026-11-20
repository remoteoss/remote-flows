# Austria (AUT)

Schema versions for employee onboarding in Austria.

## Current Version

**Contract Details:** v10

## Contract Details

### v10 - Current

**Type of change:** compliance

**What changed:**

- Adds the required `cba_review_ack` checkbox to the annual gross salary group. The employer confirms that the employee's collective bargaining agreement (CBA) level is subject to compliance review, which may require salary adjustments. Its only accepted value is `"acknowledged"`
- Custom UIs must render the checkbox and send `"cba_review_ack": "acknowledged"` on every contract details submission against v10, including later saves of existing Austria contract details
- Reads can return `cba_review_ack` whichever version you request. If you stay on v9, drop it from the payload before you write

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 10 },
    },
  }}
/>
```

---

### v9

**Type of change:** compliance

**What changed:**

- The probation period is blocked for employments with a recognized seniority date, the same way fixed-term contracts already are: `probation_length` is locked to `0` and any other value is rejected, unless the request is made by a Remote Admin. This depends on a backend setting that is not enabled yet. No action required for most submissions
- The `probation_length` conditions are rebuilt for the block. The field renders the same as before, including the warning when the probation period is waived

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 9 },
    },
  }}
/>
```

---

### v8

**What changed:**

- Adds `extreme_salary_warning` and a required `extreme_salary_acknowledgement` checkbox, grouped with the salary field. They appear when the annual gross salary is at or above the USD 1,000,000 equivalent in EUR and stay hidden below it. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 8 },
    },
  }}
/>
```

---

### v7 - jsf v1

**What changed:**

- The schema is now marked as the newer form engine version (`x-rmt-meta.jsfVersion` is `"1"`). Partners pinning v7 or later get the newer engine path
- Adds the display-only `salary_overview` field, which notes the salary at or above which a reserve payment is requested. Render it but never submit it
- `annual_gross_salary.description` now arrives as a computed attribute (`x-jsf-logic-computedAttrs`) instead of a static string, so it can append the reserve sentence. Additive and flag-gated

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 7 },
    },
  }}
/>
```

---

### v6

**What changed:**

- `overtime_pay_method` gains an all-in remuneration check: choosing `all_in_renumeration` is validated against the minimum salary rules (`aut_all_in_remuneration_salary_check`), so a salary that is too low for an all-in agreement is now rejected
- Reworded `experience_level` descriptions for levels IV, V and VI. Copy only

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 6 },
    },
  }}
/>
```

---

### v5

**What changed:**

- Baseline on the previous form engine (`x-rmt-meta.jsfOldVersion` is `true`)
- Adds required `non_interference_apply` (`"yes"` / `"no"`), `non_solicitation_customers` (`"yes"` / `"no"`), `non_solicitation_employees` (`"yes"` / `"no"`) and the `work_from_home_allowance_ack` checkbox. Partners using a custom UI must render and submit them
- `non_interference_halt_period` (1 to 12 months) is asked when `non_interference_apply` is `"yes"`; `non_solicitation_customer_number_of_months` and `non_solicitation_employees_number_of_months` (each 1 to 12 months) are asked when their matching clause is `"yes"`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**What changed:**

- Adds required `non_compete_clause_apply` (`"yes"` / `"no"`). When `"yes"`, `non_compete_clause_halt_period_months` and `non_compete_clause_compensation_percentage` (at least 1% of monthly base salary) are required, and `non_compete_clause_compensation_amount` is shown as the amount computed from them and the annual gross salary. Partners using a custom UI must render them

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**What changed:**

- `years_of_experience` now has a maximum of 15, in line with the Austrian Collective Bargaining Agreement, and its description says Remote recognizes up to 15 years of service. Values above 15 are rejected

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**What changed:**

- `experience_level` drops `level_1` (Level I) and now offers `level_2` to `level_6`. Submitting `level_1` is rejected
- Adds minimum annual gross salary rules by experience level, years of experience and work schedule, with errors that state the minimum for each combination. The `annual_gross_salary` description and help center content explain the Collective Bargaining Agreement salary table

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      AUT: { contract_details: 2 },
    },
  }}
/>
```

---

### v1

Initial version with basic contract details fields.
