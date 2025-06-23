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
} from '@/src/flows/CostCalculator';

export * from '@/src/flows/ContractAmendment';
export * from '@/src/flows/Termination';
export * from '@/src/flows/Onboarding';

export type * from '@/src/flows/CostCalculator/types';
export * from '@/src/common/api';

export { transformYupErrorsIntoObject } from '@/src/lib/utils';

export { RemoteFlows } from '@/src/RemoteFlowsProvider';
export type {
  Components,
  FieldComponentProps,
  ButtonComponentProps,
  StatementComponentProps,
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
