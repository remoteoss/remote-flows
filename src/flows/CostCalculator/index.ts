import { useCostCalculatorContext as useCostCalculatorContextInternal } from './context';

export { CostCalculatorFlow } from './CostCalculatorFlow';
export { CostCalculatorForm } from './CostCalculatorForm';
export { CostCalculatorSubmitButton } from './CostCalculatorSubmitButton';
export { CostCalculatorResetButton } from './CostCalculatorResetButton';
export { useCostCalculator } from './hooks';
export {
  useCostCalculatorEstimationPdf,
  useCostCalculatorEstimationCsv,
  useCostCalculatorCountries,
} from './api';
export { EstimationResults } from './EstimationResults/EstimationResults';
export { SummaryResults } from './SummaryResults/SummaryResults';
export { buildPayload as buildCostCalculatorEstimationPayload } from './utils';
export type { EstimationError } from './types';
export type { CostCalculatorFlowProps } from './CostCalculatorFlow';

/**
 * Partners are using this already, we should keep it for now as I don't want to break the functionality for them.
 * Currently they use it to watch, get/setValues from the form context.
 * Not ideal, but we don't want rework at the moment.
 */
export const useCostCalculatorContext = useCostCalculatorContextInternal;
