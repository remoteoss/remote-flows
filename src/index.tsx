/* eslint-disable react-refresh/only-export-components */
// TODO: we can remove this import in the next major version, we can import styles with import '@remoteoss/remote-flows/styles.css'
import './styles/global.css';

export {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResetButton,
  CostCalculatorSubmitButton,
  useCostCalculator,
  useCostCalculatorEstimationPdf,
  useCostCalculatorEstimationCsv,
  EstimationResults,
  SummaryResults,
} from '@/src/flows/CostCalculator';

export type { CostCalculatorFlowProps } from '@/src/flows/CostCalculator';

export {
  ContractAmendmentConfirmationForm,
  ContractAmendmentFlow,
  ContractAmendmentForm,
  ContractAmendmentSubmit,
  useContractAmendment,
} from '@/src/flows/ContractAmendment';

export type { ContractAmendmentRenderProps } from '@/src/flows/ContractAmendment';

export {
  TerminationFlow,
  TerminationReasonsDetailContent,
  TerminationDialogInfoContent,
} from '@/src/flows/Termination';

export type {
  TerminationFormValues,
  TerminationFlowProps,
  TerminationRenderProps,
  EmployeeCommunicationFormValues,
  TerminationDetailsFormValues,
  PaidTimeOffFormValues,
  AdditionalDetailsFormValues,
  PaidTimeOffProps,
  AcknowledgeInformationFeesProps,
  AcknowledgeInformationProps,
} from '@/src/flows/Termination';

export { OnboardingFlow } from '@/src/flows/Onboarding';

export type {
  OnboardingInviteProps,
  BenefitsFormPayload,
  BasicInformationFormPayload,
  ContractDetailsFormPayload,
  SelectCountryFormPayload,
  SelectCountrySuccess,
  CreditRiskStatus,
  Employment,
  CreditRiskState,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding';

export {
  ContractorOnboardingFlow,
  contractorPlusProductIdentifier,
  contractorStandardProductIdentifier,
  corProductIdentifier,
  onboardingWorkflows,
  pricingPlanDetails,
} from '@/src/flows/ContractorOnboarding';

export type {
  ContractorOnboardingFlowProps,
  ContractorOnboardingRenderProps,
  PricingPlanFormPayload,
  PricingPlanResponse,
  ContractorOnboardingContractDetailsFormPayload,
  ContractorOnboardingContractDetailsResponse,
  ContractPreviewFormPayload,
  ContractPreviewResponse,
  EligibilityQuestionnaireFormPayload,
  EligibilityQuestionnaireResponse,
} from '@/src/flows/ContractorOnboarding';

export type { ContractPreviewStatementProps } from '@/src/flows/ContractorOnboarding/components/ContractPreviewStatement';

export { CreateCompanyFlow } from '@/src/flows/CreateCompany';
export type {
  CreateCompanyFlowProps,
  CreateCompanyRenderProps,
  CompanyBasicInfoSuccess,
  CompanyAddressDetailsSuccess,
} from '@/src/flows/CreateCompany';

export type * from '@/src/flows/CostCalculator/types';

export { useMagicLink } from '@/src/common/api';
export { useEmploymentQuery } from '@/src/common/api/employment';

export {
  useTimeOffQuery,
  usePaidTimeoffBreakdownQuery,
  useTimeOffLeavePoliciesSummaryQuery,
} from '@/src/common/api/timeoff';

export { transformYupErrorsIntoObject } from '@/src/lib/utils';

export { RemoteFlows } from '@/src/RemoteFlowsProvider';

export { convertFromCents } from '@/src/components/form/utils';

export type {
  Components,
  RemoteFlowsSDKProps,
  FieldSetToggleComponentProps,
  ButtonComponentProps,
  ZendeskDrawerComponentProps,
  DrawerComponentProps,
  PDFPreviewComponentProps,
  Meta,
} from '@/src/types/remoteFlows';

export type {
  FieldComponentProps,
  FileComponentProps,
  CountryComponentProps,
  StatementComponentProps,
  TextFieldComponentProps,
  DatePickerComponentProps,
  WorkScheduleComponentProps,
  PricingPlanComponentProps,
  PricingPlanDataProps,
} from '@/src/types/fields';

export type {
  ContractAmendmentAutomatableResponse,
  CostCalculatorEstimateResponse,
  OffboardingResponse,
  SuccessResponse,
  EmploymentCreationResponse,
  EmploymentResponse,
  CostCalculatorEmployment,
  Currency,
  Company,
} from './client/types.gen';

export type { $TSFixMe, JSFCustomComponentProps } from './types/remoteFlows';
export type { FieldError, NormalizedFieldError } from './lib/mutations';
export { zendeskArticles } from './components/shared/zendesk-drawer/utils';
export { ZendeskTriggerButton } from './components/shared/zendesk-drawer/ZendeskTriggerButton';
