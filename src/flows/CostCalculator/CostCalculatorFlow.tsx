import { useJsonSchemasValidationFormResolver } from '@/src/components/form/yupValidationResolver';
import { CostCalculatorContext } from '@/src/flows/CostCalculator/context';
import {
  defaultEstimationOptions,
  useCostCalculator,
} from '@/src/flows/CostCalculator/hooks';
import {
  CostCalculatorEstimationOptions,
  JSFModify,
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
  options?: {
    jsfModify?: JSFModify;
  };
  render: (
    costCalculatorBag: ReturnType<typeof useCostCalculator>,
    onReset: () => void,
  ) => React.ReactNode;
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
}: CostCalculatorFlowProps) => {
  const formId = useId();
  const costCalculatorBag = useCostCalculator({
    defaultRegion: defaultValues.countryRegionSlug,
    estimationOptions,
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

  const onReset = () => {
    costCalculatorBag.resetForm();
    form.reset();
  };

  return (
    <CostCalculatorContext.Provider
      value={{
        form,
        formId: formId,
        costCalculatorBag,
      }}
    >
      {render(costCalculatorBag, onReset)}
    </CostCalculatorContext.Provider>
  );
};
