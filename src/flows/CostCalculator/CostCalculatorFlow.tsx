import { CostCalculatorContext } from '@/src/flows/CostCalculator/context';
import { CostCalculatorEstimationOptions } from '@/src/flows/CostCalculator/types';
import React, { PropsWithChildren, useId } from 'react';
import { useForm } from 'react-hook-form';

function CostCalculatorFlowProvider({
  estimationOptions,
  defaultValues,
  render,
}: PropsWithChildren<{
  estimationOptions: CostCalculatorEstimationOptions;
  defaultValues: Partial<{
    countryRegionSlug: string;
    currencySlug: string;
    salary: string;
  }>;
  render: () => React.ReactNode;
}>) {
  const formId = useId();

  const form = useForm({
    //resolver,
    defaultValues, // Set default values for the form
    shouldUnregister: true,
    mode: 'onBlur',
  });

  return (
    <CostCalculatorContext.Provider
      value={{
        form,
        formId: formId,
        estimationOptions,
        defaultValues,
      }}
    >
      {render()}
    </CostCalculatorContext.Provider>
  );
}

type CostCalculatorFlowProps = {
  /**
   * Estimation params allows you to customize the parameters sent to the /cost-calculator/estimation endpoint.
   */
  estimationOptions: CostCalculatorEstimationOptions;
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
  render: () => React.ReactNode;
};

export const CostCalculatorFlow = ({
  estimationOptions,
  defaultValues,
  render,
}: CostCalculatorFlowProps) => {
  return (
    <CostCalculatorFlowProvider
      estimationOptions={estimationOptions}
      defaultValues={defaultValues}
      render={render}
    />
  );
};
