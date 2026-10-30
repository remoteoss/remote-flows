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

// Partners already use this to watch, get and set values on the form, so we keep it exported to avoid breaking them.
// It's not ideal, but replacing it isn't worth the rework right now.
export const useCostCalculatorContext = useCostCalculatorContextInternal;
