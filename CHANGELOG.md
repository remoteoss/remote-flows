# @remoteoss/remote-flows

## 0.26.0

### Minor Changes

- handle unlimited time off (#547) [#547](https://github.com/remoteoss/remote-flows/pull/547)
- empty state (#551) [#551](https://github.com/remoteoss/remote-flows/pull/551)
- add table as a component (#550) [#550](https://github.com/remoteoss/remote-flows/pull/550)
- add current entitlement days calculation and enhance drawer (#549) [#549](https://github.com/remoteoss/remote-flows/pull/549)

## 0.25.0

### Minor Changes

- add helpCenter link support to FieldSetField component (#545) [#545](https://github.com/remoteoss/remote-flows/pull/545)
- parse minDate as ISO string to ensure correct date handling (#544) [#544](https://github.com/remoteoss/remote-flows/pull/544)

## 0.24.0

### Minor Changes

- extract PaidTimeOff logic into a container component (#538) [#538](https://github.com/remoteoss/remote-flows/pull/538)
- format errors for contractor onboarding (#540) [#540](https://github.com/remoteoss/remote-flows/pull/540)
- normalize drawer component with shared implementation (#539) [#539](https://github.com/remoteoss/remote-flows/pull/539)
- correct time off API to reflect user-requested dates (#541) [#541](https://github.com/remoteoss/remote-flows/pull/541)

## 0.23.0

### Minor Changes

- improve UI layout and standardize button labels (#534) [#534](https://github.com/remoteoss/remote-flows/pull/534)
- use contractor basic info (#536)[#536](https://github.com/remoteoss/remote-flows/pull/536)
- simplify version checking output (#532) [#532](https://github.com/remoteoss/remote-flows/pull/532)
- create new paid_time_off field (#530) [#530](https://github.com/remoteoss/remote-flows/pull/530)
- add paid time off breakdown drawer with detailed view (#535) [#535](https://github.com/remoteoss/remote-flows/pull/535)

## 0.22.0

### Minor Changes

- fix proxy links (#526) [#526](https://github.com/remoteoss/remote-flows/pull/526)
- add image error handling (#527) [#527](https://github.com/remoteoss/remote-flows/pull/527)
- remove changesets dependency and bump version (#528) [#528](https://github.com/remoteoss/remote-flows/pull/528)
- add statement (#529) [#529](https://github.com/remoteoss/remote-flows/pull/529)
- Add initial values support to Termination flow component (#524) [#524](https://github.com/remoteoss/remote-flows/pull/524)

## 0.22.0

### Minor Changes

- fix proxy links (#526) [#526](https://github.com/remoteoss/remote-flows/pull/526)
- add image error handling (#527) [#527](https://github.com/remoteoss/remote-flows/pull/527)
- remove changesets dependency and bump version (#528) [#528](https://github.com/remoteoss/remote-flows/pull/528)
- add statement (#529) [#529](https://github.com/remoteoss/remote-flows/pull/529)
- Add initial values support to Termination flow component (#524) [#524](https://github.com/remoteoss/remote-flows/pull/524)

## 0.21.1

### Patch Changes

- skip internal links (#520) [#520](https://github.com/remoteoss/remote-flows/pull/520)
- add tests (#522) [#522](https://github.com/remoteoss/remote-flows/pull/522)

## 0.21.0

### Minor Changes

- Add jsonSchemaVersion support to onboarding forms (#500) [#500](https://github.com/remoteoss/remote-flows/pull/500)
- Refactor API to add JWT authentication support (#499) [#499](https://github.com/remoteoss/remote-flows/pull/499)
- Sanitize the description for the statements (#510)[#510](https://github.com/remoteoss/remote-flows/pull/510)
- Fix change country in both onboardings (#514)[#514](https://github.com/remoteoss/remote-flows/pull/514)
- Add disabled attribute to select.option field (#513)[#513](https://github.com/remoteoss/remote-flows/pull/513)
- Sanitize benefit tooltips in the `ÈstimateResults`(#517)[#517](https://github.com/remoteoss/remote-flows/pull/517)

## 0.20.1

### Patch Changes

- c160ced: - Fix bug in the salary field on the `CostCalculatorFlow` when changing country or billing currency [#493](https://github.com/remoteoss/remote-flows/pull/493)

## 0.20.0

### Minor Changes

- 4d36458: - Enable CSV Downloads [#486](https://github.com/remoteoss/remote-flows/pull/486)
  - Fix estimation result labels [#487](https://github.com/remoteoss/remote-flows/pull/487)
  - Improve CostCalculator error handling [#488](https://github.com/remoteoss/remote-flows/pull/488)
  - Improve css selectors for the `EstimateResults` and `SummaryResults` [#489](https://github.com/remoteoss/remote-flows/pull/489)

## 0.19.0

### Minor Changes

- a11e218: - Improvements to the termination json schema [#478](https://github.com/remoteoss/remote-flows/pull/478)
  - Add `TerminationDialogInfoContent` for the first modal that opens the termination [#479](https://github.com/remoteoss/remote-flows/pull/479)
  - Fix `management_fee` when you edit [#481](https://github.com/remoteoss/remote-flows/pull/481)
  - Fix `region` when you edit [#482](https://github.com/remoteoss/remote-flows/pull/482)
  - Fix `age` or `contract_duration_type` when you edit [#483](https://github.com/remoteoss/remote-flows/pull/483)

## 0.18.1

### Patch Changes

- 29c9d4e: - fix hiring budget jsfModify override [#474](https://github.com/remoteoss/remote-flows/pull/474)

## 0.18.0

### Minor Changes

- afefb52: - Hide management field value with a toggle [#471](https://github.com/remoteoss/remote-flows/pull/471)

## 0.17.0

### Minor Changes

- 37349ae: - Introduce `estimateOptions.showManagementFee` to control the visibility of the management field [#461](https://github.com/remoteoss/remote-flows/pull/461)
  - Fix a bug related to the management field when exporting several estimations [#463](https://github.com/remoteoss/remote-flows/pull/463)
  - Fix a bug related to conversions when the `CostCalculator` flow uses `version='marketing'`[#466](https://github.com/remoteoss/remote-flows/pull/466)
  - Fix estimations copy in the `EstimateResults` component [#467](https://github.com/remoteoss/remote-flows/pull/467)
  - `CostCalculatorFlow` defaultValues accepts now hiring hiringBudget prop to initialize the form [#468](https://github.com/remoteoss/remote-flows/pull/468)

## 0.16.0

### Minor Changes

- 078723d: - Add hiring budget option [#439](https://github.com/remoteoss/remote-flows/pull/439)
  - Add the posibility to edit the estimation title [#450](https://github.com/remoteoss/remote-flows/pull/450)
  - Fix estimate results regional amounts [#454](https://github.com/remoteoss/remote-flows/pull/454)
  - Fix uk flag for the estimate results [#456](https://github.com/remoteoss/remote-flows/pull/456)

## 0.15.0

### Minor Changes

- 39373b5: - Fix hiring guides links [#440](https://github.com/remoteoss/remote-flows/pull/440)
  - Add annual gross salary in header [#441](https://github.com/remoteoss/remote-flows/pull/441)
  - Hide minimumOnboarding if it's null [#442](https://github.com/remoteoss/remote-flows/pull/442)
  - Filter countries if they're not prepared to do onboarding or estimations [#445](https://github.com/remoteoss/remote-flows/pull/445)
  - Add edit functionality to the estimation form [#446](https://github.com/remoteoss/remote-flows/pull/446)
  - Add key to onboarding form to see if a reflow bug disappears [#451](https://github.com/remoteoss/remote-flows/pull/451)

## 0.14.0

### Minor Changes

- db2f477: - Override ZendeskDrawer component through the components prop [#435](https://github.com/remoteoss/remote-flows/pull/435)

## 0.13.0

### Minor Changes

- 2ad10ad: - feat: fieldsets support an inset variant [#425](https://github.com/remoteoss/remote-flows/pull/425)
  - feat: add management fieldset [#423](https://github.com/remoteoss/remote-flows/pull/423)
  - feat: add css classes to the EstimationResults [#431](https://github.com/remoteoss/remote-flows/pull/431)
  - feat: add managementFees option to the estimationOptions [#428](https://github.com/remoteoss/remote-flows/pull/428)

## 0.12.0

### Minor Changes

- 4cac729: - fix: Group summary results by country to correctly sum annual cost && monthly cost [#417](https://github.com/remoteoss/remote-flows/pull/417)
  - feat: use employer billing currency in the salary field [#410](https://github.com/remoteoss/remote-flows/pull/410)
  - feat: add includeManagement fee option to include it inside the estimation [#420](https://github.com/remoteoss/remote-flows/pull/420)

## 0.11.0

### Minor Changes

- 0005041: - Release results component [#397](https://github.com/remoteoss/remote-flows/pull/397)
  - Add region and flag to the results component [#413](https://github.com/remoteoss/remote-flows/pull/413)
  - Customize header, onboarding timeline, hiring and footer inside the results component [#412](https://github.com/remoteoss/remote-flows/pull/412)
  - Add delete functionality to the results component [#400](https://github.com/remoteoss/remote-flows/pull/400)
  - Add export functionality to the results component [#401](https://github.com/remoteoss/remote-flows/pull/401)
  - Call new conversion endpoints in the cost calculator to get a better experience in the onboarding [#405](https://github.com/remoteoss/remote-flows/pull/405)
  - Create a SummaryResults component [#404](https://github.com/remoteoss/remote-flows/pull/404)
  - If the user uses the conversion field the estimate should have the same value in USD [#408](https://github.com/remoteoss/remote-flows/pull/408)
  - Fix types in json-schema-version [#398](https://github.com/remoteoss/remote-flows/pull/398)
  - Fix default values in cost calculator as the region field wasn't getting loaded correctly [#407](https://github.com/remoteoss/remote-flows/pull/407)

## 0.10.0

### Minor Changes

- 9931ab5: - Export `EstimateError` type from the source [#386](https://github.com/remoteoss/remote-flows/pull/386/)
  - buildCostCalculatorEstimationPayload accepts now an array and we're able to export multiple estimations [#391](https://github.com/remoteoss/remote-flows/pull/391)
  - Fix `ForceValueField` if statement.description is not available, we'll use the the description [#393](https://github.com/remoteoss/remote-flows/pull/393)
  - Expose an `internals` file, this file should be only used in demo apps [#392](https://github.com/remoteoss/remote-flows/pull/392)

## 0.9.0

### Minor Changes

- 7d18549: add external_id as an option [#378](https://github.com/remoteoss/remote-flows/pull/378)

### Patch Changes

- dce7a84: Added support for initialValues [#382](https://github.com/remoteoss/remote-flows/pull/382)

## 0.8.1

### Patch Changes

- d7acc29: - fixes title in ForceValueField when `statement?.title` is undefined [#377](https://github.com/remoteoss/remote-flows/pull/377)

## 0.8.0

### Minor Changes

- c52e85e: - Add authId property to the RemoteFlows to fix a bug that was happening when navigating between demos with different authentication [#373](https://github.com/remoteoss/remote-flows/pull/373)
  - Ensure consistent results when using the conversion fields [#372](https://github.com/remoteoss/remote-flows/pull/372)
  - Add learn more links in the cost calculator that shows the content of the zendesk articlesd [#370](https://github.com/remoteoss/remote-flows/pull/370)

## 0.7.5

### Patch Changes

- c5b0466: - Fix hidden fields that were rendering by mistake [#368](https://github.com/remoteoss/remote-flows/pull/368)

## 0.7.4

### Patch Changes

- 3a6e99b: - Fix react keys warnings [#364](https://github.com/remoteoss/remote-flows/pull/364)

## 0.7.3

### Patch Changes

- 79a67e3: - fix fieldset field key fragment [#361](https://github.com/remoteoss/remote-flows/pull/361)

## 0.7.2

### Patch Changes

- 7ea2eac: - Remove suspicious code that it's breaking the onboarding [#358](https://github.com/remoteoss/remote-flows/pull/358)

## 0.7.1

### Patch Changes

- 1a4d461: - Fix tooltips in the cost calculator results [#354](https://github.com/remoteoss/remote-flows/pull/354)
  - Add extra statuory payments and local indirect tax section [#353](https://github.com/remoteoss/remote-flows/pull/353)

## 0.7.0

### Minor Changes

- 94fd723: - Add resetFields property to reset determined fields in the CostCalculator [#350](https://github.com/remoteoss/remote-flows/pull/350)

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
