# Germany Contract Details v2.0

**Available in:** SDK 1.1.0+

## Overview

Schema v2 simplifies the contract details form with fewer fields and cleaner presentation.

## Key Changes

- Contract Duration Type: Help center links now embedded
- Notice Period: Reduced fields, removed statement section
- Probation Period: Added `<details>` and `<summary>` tags for collapsible sections
- Annual Gross Salary: Fixed HTML tag rendering

## Visual Comparison

📄 **[View detailed comparison with screenshots →](./germany-contract-details-v2.pdf)**

## Caveats

- Probation period calculations in radio labels coming in v3
- Requires @remoteoss/remoteflows v1.1.0+

## Migration

When upgrading from v1 to v2:

```tsx
// Before
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DEU: {
        contract_details: 1,
      },
    },
  }}
/>;

// After
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      DEU: {
        contract_details: 2,
      },
    },
  }}
/>;
```
