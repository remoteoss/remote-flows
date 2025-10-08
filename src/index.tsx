/* eslint-disable react-refresh/only-export-components */
import './styles/global.css';

export {
  buildCostCalculatorEstimationPayload,
  CostCalculatorFlow,
  CostCalculatorForm,
  CostCalculatorResetButton,
  CostCalculatorSubmitButton,
  CostCalculatorDisclaimer,
  CostCalculatorResults,
  useCostCalculator,
  disclaimerData,
  useCostCalculatorEstimationPdf,
  useCostCalculatorEstimationCsv,
  EstimationResults,
  SummaryResults,
} from '@/src/flows/CostCalculator';

export type { CostCalculatorFlowProps } from '@/src/flows/CostCalculator';

export * from '@/src/flows/ContractAmendment';
export * from '@/src/flows/Termination';
export * from '@/src/flows/Onboarding';
export * from '@/src/flows/ContractorOnboarding';

export type * from '@/src/flows/CostCalculator/types';
export * from '@/src/common/api';

export { transformYupErrorsIntoObject } from '@/src/lib/utils';

export { RemoteFlows } from '@/src/RemoteFlowsProvider';

export { convertFromCents } from '@/src/components/form/utils';

export type {
  Components,
  RemoteFlowsSDKProps,
  FieldComponentProps,
  FieldSetToggleComponentProps,
  ButtonComponentProps,
  StatementComponentProps,
  ZendeskDrawerComponentProps,
  Meta,
} from '@/src/types/remoteFlows';

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

export type { $TSFixMe } from './types/remoteFlows';
export type { FieldError, NormalizedFieldError } from './lib/mutations';
export { zendeskArticles } from './components/shared/zendesk-drawer/utils';
