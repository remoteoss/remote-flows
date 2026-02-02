# @remoteoss/remote-flows

## 1.10.0

### Minor Changes

#### Features

- allow any versioning in the Onboarding with jsonSchemaVersionByCountry (#721) [#721](https://github.com/remoteoss/remote-flows/pull/721)

#### Fixes

- fix cost calculator currency bug, ARG currency will show as ARS instead of using only $ (#718) [#718](https://github.com/remoteoss/remote-flows/pull/718)
- exclude files from the employment/:id call [#719](https://github.com/remoteoss/remote-flows/pull/719)
- fix bug related to the pricing plan radio card input (#722) [#722](https://github.com/remoteoss/remote-flows/pull/722)
- render help center links correctly in the description field (#720) [#720](https://github.com/remoteoss/remote-flows/pull/720)

## 1.9.0

### Minor Changes

#### Features

- populate pricing plan and contract preview sections for readonly employments (#715) [#715](https://github.com/remoteoss/remote-flows/pull/715)

#### Fixes

- transform correctly base64 files (#712) [#712](https://github.com/remoteoss/remote-flows/pull/712)
- handle exempt case that doesn't present file uploads (#714) [#714](https://github.com/remoteoss/remote-flows/pull/714)
- handle file uploads in the review step and fix performance degradation (#713) [#713](https://github.com/remoteoss/remote-flows/pull/713)

## 1.8.0

### Minor Changes

#### Features

- handle UK and Saudi Arabia edge cases for contractor onboarding (#705) [#705](https://github.com/remoteoss/remote-flows/pull/705)

#### Chore

- mock select field to make easier asserts (#706) [#706](https://github.com/remoteoss/remote-flows/pull/706)
- downgrade node engine to v20 (#710) [#710](https://github.com/remoteoss/remote-flows/pull/710)
- update remote-json-form-kit to latest version (#709) [#709](https://github.com/remoteoss/remote-flows/pull/709)

## 1.7.0

### Minor Changes

#### Features

- add statement informing users about contractor services agreement in the statement of work (#702) [#702](https://github.com/remoteoss/remote-flows/pull/702)
- add custom pricing plan cards with component override support and move product plans to step 2 [#687](https://github.com/remoteoss/remote-flows/pull/687)
- add Remote Payments setup section in the review step (#700) [#700](https://github.com/remoteoss/remote-flows/pull/700)
- implement update basic information (#703) [#703](https://github.com/remoteoss/remote-flows/pull/703)
- recover select pricing plan selected, add warning about backdating and add minDate to provisionalStartDate if CM+ is chosen (#691) [#691](https://github.com/remoteoss/remote-flows/pull/691)

#### Other

- improve internal form logic to enable the pdf viewer (#701) [#701](https://github.com/remoteoss/remote-flows/pull/701)

## 1.6.0

### Minor Changes

- add size prop to inline button variant (#695) [#695](https://github.com/remoteoss/remote-flows/pull/695)
- improve contract preview step (#697) [#697](https://github.com/remoteoss/remote-flows/pull/697)
- add customizable PDF viewer component (#698) [#698](https://github.com/remoteoss/remote-flows/pull/698)

## 1.5.1

### Patch Changes

- replace 'we' pronouns with 'Remote' for clarity (#694) [#694](https://github.com/remoteoss/remote-flows/pull/694)

## 1.5.0

### Minor Changes

- add automated coverage tracking with badge reporting (#618) [#618](https://github.com/remoteoss/remote-flows/pull/618)
- add hotfix release workflow with npm tag management (#676) [#676](https://github.com/remoteoss/remote-flows/pull/676)
- use secrets for gist configuration (#686) [#686](https://github.com/remoteoss/remote-flows/pull/686)
- lazy load form components with suspense boundaries (#661) [#661](https://github.com/remoteoss/remote-flows/pull/661)
- skip telemetry when enviroment is not local and in localhost (#688) [#688](https://github.com/remoteoss/remote-flows/pull/688)
- render statement and extra fields in JSON schema form (#692) [#692](https://github.com/remoteoss/remote-flows/pull/692)
- add content property to the helpCenter types (#690) [#690](https://github.com/remoteoss/remote-flows/pull/690)
- increase request size limit and add explicit button type (#689) [#689](https://github.com/remoteoss/remote-flows/pull/689)

## 1.4.3

### Patch Changes

- exclude zero-hour days from booked days calculation (#684) [#684](https://github.com/remoteoss/remote-flows/pull/684)

## 1.4.2

### Patch Changes

- improve error handling with typed error objects (#678) [#678](https://github.com/remoteoss/remote-flows/pull/678)
- prefill form with employment.basic_information.personal_email (#679) [#679](https://github.com/remoteoss/remote-flows/pull/679)
- fix timezone issues (#681) [#681](https://github.com/remoteoss/remote-flows/pull/681)
- fix duration summary (#682) [#682](https://github.com/remoteoss/remote-flows/pull/682)

## 1.4.1

### Patch Changes

- add jsonSchemaVersion to form configuration (#673) [#673](https://github.com/remoteoss/remote-flows/pull/673)
- handle timesheet file parsing and validation (#675) [#675](https://github.com/remoteoss/remote-flows/pull/675)

## 1.4.0

### Minor Changes

- implement comprehensive error telemetry and reporting system (#591) [#591](https://github.com/remoteoss/remote-flows/pull/591)

## 1.3.1

### Patch Changes

- simplify form values memoization to solve form state bug (#669) [#669](https://github.com/remoteoss/remote-flows/pull/669)
- prevent double submission (#666) [#666](https://github.com/remoteoss/remote-flows/pull/666)
- add inline variant support for ButtonDefault component (#667) [#667](https://github.com/remoteoss/remote-flows/pull/667)
- replace generic pronouns with Remote company name for clarity (#668) [#668](https://github.com/remoteoss/remote-flows/pull/668)
- extract headless form creation logic into reusable utility (#654) [#654](https://github.com/remoteoss/remote-flows/pull/654)
- calculate booked days from timeoff array length (#670) [#670](https://github.com/remoteoss/remote-flows/pull/670)

## 1.3.0

### Minor Changes

- simplify currency conversion to have same data that estimation (#662) [#662](https://github.com/remoteoss/remote-flows/pull/662)
- add new style export (#651) [#651](https://github.com/remoteoss/remote-flows/pull/651)
- expose setValue prop to custom JSF components (#655) [#655](https://github.com/remoteoss/remote-flows/pull/655)
- fix Components type (#660) [#660](https://github.com/remoteoss/remote-flows/pull/660)
- add provisional start date inside the contractor onboarding flow (#663) [#663](https://github.com/remoteoss/remote-flows/pull/663)
- add warning in contract details when dates are different (#664) [#664](https://github.com/remoteoss/remote-flows/pull/664)

## 1.2.2

### Patch Changes

- add manual release triggering and simplify version detection (#642) [#642](https://github.com/remoteoss/remote-flows/pull/642)
- extract checkbox and work schedule field defaults into separate components (#626) [#626](https://github.com/remoteoss/remote-flows/pull/626)
- replace wildcard exports with explicit named exports (#652) [#652](https://github.com/remoteoss/remote-flows/pull/652)
- consolidate helpCenter meta type into FieldDataProps (#650) [#650](https://github.com/remoteoss/remote-flows/pull/650)

## 1.2.1

### Patch Changes

- extract default component implementations (#624) [#624](https://github.com/remoteoss/remote-flows/pull/624)
- avoid sending not a number (#641) [#641](https://github.com/remoteoss/remote-flows/pull/641)
- make sure updateEmployment follows the same rules than the GET (#646) [#646](https://github.com/remoteoss/remote-flows/pull/646)
- fix json_schema_form params in updateEmployment (#644) [#644](https://github.com/remoteoss/remote-flows/pull/644)

## 1.2.0

### Minor Changes

- extract default field components into separate modules (#619) [#619](https://github.com/remoteoss/remote-flows/pull/619)
- extract default field components and simplify button logic (#623) [#623](https://github.com/remoteoss/remote-flows/pull/623)
- add help center drawer support to country and date picker fields (#638) [#638](https://github.com/remoteoss/remote-flows/pull/638)

## 1.1.4

### Patch Changes

- move PDF dependencies to main package (#635) [#635](https://github.com/remoteoss/remote-flows/pull/635)

## 1.1.3

### Patch Changes

- extract default field components and improve modularity (#617) [#617](https://github.com/remoteoss/remote-flows/pull/617)
- deep clone initialValues object to prevent mutations (#633) [#633](https://github.com/remoteoss/remote-flows/pull/633)

## 1.1.2

### Patch Changes

- implement lazy loading for PDF preview component (#611) [#611](https://github.com/remoteoss/remote-flows/pull/611)
- improve nested error handling in validation (#631) [#631](https://github.com/remoteoss/remote-flows/pull/631)

## 1.1.1

### Patch Changes

- fix form values and checkbox logic (#625) [#625](https://github.com/remoteoss/remote-flows/pull/625)
- ensure day is zero-padded in getYearMonthDate (#628) [#628](https://github.com/remoteoss/remote-flows/pull/628)
- reorder handleCheckboxChange parameters for consistency (#629) [#629](https://github.com/remoteoss/remote-flows/pull/629)

## 1.1.0

### Minor Changes

- consolidate test setup with shared TestProviders wrapper (#592) [#592](https://github.com/remoteoss/remote-flows/pull/592)
- add date picker input component and update tests (#612) [#612](https://github.com/remoteoss/remote-flows/pull/612)
- migrate to json-schema-form-next library (#596) [#596](https://github.com/remoteoss/remote-flows/pull/596)
- configure vitest globals and remove explicit imports (#590) [#590](https://github.com/remoteoss/remote-flows/pull/590)
- upgrade dev dependencies (#583) [#583](https://github.com/remoteoss/remote-flows/pull/583)
- add a fielset to be more similar to Remote's (#621) [#621](https://github.com/remoteoss/remote-flows/pull/621)
- add automated bundle size tracking and monitoring (#616) [#616](https://github.com/remoteoss/remote-flows/pull/616)
- add country-specific contract schema versioning (#614) [#614](https://github.com/remoteoss/remote-flows/pull/614)

## 1.0.0

### Major Changes

- Remove `ZendeskTriggerButton` from `remoteoss/remote-flows/internals` (#599) [#599](https://github.com/remoteoss/remote-flows/pull/599)
- Remove `CostCalculatorResults`, `CostCalculatorDisclaimer`, `CostCalculatorDisclaimer` (#600) [#600](https://github.com/remoteoss/remote-flows/pull/600)
- Fix `FileUploadField`, `handleValidation` and `parseFormValues` are async (#604) [#604](https://github.com/remoteoss/remote-flows/pull/604)
- remove `authId` from `RemoteFlows` (#608) [#608][https://github.com/remoteoss/remote-flows/pull/608]

## 0.32.0

### Minor Changes

- export FileUploader component and add file field support (#584) [#584](https://github.com/remoteoss/remote-flows/pull/584)
- consolidate validation resolvers and add form error iteration support (#585) [#585](https://github.com/remoteoss/remote-flows/pull/585)
- add support for next version of json-schema-form (#586) [#586](https://github.com/remoteoss/remote-flows/pull/586)
- add test to validate the select country step when it's empty (#597) [#597](https://github.com/remoteoss/remote-flows/pull/597)
- migrate internally from field.type to field.inputType, FieldsetField if it doesn't found the component to render we show a fallback (#595) [#595](https://github.com/remoteoss/remote-flows/pull/595)
- Deprecate `authId` and create a factory to create the `httpClient` (#594) [#594](https://github.com/remoteoss/remote-flows/pull/594)
- Add `errorBoundary` prop to `RemoteFlows` and setup an ErrorBoundary internally as default (#589) [#589](https://github.com/remoteoss/remote-flows/pull/589)

## 0.31.0

### Minor Changes

- Add termination success example (#573) [#573](https://github.com/remoteoss/remote-flows/pull/573)
- standardize onChange callback to accept File[] array (#574) [#574](https://github.com/remoteoss/remote-flows/pull/574)
- move termination-specific utilities to dedicated module and clamp negative values (#577) [#577](https://github.com/remoteoss/remote-flows/pull/577)
- expose fieldValues and isDirty state from useTermination hook (#576) [#576](https://github.com/remoteoss/remote-flows/pull/576)
- add provisional start date validation and payroll calendar support (#578) [#578](https://github.com/remoteoss/remote-flows/pull/578)
- add feedback message statements for termination flow (#579) [#579](https://github.com/remoteoss/remote-flows/pull/579)
- simplify contract details schema version logic (#580) [#580](https://github.com/remoteoss/remote-flows/pull/580)

## 0.30.0

### Minor Changes

- feat(contractor-management): add plan selection (#553)(https://github.com/remoteoss/remote-flows/pull/553)
- add maxDate support to DatePickerField component (#568) [#568](https://github.com/remoteoss/remote-flows/pull/568)
- fix files value (#569) [#569](https://github.com/remoteoss/remote-flows/pull/569)

## 0.29.0

### Minor Changes

- add JSDoc comments to component props (#558) [#558](https://github.com/remoteoss/remote-flows/pull/558)
- improve type safety and remove requesterName prop (#560) [#560](https://github.com/remoteoss/remote-flows/pull/560)
- Override json_schema_version for DEU contract details (#564) [#564](https://github.com/remoteoss/remote-flows/pull/564)
- fix failed termination tests (#566) [#566](https://github.com/remoteoss/remote-flows/pull/566)
- improve UX copy and date formatting (#565) [#565](https://github.com/remoteoss/remote-flows/pull/565)

## 0.28.2

### Fixes

- fix updateEmployment mutation, passing incorrect param [0.28.2](https://github.com/remoteoss/remote-flows/releases/tag/v0.28.2)

## 0.28.1

### Fixes

- deep clone initialValues object to prevent mutations (#633) [#633](https://github.com/remoteoss/remote-flows/pull/633)

## 0.28.0

### Minor Changes

- expand accepted file types and add file size validation (#557) [#557](https://github.com/remoteoss/remote-flows/pull/557)
- prevent runtime exceptions (#561) [#561](https://github.com/remoteoss/remote-flows/pull/561)

## 0.27.0

### Minor Changes

- add acknowledge information step to termination flow (#554) [#554](https://github.com/remoteoss/remote-flows/pull/554)
- add external link mode to ZendeskTriggerButton (#555) [#555](https://github.com/remoteoss/remote-flows/pull/555)

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
