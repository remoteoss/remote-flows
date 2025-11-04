import { $TSFixMe, createHeadlessForm } from '@remoteoss/json-schema-form';
import omitBy from 'lodash.omitby';
import isNull from 'lodash.isnull';
import { format } from 'date-fns';
import { useMemo } from 'react';
import {
  CreateOffboardingParams,
  TerminationDetailsParams,
} from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  TerminationFlowProps,
  TerminationFormValues,
} from '@/src/flows/Termination/types';
import omit from 'lodash.omit';
import { parseFormRadioValues } from '@/src/flows/utils';
import { useStepState } from '@/src/flows/useStepState';
import { STEPS } from '@/src/flows/Termination/utils';
import { jsonSchema } from '@/src/flows/Termination/json-schemas/jsonSchema';
import { useCreateTermination, useTerminationSchema } from '@/src/flows/api';
import { createInformationField } from '@/src/components/form/jsf-utils/createFields';
import { cn, ZendeskTriggerButton } from '@/src/internals';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { PaidTimeOff } from '@/src/flows/Termination/components/PaidTimeOff/PaidTimeOff';
import { useEmployment } from '@/src/flows/Onboarding/api';
import { PaidTimeOffContainer } from '@/src/flows/Termination/components/PaidTimeOff/PaidTimeOffContainer';

function buildInitialValues(
  stepsInitialValues: Partial<TerminationFormValues>,
): TerminationFormValues {
  const initialValues: TerminationFormValues = {
    confidential: '',
    customer_informed_employee: '',
    customer_informed_employee_date: '',
    customer_informed_employee_description: '',
    personal_email: '',
    termination_reason: undefined,
    reason_description: '',
    termination_reason_files: [],
    will_challenge_termination: '',
    will_challenge_termination_description: null,
    agrees_to_pto_amount: '',
    agrees_to_pto_amount_notes: null,
    acknowledge_termination_procedure: false,
    additional_comments: '',
    proposed_termination_date: '',
    risk_assessment_reasons: [],
    timesheet_file: undefined,
    ...stepsInitialValues,
  };

  return initialValues;
}

type TerminationHookProps = Omit<TerminationFlowProps, 'render'>;

export const useTermination = ({
  employmentId,
  options,
  initialValues: terminationInitialValues,
}: TerminationHookProps) => {
  const { fieldValues, setFieldValues, stepState, previousStep, nextStep } =
    useStepState<keyof typeof STEPS, TerminationFormValues>(STEPS);

  const { data: employment } = useEmployment(employmentId);

  const initialValues = buildInitialValues({
    ...stepState.values?.employee_communication,
    ...stepState.values?.termination_details,
    ...stepState.values?.paid_time_off,
    ...stepState.values?.additional_information,
    ...terminationInitialValues,
  });

  const formValues = useMemo(
    () => ({
      ...stepState.values?.[stepState.currentStep.name as keyof typeof STEPS], // Restore values for the current step
      ...initialValues,
      ...fieldValues,
    }),
    [stepState.values, stepState.currentStep.name, fieldValues, initialValues],
  );

  const customFields = useMemo(() => {
    return {
      fields: {
        risk_assesment_info: createInformationField(
          'Offboarding risk assessment',
          'Employees may be protected from termination if they fall into certain categories. To help avoid claims from employees, let us know if the employee is part of one or more of these categories. Select all that apply.',
          {
            className: (
              options?.jsfModify?.fields?.risk_assesment_info as $TSFixMe
            )?.['x-jsf-presentation']?.className,
          },
        ),
        proposed_termination_date_info: createInformationField(
          'Proposed termination date',
          <>
            In most cases, we must provide notice to the employee before
            termination. The required notice period depends on local labor laws,
            the employment agreement, and other factors. We'll use those factors
            to determine the required notice period.
            <ZendeskTriggerButton
              zendeskId={zendeskArticles.terminationNoticePeriods}
              className={cn(
                'text-sm',
                (
                  options?.jsfModify?.fields
                    ?.proposed_termination_date_info as $TSFixMe
                )?.['x-jsf-presentation']?.zendeskTriggerButtonClassName,
              )}
            >
              Learn about notice periods
            </ZendeskTriggerButton>
          </>,
          {
            className: (
              options?.jsfModify?.fields
                ?.proposed_termination_date_info as $TSFixMe
            )?.['x-jsf-presentation']?.className,
          },
        ),
        proposed_termination_date: {
          ...(options?.jsfModify?.fields
            ?.proposed_termination_date as $TSFixMe),
          'x-jsf-presentation': {
            ...(
              options?.jsfModify?.fields?.proposed_termination_date as $TSFixMe
            )?.['x-jsf-presentation'],
            minDate: format(new Date(), 'yyyy-MM-dd'),
          },
        },
        paid_time_off_info: {
          ...(options?.jsfModify?.fields?.paid_time_off_info as $TSFixMe),
          'x-jsf-presentation': {
            ...(options?.jsfModify?.fields?.paid_time_off_info as $TSFixMe)?.[
              'x-jsf-presentation'
            ],
            Component: () => {
              const CustomComponent = (
                options?.jsfModify?.fields?.paid_time_off_info as $TSFixMe
              )?.['x-jsf-presentation']?.Component;

              return (
                <PaidTimeOffContainer
                  employeeName={employment?.basic_information?.name as string}
                  proposedTerminationDate={formValues.proposed_termination_date}
                  employmentId={employmentId}
                  render={(props) => {
                    if (CustomComponent) {
                      return <CustomComponent {...props} />;
                    }
                    return <PaidTimeOff {...props} />;
                  }}
                />
              );
            },
          },
        },
      },
    };
  }, [
    employment?.basic_information?.name,
    formValues.proposed_termination_date,
    options?.jsfModify?.fields?.paid_time_off_info,
    options?.jsfModify?.fields?.proposed_termination_date_info,
    options?.jsfModify?.fields?.risk_assesment_info,
    employmentId,
  ]);

  const { data: terminationHeadlessForm, isLoading: isLoadingTermination } =
    useTerminationSchema({
      formValues: formValues,
      jsfModify: {
        ...options?.jsfModify,
        fields: {
          ...options?.jsfModify?.fields,
          ...customFields?.fields,
        },
      },
      step: stepState.currentStep.name,
    });

  const entireTerminationSchema = createHeadlessForm(jsonSchema.data.schema);

  const createTermination = useCreateTermination();
  const { mutateAsync } = mutationToPromise(createTermination);

  async function onSubmit(values: TerminationFormValues) {
    if (!employmentId) {
      throw new Error('Employment id is missing');
    }

    if (terminationHeadlessForm) {
      // this is a hack because I need to validate all form values with the entire schema
      const parsedValues = parseJSFToValidate(
        values,
        entireTerminationSchema.fields,
        { isPartialValidation: true },
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

      const terminationDetails: TerminationDetailsParams = omitBy(
        {
          ...normalizedValues,
          ...employeeAwareness,
        },
        isNull,
      ) as unknown as TerminationDetailsParams;

      const terminationPayload: CreateOffboardingParams = {
        employment_id: employmentId,
        termination_details: terminationDetails,
        type: 'termination',
      };

      return mutateAsync(terminationPayload);
    }

    return;
  }

  function back() {
    previousStep();
  }

  function next() {
    nextStep();
  }

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
      if (entireTerminationSchema) {
        const parsedValues = parseJSFToValidate(
          values,
          entireTerminationSchema?.fields,
          { isPartialValidation: true },
        );
        setFieldValues(parsedValues as TerminationFormValues);
      }
    },
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues: (values: TerminationFormValues) => {
      return parseJSFToValidate(values, entireTerminationSchema.fields, {
        isPartialValidation: true,
      });
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
    next,
  };
};
