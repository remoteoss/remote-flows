import React, { useId } from 'react';
import { JsonSchemaPlaygroundContext } from './context';
import { useJsonSchemaPlayground } from './hooks';
import { JsonSchemaPlaygroundForm } from './JsonSchemaPlaygroundForm';
import { JsonSchemaPlaygroundSubmitButton } from './JsonSchemaPlaygroundSubmitButton';
import { JsonSchemaPlaygroundResetButton } from './JsonSchemaPlaygroundResetButton';
import {
  UseJsonSchemaPlaygroundOptions,
  JsonSchemaPlaygroundRenderProps,
} from './types';

export interface JsonSchemaPlaygroundFlowProps extends UseJsonSchemaPlaygroundOptions {
  render: (renderProps: JsonSchemaPlaygroundRenderProps) => React.ReactNode;
}

export const JsonSchemaPlaygroundFlow = ({
  defaultSchema,
  initialValues,
  schemas,
  onSubmit,
  onError,
  render,
}: JsonSchemaPlaygroundFlowProps) => {
  const formId = useId();

  const playgroundBag = useJsonSchemaPlayground({
    defaultSchema,
    initialValues,
    schemas,
    onSubmit,
    onError,
  });

  return (
    <JsonSchemaPlaygroundContext.Provider
      value={{
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
