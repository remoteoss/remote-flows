import type { CostCalculatorFlowProps } from '@remoteoss/remote-flows';

/**
 * Options shared by every cost calculator demo, so feature flags only have to be
 * flipped in one place. Spread it when a demo needs its own jsfModify/callbacks.
 */
export const COST_CALCULATOR_OPTIONS: NonNullable<
  CostCalculatorFlowProps['options']
> = {
  features: ['split_salary_description'],
};
