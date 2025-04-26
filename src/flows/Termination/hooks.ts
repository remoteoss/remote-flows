import { CreateOffboardingParams, postCreateOffboarding } from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { useClient } from '@/src/context';
import omit from 'lodash/omit';
import { parseFormRadioValues } from '@/src/flows/utils';
import { useStepState } from '@/src/flows/useStepState';
import { STEPS } from '@/src/flows/Termination/utils';
import { defaultSchema } from '@/src/flows/Termination/json-schemas/defaultSchema';
import { schema } from '@/src/flows/Termination/json-schemas/schema';
import pickBy from 'lodash/pickBy';
import { jsonSchema } from '@/src/flows/Termination/jsonSchema';

const useCreateTermination = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateOffboardingParams) => {
      return postCreateOffboarding({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};

const useTerminationSchema = ({
  formValues,
  jsfModify,
  step,
}: {
  formValues?: TerminationFormValues;
  jsfModify?: JSFModify;
  step?: string;
}) => {
  return useQuery({
    queryKey: ['rmt-flows-termination-schema', step],
    queryFn: () => {
      return schema[step as keyof typeof schema] ?? defaultSchema;
    },
    select: ({ data }) => {
      const { schema } = modify(data.schema, jsfModify || {});
      const form = createHeadlessForm(schema || {}, {
        initialValues: formValues || {},
      });
      return form;
    },
  });
};

type TerminationHookProps = {
  employmentId: string;
  options?: {
    jsfModify?: JSFModify;
  };
};

export const useTermination = ({
  employmentId,
  options,
}: TerminationHookProps) => {
  const { fieldValues, setFieldValues, stepState, previousStep, nextStep } =
    useStepState<keyof typeof STEPS, TerminationFormValues>(STEPS);

  const { data: terminationHeadlessForm, isLoading: isLoadingTermination } =
    useTerminationSchema({
      formValues: fieldValues,
      jsfModify: options?.jsfModify,
      step: stepState.currentStep.name,
    });

  const createTermination = useCreateTermination();
  const { mutateAsync } = mutationToPromise(createTermination);

  async function onSubmit() {
    if (!employmentId) {
      throw new Error('Employment id is missing');
    }

    if (stepState.currentStep.index < stepState.totalSteps - 1) {
      nextStep();
      return;
    }

    const allFormValues = {
      ...pickBy(stepState.values?.employee_communication),
      ...pickBy(stepState.values?.termination_details),
      ...pickBy(stepState.values?.paid_time_off),
      ...pickBy(fieldValues),
    };

    if (terminationHeadlessForm) {
      // this is a hack because I need to validate all form values with the entire schema
      const entireTerminationSchema = createHeadlessForm(
        jsonSchema.data.schema,
      );
      const parsedValues = parseJSFToValidate(
        allFormValues,
        entireTerminationSchema.fields,
      );

      const { customer_informed_employee: customerInformedEmployee } =
        parsedValues;

      const employeeAwareness =
        customerInformedEmployee === 'yes'
          ? {
              employee_awareness: {
                date: parsedValues.customer_informed_employee_date,
                note: parsedValues.customer_informed_employee_description,
              },
            }
          : undefined;

      const radioFieldKeys = [
        'agrees_to_pto_amount',
        'confidential',
        'customer_informed_employee',
        'will_challenge_termination',
      ];

      const parsedRadioValues = parseFormRadioValues(
        parsedValues,
        radioFieldKeys,
      );

      const normalizedValues = omit(
        parsedRadioValues,
        'customer_informed_employee_date',
        'customer_informed_employee_description',
      );

      const terminationPayload: CreateOffboardingParams = {
        employment_id: employmentId,
        termination_details: {
          ...normalizedValues,
          ...employeeAwareness,
        } as TerminationFormValues,
        type: 'termination',
      };

      return mutateAsync(terminationPayload);
    }

    return;
  }

  function back() {
    previousStep();
  }

  const initialValues =
    stepState.values && stepState.currentStep.name in stepState.values
      ? stepState.values[
          stepState.currentStep.name as keyof typeof stepState.values
        ]
      : {};

  return {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId,
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,
    /**
     * Array of form fields from the contract amendment schema
     */
    fields: terminationHeadlessForm?.fields || [],
    /**
     * Loading state indicating if the termination schema is being fetched
     */
    isLoading: isLoadingTermination,
    /**
     * Loading state indicating if a contract amendment mutation is in progress
     */
    isSubmitting: createTermination.isPending,
    /**
     * Initial form values
     */
    initialValues: initialValues,
    /**
     * Function to validate form values against the contract amendment schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: TerminationFormValues) => {
      if (terminationHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          terminationHeadlessForm?.fields,
        );
        return terminationHeadlessForm?.handleValidation(parsedValues);
      }
      return null;
    },
    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: (values: Partial<TerminationFormValues>) => {
      if (terminationHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          terminationHeadlessForm?.fields,
        );
        setFieldValues(parsedValues as TerminationFormValues);
      }
    },
    /**
     * Function to handle form submission
     * @param values - Form values to submit
     * @returns Promise resolving to the mutation result
     */
    onSubmit,

    /**
     * Function to handle going back to the previous step
     * @returns {void}
     */
    back,
  };
};
