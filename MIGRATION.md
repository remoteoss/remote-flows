# Migration Guide

This guide helps you upgrade between major versions of `@remoteoss/remote-flows`.

## Table of Contents

- [Version 1.0.0](#version-100)
  - [Overview](#overview)
  - [Breaking Changes](#breaking-changes)
    - [1. CostCalculatorFlow](#1-costcalculatorflow)
    - [2. RemoteFlows](#2-remoteflows)
    - [3. Internal imports](#3-internal-imports)
    - [4. handleValidation and parseFormValues](#4-handlevalidation-and-parseformvalues)

## Version 1.0.0

### Overview

Version 1.0.0 marks the first stable release of `@remoteoss/remote-flows`. This release includes:

- ✅ Fix file uploads, now the FileUpload will only emit files
- ✅ `handleValidation` and `parseFormValues` from the flowBags will be async
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

#### 4. handleValidation and parseFormValues

`handleValidation` and `parseFormValues` method is now async

**Before:**

```tsx
onboardingBag.handleValidation(values);
```

**After**

```tsx
await onboardingBag.handleValidation(values);
```

**Before:**

```tsx
onboardingBag.parseFormValues(values);
```

**After**

```tsx
await onboardingBag.parseFormValues(values);
```

---

## Version History

- **v1.0.0** (2025-11-30) - First major release
- **v0.32.0** (2025-11-21) - before 1.00

---

_Last updated: [2025-11-30]_
