/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Button } from '@/src/components/ui/button';
import { Form } from '@/src/components/ui/form';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useContractAmendment } from './hooks';
import { ContractAmendmentParams } from './types';

type ContractAmendmentProps = ContractAmendmentParams & {
  onSubmit?: (values: any) => Promise<void>;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
};

// const validationResolver = (handleValidation: any) => async (data: any) => {
//   return {
//     values: {},
//     errors: {
//       work_schedule: {
//         type: 'validation',
//         message: 'shit',
//       },
//     },
//   };
// };

function ContractAmendmentForm({
  initialValues,
  fields,
  checkFieldUpdates,
}: any) {
  const firstRender = useRef(true);
  const resolver = function (values: any) {
    // checkFieldUpdates(values);
    console.log(values);
    return {
      values: {},
      errors: {},
    };
  };

  const form = useForm({
    resolver,
    defaultValues: initialValues,
    shouldUnregister: true,
    mode: 'onChange',
  });

  const { watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      if (firstRender.current) {
        console.log(' FIRT RENDER ');
        firstRender.current = false;
        return;
      }
      //
      checkFieldUpdates(value);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('fields', fields);

  const handleSubmit = async (values: any) => {
    console.log('values', values);
    // const contractAmendmentResult = await submitContractAmendment(values);
    // console.log(contractAmendmentResult);
    // await onSubmit?.(values);
    // if (estimation.error) {
    //   onError?.(estimation.error);
    // } else {
    //   onSuccess?.(estimation.data);
    // }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 RemoteFlows__CostCalculatorForm"
      >
        <JSONSchemaFormFields fields={fields} />
        <Button
          type="submit"
          className="RemoteFlows__CostCalculatorForm__SubmitButton"
          // disabled={isSubmitting}
        >
          Create
        </Button>
      </form>
    </Form>
  );
}

export function ContractAmendmentFlow({
  employmentId,
  countryCode,
}: ContractAmendmentProps) {
  const { fields, initialValues, isLoading, checkFieldUpdates } =
    useContractAmendment({ employmentId, countryCode });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ContractAmendmentForm
      fields={fields}
      initialValues={initialValues}
      checkFieldUpdates={checkFieldUpdates}
    />
  );
}
