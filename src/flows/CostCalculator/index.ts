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
 * @deprecated Relies on the flow's internal form state and will be removed in v2.
 * Use the `costCalculatorBag` passed to the `render` prop instead, and open an issue if it's missing something you need.
 */
export const useCostCalculatorContext = useCostCalculatorContextInternal;
