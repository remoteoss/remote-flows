import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { CostCalculatorContext } from '@/src/flows/CostCalculator/context';
import {
  CostCalculatorVersion,
  defaultEstimationOptions,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorEstimationOptions,
  UseCostCalculatorOptions,
} from '@/src/flows/CostCalculator/types';
import React, { useId } from 'react';
import { useForm } from 'react-hook-form';

export type CostCalculatorFlowProps = {
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationOptions?: CostCalculatorEstimationOptions;
  /**
   * Default values for the form fields.
   */
  defaultValues?: Partial<{
    /**
     * Default value for the country field.
     */
    countryRegionSlug: string;
    /**
     * Default value for the currency field.
     */
    currencySlug: string;
    /**
     * Default value for the salary field.
     */
    salary: string;
  }>;
  options?: UseCostCalculatorOptions;
  render: (
    costCalculatorBag: ReturnType<typeof useCostCalculator>,
  ) => React.ReactNode;
  /**
   * Whether to include annual_gross_salary in the estimation payload
   */
  version?: CostCalculatorVersion;
};

export const CostCalculatorFlow = ({
  estimationOptions = defaultEstimationOptions,
  defaultValues = {
    countryRegionSlug: '',
    currencySlug: '',
    salary: '',
  },
  options,
  render,
  version = 'standard',
}: CostCalculatorFlowProps) => {
  const formId = useId();
  const costCalculatorBag = useCostCalculator({
    defaultRegion: defaultValues.countryRegionSlug,
    estimationOptions,
    version,
    options,
  });
  const resolver = useJsonSchemasValidationFormResolver(
    // @ts-expect-error no matching type
    costCalculatorBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
    },
    shouldUnregister: false,
    mode: 'onBlur',
  });

  return (
    <CostCalculatorContext.Provider
      value={{
        form,
        formId: formId,
        costCalculatorBag,
      }}
    >
      {render(costCalculatorBag)}
    </CostCalculatorContext.Provider>
  );
};
