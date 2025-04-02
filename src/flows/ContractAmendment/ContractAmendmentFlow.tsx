/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { Button } from '@/src/components/ui/button';
import { Form } from '@/src/components/ui/form';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useContractAmendment } from './hooks';
import { ContractAmendmentParams } from './types';

type ContractAmendmentProps = ContractAmendmentParams & {
  onSubmit?: (values: any) => Promise<void>;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
};

const validationResolver = (handleValidation: any) => async (data: any) => {
  return {
    values: {},
    errors: {
      work_schedule: {
        type: 'validation',
        message: 'shit',
      },
    },
  };
};

export function ContractAmendmentFlow({
  employmentId,
  countryCode,
}: ContractAmendmentProps) {
  const {
    fields,
    initialValues,
    isSubmitting,
    isLoading,
    checkFieldUpdates,
    onSubmit: submitContractAmendment,
  } = useContractAmendment({ employmentId, countryCode });

  const resolver = function (values: any) {
    checkFieldUpdates(values);
    return {
      values: {},
      errors: {},
    };
  };

  const form = useForm({
    resolver,
    defaultValues: useMemo(() => {
      return initialValues;
    }, [initialValues]),
    shouldUnregister: true,
    mode: 'onChange',
  });

  // useEffect(() => {
  //   const subscription = form.watch((value) => {
  //     // console.log(form.formState.isDirty);
  //     // if (form.formState.isDirty) {
  //     checkFieldUpdates(value);
  //     // }
  //   });
  //   return () => subscription.unsubscribe();
  // }, [checkFieldUpdates]);

  console.log('fields', fields);

  useEffect(() => {
    form.reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleSubmit = async (values: any) => {
    const contractAmendmentResult = await submitContractAmendment(values);
    console.log(contractAmendmentResult);

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
          disabled={isSubmitting}
        >
          Create
        </Button>
      </form>
    </Form>
  );
}
