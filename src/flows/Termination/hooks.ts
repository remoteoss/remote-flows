import { CreateOffboardingParams, postCreateOffboarding } from '@/src/client';
import { mutationToPromise } from '@/src/lib/mutations';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jsonSchema } from './jsonSchema';

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

const useTerminationSchema = () => {
  return useQuery({
    queryKey: ['contract-amendment-schema'],
    queryFn: () => {
      return jsonSchema;
    },
    select: ({ data }) => {
      console.log('data', data);
      return createHeadlessForm(data?.schema || {}, {
        initialValues: {}, // formValues || buildInitialValues(employment),
      });
    },
  });
};

export const useTermination = () => {
  const { data: terminationHeadlessForm, isLoading: isLoadingTermination } =
    useTerminationSchema();

  console.log('terminationHeadlessForm', terminationHeadlessForm);

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
      // TDB
    },
    onSubmit,
  };
};
