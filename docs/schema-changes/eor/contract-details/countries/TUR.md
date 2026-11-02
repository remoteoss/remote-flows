# Turkey (TUR)

Schema versions for employee onboarding in Turkey.

## Current Version

**Contract Details:** v7

## Contract Details

### v7 - Current

**Type of change:** compliance

**What changed:**

This entry summarizes everything that changed between v1 and v7, compared from the schema snapshots. It is not broken down per intermediate version.

- Adds the required `post_termination_restrictions`, `start_date_ack` and `third_party_work` fields
- `confidentiality_agreement_apply` and `non_compete_clause_apply` are no longer required. `non_compete_clause_apply` is no longer shown
- Choosing `confidentiality_agreement_apply=yes` no longer shows `confidentiality_agreement`, which is now an optional field
- Choosing `non_compete_clause_apply=yes` no longer shows `non_compete_clause_halt_period_months`. `non_compete_turkey_provinces` items are now optional
- Choosing `compensation_currency_code=GBP` now requires `payout_currency_code`

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      TUR: { contract_details: 7 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
