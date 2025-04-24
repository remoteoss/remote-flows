import { CreateOffboardingParams, postCreateOffboarding } from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jsonSchema } from './jsonSchema';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { useClient } from '@/src/context';
import omit from 'lodash/omit';
import { parseFormRadioValues } from '@/src/flows/utils';
import { useStepState } from '@/src/flows/useStepState';
import { STEPS, StepTerminationKeys } from '@/src/flows/Termination/utils';
import pickBy from 'lodash/pickby';

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
}: {
  formValues?: TerminationFormValues;
  jsfModify?: JSFModify;
}) => {
  return useQuery({
    queryKey: ['rmt-flows-termination-schema'],
    queryFn: () => {
      return jsonSchema;
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
      const parsedValues = parseJSFToValidate(
        allFormValues,
        terminationHeadlessForm.fields,
        { isPartialValidation: true }, // TODO: for some reason with false, the conditional fields are skipped???
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

  const currentStep: StepTerminationKeys = stepState.currentStep
    .name as StepTerminationKeys;

  const fieldsByStep: Record<
    StepTerminationKeys,
    Record<string, unknown>[] | undefined
  > = {
    employee_communication: terminationHeadlessForm?.fields.filter((field) =>
      [
        'confidential',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
        'personal_email',
      ].includes(field.name as string),
    ),
    termination_details: terminationHeadlessForm?.fields.filter((field) =>
      [
        'termination_reason',
        'reason_description',
        'additional_comments',
        'termination_reason_files',
        'risk_assessment_reasons',
        'will_challenge_termination',
        'will_challenge_termination_description',
        'proposed_termination_date',
      ].includes(field.name as string),
    ),
    paid_time_off: terminationHeadlessForm?.fields.filter((field) =>
      [
        'agrees_to_pto_amount',
        'agrees_to_pto_amount_notes',
        'timesheet_file',
      ].includes(field.name as string),
    ),
    additional_information: terminationHeadlessForm?.fields.filter((field) =>
      ['acknowledge_termination_procedure'].includes(field.name as string),
    ),
  };

  const currentFields =
    fieldsByStep[currentStep] || terminationHeadlessForm?.fields;

  return {
    /**
     * Current step state containing the current step and total number of steps
     */
    stepState,
    /**
     * Array of form fields from the termination schema
     */
    fields: currentFields || [],
    /**
     * Loading state indicating if the termination schema is being fetched
     */
    isLoading: isLoadingTermination,
    /**
     * Loading state indicating if the termination mutation is in progress
     */
    isSubmitting: createTermination.isPending,
    /**
     * Initial form values
     */
    initialValues: {},
    /**
     * Current form field values
     */
    values: fieldValues,
    /**
     * Function to validate form values against the contract amendment schema
     * @param values - Form values to validate
     * @returns Validation result or null if no schema is available
     */
    handleValidation: (values: TerminationFormValues) => {
      if (terminationHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          terminationHeadlessForm.fields,
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
          { isPartialValidation: true }, // TODO: for some reason with false, the conditional fields are skipped???
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
    /**
     * Function to handle going to the next step
     * @returns {void}
     */
    nextStep,
  };
};
