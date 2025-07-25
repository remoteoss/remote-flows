# @remoteoss/remote-flows

## 0.6.0

### Minor Changes

- fe82ce1: Add equity banner under the equity_compensation field [#331](https://github.com/remoteoss/remote-flows/pull/331)

## 0.5.1

### Patch Changes

- e8171aa: Fix select onChange casting, we'll only cast when jsonType is `number` [#345](https://github.com/remoteoss/remote-flows/pull/345)

## 0.5.0

### Minor Changes

- a1ab9a9: - Add canInvite property to the onboardingBag [#342](https://github.com/remoteoss/remote-flows/pull/342)

## 0.4.2-alpha.0

### Patch Changes

- dc9405a: - bundle react-hook-form dependencies to fix behavior of the fieldsets when you download the package [#339](https://github.com/remoteoss/remote-flows/pull/339)

## 0.4.1

### Patch Changes

- 4a954c7: - Fixed radio options to ensure they are properly disabled when needed [#330](https://github.com/remoteoss/remote-flows/pull/330)
  - Fixed multi-select components inside fieldsets that were incorrectly rendering as single-select elements [#332](https://github.com/remoteoss/remote-flows/pull/332)
  - Added window.RemoteFlowsSDK exposure in non-production environments to help identifing which version is being used [#334](https://github.com/remoteoss/remote-flows/pull/334)
  - Improvement on how fieldsets are invalidated, before if you touched a fielset the whole form was invalidated, now only after a submission is done [#337](https://github.com/remoteoss/remote-flows/pull/337)

## 0.4.0

### Patch Changes

- 74d3dc6: - Fix infinity loop in contract details related to the annual gross salary [#326](https://github.com/remoteoss/remote-flows/pull/326)
  - Fix money fields only allowing 15 characters of length [#327](https://github.com/remoteoss/remote-flows/pull/327)
  - Fix ack fields that weren't checked before after the values were submitted [#322](https://github.com/remoteoss/remote-flows/pull/322)
  - Fix provisional_start date field, now the onboarding considers the mot variable [#321](https://github.com/remoteoss/remote-flows/pull/321)

## 0.4.0-alpha.25

### Patch Changes

- 7f18e50: fix(select): Fix onchange value in a custom select

## 0.4.0-alpha.24

### Patch Changes

- 0d13274: - feat(flat fieldsets): Support to flat fieldsets
  - fix(fieldsets): Trigger manual validation
  - fix(onboarding): Support to multi select and bug fixing
  - fix(onboarding): Fix selected benefits
  - feat(cost-calculator): Add version parameter to CostCalculatorFlow
  - fix(currency-conversion): Reset conversion field on source currency changes

## 0.4.0-alpha.23

### Patch Changes

- b6c568c: Update contract eligibility after creating an employment

## 0.4.0-alpha.22

### Patch Changes

- 5b6c71e: Fix estimation payload when selecting benefits as none

## 0.4.0-alpha.21

### Patch Changes

- fe8a323: Add property metadata to fieldData and fix types

## 0.4.0-alpha.20

### Patch Changes

- 2d93892: Drop VITE_API_URL in favor of location.origin

## 0.4.0-alpha.19

### Patch Changes

- a987085: add some logging

## 0.4.0-alpha.18

### Patch Changes

- ce47040: Add conversion functionality to the salary field

## 0.4.0-alpha.17

### Patch Changes

- 3d31c2a: Use currency conversion from the backend

## 0.4.0-alpha.16

### Patch Changes

- b2b7fac: Trigger validation from the save draft button

## 0.4.0-alpha.15

### Patch Changes

- 7824696: Add SaveDraftButton and fix meta currency

## 0.4.0-alpha.14

### Patch Changes

- 601baa4: Improve meta fields and annual gross salary

## 0.4.0-alpha.13

### Minor Changes

- 9a85609: Remove isTestingMode and support new environment prop

## 0.4.0-alpha.12

### Patch Changes

- 76ca70c: - Improve errors in the onboarding flow
  - Add Onboarding readme
  - Improve recovery of an employment

## 0.4.0-alpha.11

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
