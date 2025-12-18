import { $TSFixMe } from '@/src/types/remoteFlows';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import omitBy from 'lodash.omitby';
import isNull from 'lodash.isnull';
import { format, isFuture, parseISO, subDays } from 'date-fns';
import { useMemo } from 'react';
import {
  CreateOffboardingParams,
  TerminationDetailsParams,
} from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { parseJSFToValidate } from '@/src/components/form/utils';
import {
  EmployeeCommunicationFormValues,
  PaidTimeOffFormValues,
  TerminationDetailsFormValues,
  TerminationFlowProps,
  TerminationFormValues,
} from '@/src/flows/Termination/types';
import omit from 'lodash.omit';
import { parseFormRadioValues } from '@/src/flows/utils';
import { useStepState } from '@/src/flows/useStepState';
import {
  buildInitialValues,
  calculateMinTerminationDate,
  calculateProposedTerminationDateStatement,
  STEPS,
} from '@/src/flows/Termination/utils';
import { jsonSchema } from '@/src/flows/Termination/json-schemas/jsonSchema';
import { terminationDetailsSchema } from '@/src/flows/Termination/json-schemas/terminationDetails';
import {
  useCreateTermination,
  useTerminationSchema,
} from '@/src/flows/Termination/api';
import { createInformationField } from '@/src/components/form/jsf-utils/createFields';
import { cn } from '@/src/internals';
import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { PaidTimeOff } from '@/src/flows/Termination/components/PaidTimeOff/PaidTimeOff';
import { PaidTimeOffContainer } from '@/src/flows/Termination/components/PaidTimeOff/PaidTimeOffContainer';
import { useEmploymentQuery } from '@/src/common/api';
import { AcknowledgeInformationContainer } from '@/src/flows/Termination/components/AcknowledgeInformation/AcknowledgeInfomationContainer';
import { AcknowledgeInformation } from '@/src/flows/Termination/components/AcknowledgeInformation/AcknowledgeInformation';
import { AcknowledgeInformationFees } from '@/src/flows/Termination/components/AcknowledgeInformation/AcknowledgeInformationFees';
import { usePayrollCalendars } from '@/src/common/api/payroll-calendars';
import { isInProbationPeriod } from '@/src/common/employment';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

type TerminationHookProps = Omit<TerminationFlowProps, 'render'>;

export const useTermination = ({
  employmentId,
  options,
  initialValues: terminationInitialValues,
}: TerminationHookProps) => {
  const { fieldValues, setFieldValues, stepState, previousStep, nextStep } =
    useStepState<keyof typeof STEPS, TerminationFormValues>(STEPS);

  const { data: employment, isLoading: isLoadingEmployment } =
    useEmploymentQuery({ employmentId });

  const { data: payrollCalendars } = usePayrollCalendars({
    query: {
      year: new Date().getFullYear().toString(),
      countryCode: employment?.country?.code,
    },
    options: {
      enabled: Boolean(employment?.country?.code),
    },
  });

  const isEmployeeInProbationPeriod = isInProbationPeriod(
    employment?.probation_period_end_date,
  );

  const minTerminationDate = calculateMinTerminationDate(payrollCalendars);
  const minDate = useMemo(
    () =>
      isEmployeeInProbationPeriod
        ? format(new Date(), 'yyyy-MM-dd')
        : format(minTerminationDate, 'yyyy-MM-dd'),
    [isEmployeeInProbationPeriod, minTerminationDate],
  );

  const hasFutureStartDate = Boolean(
    employment?.provisional_start_date &&
      isFuture(parseISO(employment.provisional_start_date)),
  );

  const employmentValues = {
    personal_email: employment?.basic_information?.email as string,
  } as Partial<TerminationFormValues>;

  const initialValues = buildInitialValues(
    {
      ...employmentValues,
      ...terminationInitialValues,
      ...stepState.values?.employee_communication,
      ...stepState.values?.termination_details,
      ...stepState.values?.paid_time_off,
      ...stepState.values?.additional_information,
    },
    hasFutureStartDate,
  );

  const formValues = useMemo(
    () => ({
      ...initialValues,
      ...fieldValues,
    }),
    [fieldValues, initialValues],
  );

  const proposedTerminationDateStatement =
    calculateProposedTerminationDateStatement({
      minTerminationDate,
      isEmployeeInProbationPeriod,
      selectedDate: parseISO(formValues.proposed_termination_date),
    });

  const customFields = useMemo(() => {
    const originalTerminationReasonOptions =
      terminationDetailsSchema.data.schema.properties.termination_reason.oneOf;

    const terminationReasonOptions = hasFutureStartDate
      ? originalTerminationReasonOptions.filter(
          (option: $TSFixMe) =>
            option.const === 'cancellation_before_start_date',
        )
      : originalTerminationReasonOptions.filter(
          (option: $TSFixMe) =>
            option.const !== 'cancellation_before_start_date',
        );

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
        termination_reason: {
          ...(options?.jsfModify?.fields?.termination_reason as $TSFixMe),
          oneOf: terminationReasonOptions,
        },
        proposed_termination_date_info: createInformationField(
          'Proposed termination date',
          <>
            In most cases, Remote must provide notice to the employee before
            termination. The required notice period depends on local labor laws,
            the employment agreement, and other factors. We'll use those factors
            to determine the required notice period.
            <ZendeskTriggerButton
              external
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
            minDate: minDate,
            ...(formValues.termination_reason ===
              'cancellation_before_start_date' &&
            employment?.provisional_start_date
              ? {
                  maxDate: format(
                    subDays(parseISO(employment.provisional_start_date), 1),
                    'yyyy-MM-dd',
                  ),
                }
              : {}),
            ...proposedTerminationDateStatement,
          },
          ...(formValues.termination_reason === 'cancellation_before_start_date'
            ? {
                'x-jsf-errorMessage': {
                  maximum:
                    "The proposed termination date must be before the employee's start date.",
                },
              }
            : {}),
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
                  employment={employment}
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
        acknowledge_termination_procedure_info: {
          ...(options?.jsfModify?.fields
            ?.acknowledge_termination_procedure_info as $TSFixMe),
          'x-jsf-presentation': {
            ...(
              options?.jsfModify?.fields
                ?.acknowledge_termination_procedure_info as $TSFixMe
            )?.['x-jsf-presentation'],
            Component: () => {
              const CustomComponent = (
                options?.jsfModify?.fields
                  ?.acknowledge_termination_procedure_info as $TSFixMe
              )?.['x-jsf-presentation']?.Component;

              return (
                <AcknowledgeInformationContainer
                  render={(props) => {
                    if (CustomComponent) {
                      return <CustomComponent {...props} />;
                    }
                    return <AcknowledgeInformation {...props} />;
                  }}
                />
              );
            },
          },
        },
        acknowledge_termination_procedure_fees_info: {
          ...(options?.jsfModify?.fields
            ?.acknowledge_termination_procedure_fees_info as $TSFixMe),
          'x-jsf-presentation': {
            ...(
              options?.jsfModify?.fields
                ?.acknowledge_termination_procedure_fees_info as $TSFixMe
            )?.['x-jsf-presentation'],
            Component: () => {
              const zendeskIds = {
                involuntaryOffboardingServiceChargeZendeskId:
                  zendeskArticles.involuntaryOffboardingServiceCharge,
                reconciliationInvoiceZendeskId:
                  zendeskArticles.reconciliationInvoice,
              };

              const CustomComponent = (
                options?.jsfModify?.fields
                  ?.acknowledge_termination_procedure_fees_info as $TSFixMe
              )?.['x-jsf-presentation']?.Component;

              if (CustomComponent) {
                return <CustomComponent {...zendeskIds} />;
              }

              return <AcknowledgeInformationFees {...zendeskIds} />;
            },
          },
        },
      },
    };
  }, [
    employment,
    employmentId,
    formValues.proposed_termination_date,
    formValues.termination_reason,
    hasFutureStartDate,
    minDate,
    options?.jsfModify?.fields?.acknowledge_termination_procedure_fees_info,
    options?.jsfModify?.fields?.acknowledge_termination_procedure_info,
    options?.jsfModify?.fields?.paid_time_off_info,
    options?.jsfModify?.fields?.proposed_termination_date,
    options?.jsfModify?.fields?.proposed_termination_date_info,
    options?.jsfModify?.fields?.risk_assesment_info,
    options?.jsfModify?.fields?.termination_reason,
    proposedTerminationDateStatement,
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
      const parsedValues = (await parseFormValues(
        values,
        true,
      )) as TerminationFormValues;

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

      const parsedRadioValues = await parseFormRadioValues(
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

      const files = (parsedValues.timesheet_file as $TSFixMe) ?? [];
      const timesheetFile =
        Array.isArray(files) && files.length > 0
          ? { content: files[0].content, name: files[0].name }
          : undefined;

      const terminationPayload: CreateOffboardingParams = {
        employment_id: employmentId,
        termination_details: {
          ...terminationDetails,
          timesheet_file: timesheetFile ? timesheetFile : undefined,
        },
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

  const isDirty = Boolean(Object.keys(fieldValues).length > 0);

  const parseFormValues = async (
    values: TerminationFormValues,
    includeAllFields: boolean = false,
  ): Promise<
    | EmployeeCommunicationFormValues
    | TerminationDetailsFormValues
    | PaidTimeOffFormValues
    | TerminationFormValues
  > => {
    if (includeAllFields) {
      return (await parseJSFToValidate(values, entireTerminationSchema.fields, {
        isPartialValidation: true,
      })) as TerminationFormValues;
    }

    if (terminationHeadlessForm) {
      return (await parseJSFToValidate(
        values,
        terminationHeadlessForm?.fields,
        {
          isPartialValidation: true,
        },
      )) as
        | EmployeeCommunicationFormValues
        | TerminationDetailsFormValues
        | PaidTimeOffFormValues;
    }
    return {} as $TSFixMe;
  };

  return {
    /**
     * Employment id passed useful to be used between components
     */
    employmentId,
    /**
     * Employment data
     */
    employment,

    /**
     * Current form field values, we use formValues to let the user know about all the current form values
     */
    fieldValues: formValues,

    /**
     * Indicates if the form is dirty
     */
    isDirty,
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
    isLoading: isLoadingTermination || isLoadingEmployment,
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
    handleValidation: async (values: TerminationFormValues) => {
      if (terminationHeadlessForm) {
        const parsedValues = await parseJSFToValidate(
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
    checkFieldUpdates: setFieldValues,
    /**
     * Function to parse form values before submission
     * @param values - Form values to parse
     * @returns Parsed form values
     */
    parseFormValues,
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
