# El Salvador (SLV)

Schema versions for employee onboarding in El Salvador.

## Current Version

**Contract Details:** v5

## Contract Details

### v5 - Current

**Type of change:** compliance

**What changed:**

- New `work_equipment` field (titled "Equipment provided"): a text area where the employer lists the work equipment and its quantity, quality and condition. It is required when `work_equipment_provided_by` is `"provided_by_client"`. Custom UIs must render it in that case and send it (up to 1000 characters); leave it out when `work_equipment_provided_by` is `"provided_by_employee"`.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SLV: { contract_details: 5 },
    },
  }}
/>
```

---

### v4

**Type of change:** compliance

**What changed:**

- Fixed-term contracts stay unavailable, now enforced through the shared contract duration component. `contract_duration_type` is a radio field locked to `indefinite` (`const` and default) instead of a checkbox, and `contract_end_date` is rejected if provided. Employees with a recognized seniority date (`has_seniority_date: "yes"`) see a seniority-specific explanation. The form is indefinite-only in every case, including for Remote Admins, so no action is required for existing contracts.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SLV: { contract_details: 4 },
    },
  }}
/>
```

---

### v3

**Type of change:** compliance

**What changed:**

- Extreme-salary acknowledgement: a warning and a required checkbox appear when the annual salary is at or above the USD 1,000,000 equivalent. Additive and flag-gated, so no action is required unless a submitted salary crosses that threshold.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SLV: { contract_details: 3 },
    },
  }}
/>
```

---

### v2

**Type of change:** compliance, technical

**What changed:**

- High-salary reserve messaging is added to the annual gross salary field: a display-only `salary_overview` statement is grouped with the salary fields in an `annual_gross_salary_fieldset` built by the component.
- The form moves to the JSON Schema Form v1 engine. Validation and form generation follow v1 semantics. Additive and flag-gated.

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      SLV: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
