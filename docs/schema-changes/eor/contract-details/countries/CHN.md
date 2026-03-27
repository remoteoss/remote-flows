# China (CHN)

Schema versions for employee onboarding in China.

## Current Version

**Contract Details:** v3 (Since SDK 1.23.0)

## Contract Details

### v3 - Current (Since SDK 1.23.0, March 2026)

- China employment contracts now only support 4 provinces (Beijing, Guangdong, Shanghai, Zhejiang) instead of 8, to align with Remote's officially registered locations where Social Insurance and Housing Fund benefits are available.

### v2 (Since SDK 1.23.0, March 2026)

**What changed:**

- Added `notice_period` component
  - Handles country-specific notice period rules automatically
  - Unit, minimum, and maximum values are country-specific
- Added `notice_period_choice` field for policy-based configurations
- Old `notice_period_[unit]` field removed from required fields
- Component manages validation based on employment type and local regulations

**Migration:**

```tsx
<OnboardingFlow
  options={{
    jsonSchemaVersionByCountry: {
      CHN: { contract_details: 2 },
    },
  }}
/>
```

---

### v1 (SDK 1.0.0)

Initial version with basic contract details fields.
