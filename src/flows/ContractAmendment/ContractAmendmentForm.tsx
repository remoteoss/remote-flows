import {
  ContractAmendmentAutomatableResponse,
  PostAutomatableContractAmendmentError,
} from '@/src/client';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { Form } from '@/src/components/ui/form';
import { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useContractAmendmentContext } from './context';

type ContractAmendmentFormProps = {
  /**
   * Callback function to be called when the contract amendment form is submitted.
   * This function is called before the contract amendment is submitted.
   * It can be used to perform any additional validation or processing before
   * the contract amendment is submitted.
   * @param values
   * @returns
   */
  onSubmit?: (values: FieldValues) => void | Promise<void>;
  /**
   * Callback function to be called when the contract amendment fails.
   * @param error
   * @returns
   */
  onError?: (
    error:
      | PostAutomatableContractAmendmentError
      | { message: 'no_changes_detected_contract_details' },
  ) => void;
  /**
   * Callback function to be called when the contract amendment is successfully submitted.
   * This function is called after the contract amendment is submitted.
   * @param data
   * @returns
   */
  onSuccess?: (
    data: ContractAmendmentAutomatableResponse,
  ) => void | Promise<void>;
};

const commonFields = [
  'effective_date',
  'reason_for_change',
  'reason_for_change_description',
  'additional_comments',
  'additional_comments_toggle',
] as const;

type CommonFields = (typeof commonFields)[number];

export function ContractAmendmentForm({
  onSubmit,
  onError,
  onSuccess,
}: ContractAmendmentFormProps) {
  const {
    formId,
    contractAmendment: {
      checkFieldUpdates,
      fields,
      onSubmit: submitContractAmendment,
      stepState,
      initialValues,
      handleValidation,
    },
  } = useContractAmendmentContext();

  const resolver = useJsonSchemasValidationFormResolver(handleValidation);

  const form = useForm({
    resolver,
    defaultValues:
      // stepState.values is used as defaultValues for the form when the form is
      // rendered when clicking on the back button after the user has submitted the form
      // and the confirmation form is displayed.
      // This is because the form is unmounted when the user submits the form.
      stepState.values?.form || initialValues,
    shouldUnregister: true,
    mode: 'onBlur',
  });

  useEffect(() => {
    const subscription = form?.watch((values) => {
      const isFormDirty =
        Object.keys(form.formState.dirtyFields).length > 0 ||
        form.formState.isDirty;
      if (isFormDirty) {
        checkFieldUpdates(values);
      }
    });
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: FieldValues) => {
    let hasContractDetailsChanges = false;
    for (const [key, value] of Object.entries(values)) {
      if (
        !commonFields.includes(key as CommonFields) &&
        initialValues[key as keyof typeof initialValues] !== value
      ) {
        hasContractDetailsChanges = true;
        break;
      }
    }

    if (!hasContractDetailsChanges) {
      return onError?.({
        message: 'no_changes_detected_contract_details',
      });
    }

    const parsedValues = await parseJSFToValidate(values, fields, {
      isPartialValidation: false,
    });

    await onSubmit?.(parsedValues);

    const contractAmendmentResult = await submitContractAmendment(values);

    if (contractAmendmentResult.error) {
      onError?.(contractAmendmentResult.error);
    } else {
      await onSuccess?.(
        contractAmendmentResult.data as ContractAmendmentAutomatableResponse,
      );
    }
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        data-testid='contract-amendment-form'
        onSubmit={form.handleSubmit(handleSubmit)}
        className='space-y-4 RemoteFlows__ContractAmendmentForm'
      >
        <JSONSchemaFormFields fields={fields} />
      </form>
    </Form>
  );
}
