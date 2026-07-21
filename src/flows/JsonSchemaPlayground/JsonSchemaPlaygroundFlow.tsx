import React, { useId } from 'react';
import { useForm } from 'react-hook-form';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
import { JsonSchemaPlaygroundContext } from './context';
import { useJsonSchemaPlayground } from './hooks';
import { JsonSchemaPlaygroundForm } from './JsonSchemaPlaygroundForm';
import { JsonSchemaPlaygroundSubmitButton } from './JsonSchemaPlaygroundSubmitButton';
import { JsonSchemaPlaygroundResetButton } from './JsonSchemaPlaygroundResetButton';
import { UseJsonSchemaPlaygroundOptions, JsonSchemaPlaygroundRenderProps } from './types';

export interface JsonSchemaPlaygroundFlowProps extends UseJsonSchemaPlaygroundOptions {
  render: (renderProps: JsonSchemaPlaygroundRenderProps) => React.ReactNode;
}

export const JsonSchemaPlaygroundFlow = ({
  defaultSchema,
  onSubmit,
  onError,
  render,
}: JsonSchemaPlaygroundFlowProps) => {
  const formId = useId();
  
  const playgroundBag = useJsonSchemaPlayground({
    defaultSchema,
    onSubmit,
    onError,
  });

  const resolver = useJsonSchemasValidationFormResolver(
    playgroundBag.handleValidation,
  );

  const form = useForm({
    resolver,
    defaultValues: {},
    shouldUnregister: false,
    mode: 'onBlur',
  });

  return (
    <JsonSchemaPlaygroundContext.Provider
      value={{
        form,
        formId,
        playgroundBag,
      }}
    >
      {render({
        playgroundBag,
        components: {
          Form: JsonSchemaPlaygroundForm,
          SubmitButton: JsonSchemaPlaygroundSubmitButton,
          ResetButton: JsonSchemaPlaygroundResetButton,
        },
      })}
    </JsonSchemaPlaygroundContext.Provider>
  );
};