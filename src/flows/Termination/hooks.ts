import { CreateOffboardingParams, postCreateOffboarding } from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jsonSchema } from './jsonSchema';
import { parseJSFToValidateFormik } from '@/src/components/form/utils';
import { useState } from 'react';

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

const useTerminationSchema = ({ formValues }: { formValues: any }) => {
  return useQuery({
    queryKey: ['termination-schema'],
    queryFn: () => {
      return jsonSchema;
    },
    select: ({ data }) => {
      const form = createHeadlessForm(data?.schema || {}, {
        initialValues: formValues || {}, // formValues || buildInitialValues(employment),
      });
      console.log('form', { form, formValues });
      return form;
    },
  });
};

export const useTermination = () => {
  const [formValues, setFormValues] = useState<any>();

  const { data: terminationHeadlessForm, isLoading: isLoadingTermination } =
    useTerminationSchema({ formValues });

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
      console.log({ values, terminationHeadlessForm });
      if (terminationHeadlessForm) {
        const parsedValues = parseJSFToValidateFormik(
          values,
          terminationHeadlessForm?.fields,
          {
            isPartialValidation: false,
          },
        );
        console.log('parsedValues', parsedValues);
        setFormValues(parsedValues);
      }
    },
    onSubmit,
  };
};
