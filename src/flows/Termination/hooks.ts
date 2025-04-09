import { CreateOffboardingParams, postCreateOffboarding } from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm, modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jsonSchema } from './jsonSchema';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { useState } from 'react';
import { JSFModify } from '@/src/flows/CostCalculator/types';

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
  formValues: any;
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
  options?: {
    jsfModify?: JSFModify;
  };
};

export const useTermination = ({ options }: TerminationHookProps) => {
  const [formValues, setFormValues] = useState<any>();

  const { data: terminationHeadlessForm, isLoading: isLoadingTermination } =
    useTerminationSchema({ formValues, jsfModify: options?.jsfModify });

  const createTermination = useCreateTermination();
  const { mutateAsync } = mutationToPromise(createTermination);

  async function onSubmit(values: any) {
    // const validation =
    //   jsonSchemaContractAmendmentFields?.handleValidation(values);
    // if (validation?.formErrors && Object.keys(validation?.formErrors)) {
    //   return {
    //     data: null,
    //     error: validation.formErrors,
    //   };
    // }

    return mutateAsync(values);
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
    handleValidation: (values: any) => {
      // TBD
    },
    checkFieldUpdates: (values: any) => {
      if (terminationHeadlessForm) {
        const parsedValues = parseJSFToValidate(
          values,
          terminationHeadlessForm?.fields,
          {
            isPartialValidation: false,
          },
        );
        setFormValues(parsedValues);
      }
    },
    onSubmit,
  };
};
