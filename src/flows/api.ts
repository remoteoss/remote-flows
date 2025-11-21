import { postCreateOffboarding } from '@/src/client/sdk.gen';
import { CreateOffboardingParams } from '@/src/client/types.gen';
import { useClient } from '@/src/context';
import { TerminationFormValues } from '@/src/flows/Termination/types';
import { JSFModify } from '@/src/flows/types';
import { Client } from '@/src/client';
import { modify } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { defaultSchema } from '@/src/flows/Termination/json-schemas/defaultSchema';
import { schema } from '@/src/flows/Termination/json-schemas/schema';

export const useCreateTermination = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateOffboardingParams) => {
      return postCreateOffboarding({
        client: client as Client,
        body: payload,
      });
    },
  });
};

export const useTerminationSchema = ({
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
      let jsfSchema = data?.schema || {};
      if (jsfModify) {
        const { schema } = modify(jsfSchema, jsfModify);
        jsfSchema = schema;
      }
      const form = createHeadlessForm(jsfSchema || {}, {
        initialValues: formValues || {},
      });
      return form;
    },
  });
};
