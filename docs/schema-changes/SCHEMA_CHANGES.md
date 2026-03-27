# Schema Changes

## Overview

This documentation tracks JSON schema version changes across the Remote Flows SDK. Use this guide to understand what changed between versions and which SDK version supports each schema.

**For new integrations:** Always use the latest version for each flow unless you have specific legacy requirements.

## Basic Information (EOR)

Schema versions for the Basic Information step in employee onboarding flows.

- **Latest: [v3](./eor/basic-information/v3/v3.md)** (SDK 1.23.0+) - **Recommended for all new integrations**
  - Removes unused manager/department fields
  - Adds Argentina acknowledgement field
  - Better seniority field coverage (KOR, BRA, JPN)
- [v1](./basic-information/v1.md) (SDK 1.0.0+) - Legacy version, maintained for backward compatibility

**Quick Start (v3):**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersion: {
      employment_basic_information: 3,
    },
  }}
/>
```

## Contract Details (EOR)

Schema versions for the Contract Details step in employee onboarding flows.

**Important:** Contract details schemas vary by country. Version 2 introduces notice_period handling, but the specific implementation differs per country.

**See country-specific documentation:** [View all countries →](./countries/README.md)

### Version Availability

- **v2** - Available for 18 countries (SDK 1.23.0+)
  - Belarus, China, Switzerland, Czech Republic, Hong Kong, Iceland, Jamaica, Kenya, Lebanon, Mauritius, Malaysia, Nigeria, Norway, New Zealand, Saudi Arabia, Singapore, Serbia, Sweden
- **v1** - Default for all other countries (SDK 1.0.0+)

**Quick Start (v2 example for Switzerland):**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHE: { contract_details: 2 },
    },
  }}
/>
```

## Version Support Matrix

Track which schema versions are supported by each SDK version.
| SDK Version | Basic Information | Contract Details |
|-------------|-------------------|------------------|
| 1.23.0+ | v3 (recommended) | v2 (18 countries) |
| 1.0.0+ | v1 (legacy) | v1 (default) |

**Legend:**

- **Recommended** - Use this version for new integrations
- **Legacy** - Maintained for backward compatibility only
- **TBD** - Coming soon
