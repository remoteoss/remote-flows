# Migration Guide

This guide helps you upgrade between major versions of `@remoteoss/remote-flows`.

## Table of Contents

- [Version 1.0.0](#version-100)
  - [Overview](#overview)
  - [Breaking Changes](#breaking-changes)
    - [1. CostCalculatorFlow](#1-costcalculatorflow)
    - [2. RemoteFlows](#2-remoteflows)
    - [3. Internal imports](#3-internal-imports)
    - [4. TerminationFlow, OnboardingFlow and ContractorOnboardingFlow](#4-terminationflow-onboardingflow-and-contractoronboardingflow)

## Version 1.0.0

### Overview

Version 1.0.0 marks the first stable release of `@remoteoss/remote-flows`. This release includes:

- ✅ Upgraded json-schema-form dependency (0.x → 1.x)
- ✅ TerminationFlow and OnboardingFlow will use the json-schema-form v1, others will keep at v0 to avoid more breaking changes
- ✅ `ZendeskTriggerButton` import removed from `@remoteoss/remote-flows/internals`
- ✅ `CostCalculatorResults`, `CostCalculatorDisclaimer`, and `disclaimerUtils` will not be exported
- ✅ `authId` removed from `RemoteFlows` props

### Breaking Changes

#### 1. CostCalculatorFlow

Review that you aren't using any of these import names: `CostCalculatorResults`, `CostCalculatorDisclaimer`, and `disclaimerUtils`.

If you are, remove these imports as they are no longer exported from the main package.

#### 2. RemoteFlows

If you're using the `RemoteFlows` component, remove the `authId` property if it was previously used.

**Before:**

```tsx
<RemoteFlows auth={fetchToken} authId='user-123'>
  {/* flows */}
</RemoteFlows>
```

**After:**

```tsx
<RemoteFlows auth={fetchToken}>{/* flows */}</RemoteFlows>
```

#### 3. Internal imports

If you're importing `ZendeskTriggerButton` from the internals entry point, update the import path.

**Before:**

```tsx
import { ZendeskTriggerButton } from '@remoteoss/remote-flows/internals';
```

**After:**

```tsx
import { ZendeskTriggerButton } from '@remoteoss/remote-flows'#### 4. TerminationFlow and OnboardingFlow
```

#### 4. TerminationFlow, OnboardingFlow and ContractorOnboardingFlow

The `options.jsfModify` syntax has changed for component customization in the json-schema-form v1 upgrade. If you're overriding field descriptions or presentations with components, update the syntax.

The key change: pass a reference to the component, never invoke it. JSON Schema Form v1 will handle the component invocation internally.

**Before (v0.x):**

```tsx
<TerminationFlow
  options={{
    jsfModify: {
      fields: {
        termination_reason: {
          description: <TerminationReasonDetailsDescription />,
        },
      },
    },
  }}
/>
```

**After (v1.0.0):**

```tsx
<TerminationFlow
  options={{
    jsfModify: {
      fields: {
        termination_reason: {
          presentation: {
            description: TerminationReasonDetailsDescription,
          },
        },
      },
    },
  }}
/>
```

**What changed:**

- Move custom components inside a `presentation` object
- Pass the component reference (not JSX): `TerminationReasonDetailsDescription` instead of `<TerminationReasonDetailsDescription />`
- Wrap in the `presentation` object to work with json-schema-form v1

---

## Version History

- **v1.0.0** (2025-11-30) - First major release
- **v0.32.0** (2025-11-21) - before 1.00

---

_Last updated: [2025-11-30]_
