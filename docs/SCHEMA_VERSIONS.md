# Contract Schema Versions

Contract schemas are versioned independently from SDK versions. This document indexes available schema versions by country.

## By Country

### 🇩🇪 Germany (DEU)

- **contract_details v2.0** (SDK 1.1.0+)
  - [View changes](./schema-changes/germany/contract-details-v2.md)
  - [Detailed visual comparison (PDF)](./schema-changes/germany/germany-contract-details-v2.pdf)

---

## How to Use Schema Versions

```tsx
import { OnboardingFlow } from '@remoteoss/remote-flows';

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
