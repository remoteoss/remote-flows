/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateContractAmendmentParams,
  getShowContractAmendmentSchema,
  getShowEmployment,
  postCreateContractAmendment,
} from '@/src/client';

import { mutationToPromise } from '@/src/lib/mutations';
import { useClient } from '@/src/RemoteFlowsProvider';
import { Client } from '@hey-api/client-fetch';
import { createHeadlessForm } from '@remoteoss/json-schema-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ContractAmendmentParams } from './types';

type UseEmployment = Pick<ContractAmendmentParams, 'employmentId'>;

function buildInitialValues(employment: any) {
  return {
    effective_date: '',
    job_title: employment?.data?.data.employment?.job_title,
    additional_comments: '',
    ...employment?.data?.data.employment?.contract_details,
  };
}

const useEmployment = ({ employmentId }: UseEmployment) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment'],
    queryFn: () => {
      return getShowEmployment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        path: { employment_id: employmentId },
      });
    },
  });
};

const useContractAmendmentSchema = ({
  countryCode,
  employment,
}: {
  countryCode: string;
  employment: any;
}) => {
  const { client } = useClient();

  return useQuery({
    queryKey: ['contract-amendment-schema'],
    queryFn: () => {
      return getShowContractAmendmentSchema({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        query: {
          employment_id: employment?.data?.data.employment?.id,
          country_code: countryCode,
        },
      });
    },
    enabled: Boolean(employment),
  });
};

const useCreateContractAmendment = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (payload: CreateContractAmendmentParams) => {
      return postCreateContractAmendment({
        client: client as Client,
        headers: {
          Authorization: ``,
        },
        body: payload,
      });
    },
  });
};

export const useContractAmendment = ({
  employmentId,
  countryCode,
}: ContractAmendmentParams) => {
  const [formFields, setFormFields] = useState<any>([]);
  const { data: employment } = useEmployment({
    employmentId,
  });

  const {
    data: jsonSchemaContractAmendmentData,
    isLoading: isLoadingContractAmendments,
  } = useContractAmendmentSchema({
    employment,
    countryCode,
  });

  const createContractAmendment = useCreateContractAmendment();
  const { mutateAsync } = mutationToPromise(createContractAmendment);

  useEffect(() => {
    if (jsonSchemaContractAmendmentData) {
      console.log('#########################');
      const { fields } = createHeadlessForm(
        jsonSchemaContractAmendmentData.data?.data || {},
        buildInitialValues(employment),
      );
      setFormFields(fields);
    }
  }, [jsonSchemaContractAmendmentData]);

  async function onSubmit(values: CreateContractAmendmentParams) {
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
    fields: formFields,
    isLoading: isLoadingContractAmendments,
    isSubmitting: createContractAmendment.isPending,
    initialValues: buildInitialValues(employment),
    // handleValidation: jsonSchemaResult?.handleValidation,
    checkFieldUpdates: function (values: any) {
      if (jsonSchemaContractAmendmentData) {
        console.log('UPDATE', values);
        const { fields } = createHeadlessForm(
          jsonSchemaContractAmendmentData.data?.data || {},
          { initialValues: values },
        );

        setFormFields(fields);
      }
    },
    onSubmit,
  };
};
