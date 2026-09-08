# Migration Guide

This guide helps you upgrade between major versions of `@remoteoss/remote-flows`.

## Table of Contents

- [Version 2.0.0](#version-200)
  - [Overview](#overview-1)
  - [Breaking Changes](#breaking-changes-1)
    - [1. CostCalculator: `validationSchema` removed](#1-costcalculator-validationschema-removed)
    - [2. CostCalculator: reset now applies up-to-date default values](#2-costcalculator-reset-now-applies-up-to-date-default-values)
- [Version 1.0.0](#version-100)
  - [Overview](#overview)
  - [Breaking Changes](#breaking-changes)
    - [1. CostCalculatorFlow](#1-costcalculatorflow)
    - [2. RemoteFlows](#2-remoteflows)
    - [3. Internal imports](#3-internal-imports)
    - [4. handleValidation and parseFormValues](#4-handlevalidation-and-parseformvalues)

## Version 2.0.0

### Overview

Version 2.0.0 rewrites `CostCalculatorFlow`'s internals to match every other flow in the package (Onboarding, Termination, InvoiceSchedule, …):

- ✅ `useCostCalculator` now uses the same JSON-Schema-Form pipeline as the rest of the package, instead of a bespoke, hand-rolled form
- ✅ `useCostCalculator`'s bag no longer exposes `validationSchema` (an internal Yup schema)
- ✅ `useCostCalculator`'s bag now exposes `fieldValues`, `checkFieldUpdates`, `resetKey`, and `meta['x-jsf-fieldsets']`
- ✅ `resetForm()` and the Reset button now reset to correct, up-to-date default values (previously they could revert to a stale snapshot, most noticeably losing a currency-dependent management fee default)
- ✅ Yup is no longer a dependency of the cost calculator flow

### Breaking Changes

#### 1. CostCalculator: `validationSchema` removed

The Yup-based `validationSchema` field is no longer returned from `useCostCalculator`'s bag. It was always an internal implementation detail — validation is driven entirely by `handleValidation`, whose shape is unchanged.

**Before:**

```tsx
const { validationSchema } = useCostCalculator({ estimationOptions });
```

**After:**

Remove any direct use of `validationSchema`. Use `handleValidation` as before if you need to validate form values manually.

#### 2. CostCalculator: reset now applies up-to-date default values

`CostCalculatorResetButton`, `costCalculatorBag.resetForm()`, and the `CostCalculatorForm` `shouldResetForm` prop previously reset the form to a stale snapshot captured when it first mounted. They now reset to the current, correctly-computed defaults — most visibly, the management fee field now reflects the currently selected currency after a reset, rather than whatever it showed before any currency had been picked. If you were compensating for this by manually re-applying values after calling `resetForm()`, remove that workaround.

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

- **v2.0.0** (Unreleased) - CostCalculator rewrite
- **v1.0.0** (2025-11-30) - First major release
- **v0.32.0** (2025-11-21) - before 1.00

---

_Last updated: [2026-09-09]_
