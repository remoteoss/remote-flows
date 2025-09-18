import type {
  CostCalculatorEmployment,
  EmploymentTermType,
  PostCreateEstimationError,
  ValidationError,
} from '@/src/client';
import { BASE_RATES } from '@/src/flows/CostCalculator/constants';
import { JSFModify } from '@/src/flows/types';

export type CostCalculatorEstimationSubmitValues = {
  currency: string;
  country: string;
  salary_converted: 'salary' | 'salary_conversion';
  salary: number;
} & Partial<{
  region: string;
  age: number;
  contract_duration_type: EmploymentTermType;
  benefits: Record<string, string>;
  management: {
    management_fee: string;
  };
  estimation_title: string;
}>;

export type CostCalculatorEstimationFormValues = {
  currency: string;
  country: string;
  salary: string;
  salary_converted: 'salary' | 'salary_conversion';
  salary_conversion: string;
} & Partial<{
  region: string;
  age: number;
  contract_duration_type: EmploymentTermType;
  benefits: Record<string, string>;
  management: {
    management_fee: string;
  };
  estimation_title: string;
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
  /**
   * Enable currency conversion. Default is false.
   */
  enableCurrencyConversion: boolean;
  /**
   * Include management fee in the estimation. Default is false.
   */
  includeManagementFee: boolean;
  /**
   * Include estimation title field in the estimation. Default is false.
   */
  includeEstimationTitle: boolean;
  /**
   * Management fees by currency. Default is null.
   */
  managementFees?: Partial<Record<CurrencyKey, number>>;
}>;

export type EstimationError = PostCreateEstimationError | ValidationError;

export type UseCostCalculatorOptions = {
  jsfModify?: JSFModify;
  onCurrencyChange?: (currency: string) => void;
};

export type CurrencyKey = keyof typeof BASE_RATES;

export type CostCalculatorEstimation = CostCalculatorEmployment & {
  title?: string;
};

export type CostCalculatorEstimationResponse = {
  data: {
    employments?: Array<CostCalculatorEstimation>;
  };
};
