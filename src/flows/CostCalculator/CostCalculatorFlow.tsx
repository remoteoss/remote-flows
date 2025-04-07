import { useValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { CostCalculatorContext } from '@/src/flows/CostCalculator/context';
import {
  defaultEstimationOptions,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import { CostCalculatorEstimationOptions } from '@/src/flows/CostCalculator/types';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';

function CostCalculatorFlowProvider({
  costCalculatorBag,
  defaultValues,
  render,
}: PropsWithChildren<{
  costCalculatorBag: ReturnType<typeof useCostCalculator>;
  defaultValues: Partial<{
    countryRegionSlug: string;
    currencySlug: string;
    salary: string;
  }>;
  render: (
    costCalculatorBag: ReturnType<typeof useCostCalculator>,
  ) => React.ReactNode;
}>) {
  const formId = useId();
  const resolver = useValidationFormResolver(
    costCalculatorBag.validationSchema,
  );

  const form = useForm({
    resolver,
    defaultValues: {
      country: defaultValues?.countryRegionSlug,
      currency: defaultValues?.currencySlug,
      region: '',
      salary: defaultValues?.salary,
    },
    shouldUnregister: true,
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
}

export type CostCalculatorFlowProps = {
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationOptions?: CostCalculatorEstimationOptions;
  /**
   * Default values for the form fields.
   */
  defaultValues: Partial<{
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
  render: (
    costCalculatorBag: ReturnType<typeof useCostCalculator>,
  ) => React.ReactNode;
};

export const CostCalculatorFlow = ({
  estimationOptions = defaultEstimationOptions,
  defaultValues = {
    countryRegionSlug: '',
    currencySlug: '',
    salary: '',
  },
  render,
}: CostCalculatorFlowProps) => {
  const costCalculatorBag = useCostCalculator({
    defaultRegion: defaultValues.countryRegionSlug,
    estimationOptions,
  });

  if (costCalculatorBag.isLoading) {
    return render(costCalculatorBag);
  }

  return (
    <CostCalculatorFlowProvider
      costCalculatorBag={costCalculatorBag}
      defaultValues={defaultValues}
      render={render}
    />
  );
};
