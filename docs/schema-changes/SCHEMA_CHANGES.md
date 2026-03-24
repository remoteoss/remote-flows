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

_Coming soon_

## Version Support Matrix

Track which schema versions are supported by each SDK version.
| SDK Version | Basic Information | Contract Details |
|-------------|-------------------|------------------|
| 1.23.0+ | v3 (recommended) | _TBD_ |
| 1.0.0+ | v1 (legacy) | _TBD_ |

**Legend:**

- **Recommended** - Use this version for new integrations
- **Legacy** - Maintained for backward compatibility only
- **TBD** - Coming soon
