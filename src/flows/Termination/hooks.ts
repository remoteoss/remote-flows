import { CreateOffboardingParams, postCreateOffboarding } from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jsonSchema } from './jsonSchema';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { useState } from 'react';
import { JSFModify } from '@/src/flows/CostCalculator/types';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { useClient } from '@/src/context';
import omit from 'lodash/omit';

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
        initialValues: formValues || {}, // formValues || buildInitialValues(employment),
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
  const [formValues, setFormValues] = useState<
    TerminationFormValues | undefined
  >(undefined);

  const { data: terminationHeadlessForm, isLoading: isLoadingTermination } =
    useTerminationSchema({ formValues, jsfModify: options?.jsfModify });

  const createTermination = useCreateTermination();
  const { mutateAsync } = mutationToPromise(createTermination);

  async function onSubmit(values: TerminationFormValues) {
    // const validation =
    //   jsonSchemaContractAmendmentFields?.handleValidation(values);
    // if (validation?.formErrors && Object.keys(validation?.formErrors)) {
    //   return {
    //     data: null,
    //     error: validation.formErrors,
    //   };
    // }

    if (!employmentId) {
      throw new Error('Employment id is missing');
    }

    if (terminationHeadlessForm) {
      const parsedValues = parseJSFToValidate(
        values,
        terminationHeadlessForm.fields,
      );

      const {
        customer_informed_employee: customerInformedEmployee,
        risk_assessment_reasons: riskAssessmentReasons,
      } = parsedValues;

      const employeeAwareness = customerInformedEmployee
        ? {
            employee_awareness: {
              date: parsedValues.customer_informed_employee_date,
              note: parsedValues.customer_informed_employee_description,
            },
          }
        : undefined;

      const normalizedValues = omit(
        parsedValues,
        'acknowledge_termination_procedure',
        'agrees_to_pto_amount',
        'agrees_to_pto_amount_notes',
        'customer_informed_employee',
        'customer_informed_employee_date',
        'customer_informed_employee_description',
      );

      const terminationPayload: CreateOffboardingParams = {
        employment_id: employmentId,
        termination_details: {
          ...normalizedValues,
          ...{ risk_assessment_reasons: [riskAssessmentReasons] },
          ...employeeAwareness,
        } as TerminationFormValues,
        type: 'termination',
      };

      return mutateAsync(terminationPayload);
    }

    return;
  }

  return {
    stepState: {
      current: 0,
      total: 1,
      isLastStep: true,
    },
    fields: terminationHeadlessForm?.fields || [],
    isLoading: isLoadingTermination,
    isSubmitting: createTermination.isPending,
    initialValues: {},
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
    checkFieldUpdates: (values: Partial<TerminationFormValues>) => {
      if (terminationHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          terminationHeadlessForm?.fields,
        );
        setFormValues(parsedValues as TerminationFormValues);
      }
    },
    onSubmit,
  };
};
