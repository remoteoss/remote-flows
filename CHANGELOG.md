# @remoteoss/remote-flows

## 0.4.0

### Minor Changes

- c8a0cf3: - Add conversion feature for the annual gross salary
  - Fix json-schema-version for onboarding && contract amendment flows

## 0.4.0-alpha.10

### Minor Changes

- 13c2803: - Add property `isEmploymentReadOnly` to use it in the review step
  - Remove reset from the SDK

## 0.4.0-alpha.9

### Minor Changes

- c360410: - Buttons can be replaced with the components prop
  - Fix flickering state when an employment is invited and we're moving the user to the review step
  - Fix skip to review when a countryCode is not passed
  - Fix meta property to be properly set when we move the user to the review step
  - Create FieldComponentProps, ButtonComponentProps and StatementComponentProps types for custom components

## 0.4.0-alpha.8

### Minor Changes

- d16f1fc: - Create a ReviewStep component to handle the Onboarding credit flows
  - Move to the latest step if the employee is invited or waiting for a reserve invoice to be paid

## 0.4.0-alpha.7

### Minor Changes

- 278e485: - Change onSubmit argument on the CostCalculatorForm
  - Fix invitation process, the invite didn't work if you tried to complete the onboarding in one go

## 0.4.0-alpha.6

### Minor Changes

- 20c86ba: - Fix lodash imports for webpack
  - You can use the `shouldResetForm` in the `<CostCalculatorForm>` to reset after you submit

## 0.4.0-alpha.5

### Minor Changes

- 797e279: - Ability to skip the country step
  - Add work-schedule field

## 0.4.0-alpha.4

### Minor Changes

- 81fe6de: - Add new step to the onboarding flow to select country
  - Add support to the OnboardingInvite button to create a reserve invoice if creditRiskStatus is "deposit_required"
  - Fix money values passed to the json schema form

## 0.4.0-alpha.3

### Minor Changes

- db506de: - Locked benefits statement
  - Mapped labels in the review step
  - Fix benefits as they were included the results in each step
  - Allow jumping to previous step
  - Add hidden field
  - Handle undefined statements

## 0.4.0-alpha.2

### Minor Changes

- 66b5872: - Export some missing types for our partners
  - Improve contract amendments and onboarding examples
  - Empty strings are removed and the params are not sent to the API endpoints
  - Benefit card selection is available in our examples
  - Support promises inside onSuccess callbacks for our flows
  - Fix invite button
  - Add tests for the onboarding flow

## 0.4.0-alpha.1

### Minor Changes

- 9333ec4: - Submit benefits to the Remote API server and retrieve the benefits selected
  - Handle field visibility in fieldsets
  - Fix submission basic information step values
  - Fix money field transformation for the contract details step
  - Fix custom components prop for fieldsets

## 0.4.0-alpha.0

### Minor Changes

- 9dbe4c1: Add onboarding flow (WIP)

## 0.3.0

### Minor Changes

- ff85a18: - New Termination Architecture
  - Contract Amendment release
  - json-schema versioning

## 0.2.2

### Patch Changes

- 668577e: Fix formValues state for the termination form as conditional fields weren't working correctly

## 0.2.1

### Patch Changes

- 0c60bdb: - Fixes file upload component preventing the submission of the form
  - Fixes conditional fields not appearing after selecting radio fields
  - Fixes payload submission

## 0.2.0

### Minor Changes

- 55a43cc: Add TerminationFlow and inner components. Includes documentation and examples.

## 0.1.2

### Patch Changes

- fa6ec03: - Support proxying request
  - Contract Amendments (WIP)
  - Offboarding (WIP)

## 0.1.1

### Patch Changes

- 9e54e4f: fix reset onClick on the cost calculator flow

## 0.1.0

### Minor Changes

- 9e8e5a1: Support for custom field components

## 0.0.6

### Patch Changes

- bdc696c: Fix handleValidation and add example about rendering flags

## 0.0.5

### Patch Changes

- aeac164: Support options.jsfModify to allow customization of cost calculator form labels and other schema properties

## 0.0.4

### Patch Changes

- 48544df: Add `CostCalculatorFlow` and related components to build the CostCalculator in a more flexible way
- 8af7ae7: Assign label as placeholders

## 0.0.3

### Patch Changes

- 2eb1183: - Add include_premium_benefits to the cost calculator flow
- ce8dec3: - Export useCostCalculator hook to consumers

## 0.0.2

### Patch Changes

- 79d97c4: Append field name to CSS classes

## 0.0.1

### Patch Changes

- 09a7cfd: Updated peerDependencies

## 0.0.1

### Patch Changes

- 926f2b0: Initial release
