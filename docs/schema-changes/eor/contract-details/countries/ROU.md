# Romania (ROU)

Schema versions for employee onboarding in Romania.

## Current Version

**Contract Details:** v6

## Contract Details

### v6 - Current

**Type of change:** compliance

**What changed:**

This entry summarizes everything that changed between v1 and v6, compared from the schema snapshots. It is not broken down per intermediate version.

- Adds the required `schedule_type` field and a required `daily_schedule` (`selected_days` plus `start_time`, `end_time` and `break_duration_minutes` for each selected weekday). `work_hours_per_week` is now a hidden input
- Adds the required `available_pto_type` field. `available_pto` is no longer required, no longer has the 20-day minimum, and is hidden unless the PTO type calls for it
- Adds the required `third_party_work` and `work_equipment_provided_by` fields
- `work_address_is_home_address` is replaced by the required `work_address.is_home_address`
- `compensation_currency_code` is no longer shown
- Adds the optional `contract_code_psp`, `cor_position_title` and `job_code` fields, and the display-only `salary_overview` field. Render `salary_overview` but never submit it

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      ROU: { contract_details: 6 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
