import type { EmploymentTermType } from '@/src/client';
import { modify } from '@remoteoss/json-schema-form';

export type CostCalculatorEstimationFormValues = {
  currency: string;
  country: string;
  salary: string;
} & Partial<{
  region: string;
  age: number;
  contract_duration_type: EmploymentTermType;
  benefits: Record<string, string>;
}>;

export type CostCalculatorEstimationOptions = Partial<{
  /**
   * Title of the estimation. Default is 'Estimation'.
   */
  title: string;
  /**
   * Include benefits in the estimation. Default is false.
   */
  includeBenefits: boolean;
  /**
   * Include cost breakdowns in the estimation. Default is false.
   */
  includeCostBreakdowns: boolean;
  /**
   * Include premium benefits in the estimation. Default is false.
   */
  includePremiumBenefits: boolean;
}>;

export type JSFModify = Parameters<typeof modify>[1];
