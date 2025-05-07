import { Client } from '@hey-api/client-fetch';
import { createContext, useContext } from 'react';
import { Components, RemoteFlowsSDKProps } from './types/remoteFlows';

export const FormFieldsContext = createContext<{
  components: Components;
} | null>(null);

export const useFormFields = () => {
  const context = useContext(FormFieldsContext);
  if (!context?.components) {
    throw new Error('useFormFields must be used within a FormFieldsProvider');
  }

  return {
    components: context.components,
  };
};

export const RemoteFlowContext = createContext<{
  client: Client | null;
  jsonSchemaVersion: RemoteFlowsSDKProps['jsonSchemaVersion'] | undefined;
}>({
  client: null,
  jsonSchemaVersion: undefined,
});

export const useClient = () => useContext(RemoteFlowContext);

type JsonSchemaVersionKeys = keyof NonNullable<
  RemoteFlowsSDKProps['jsonSchemaVersion']
>;
export const useJsonSchemaVersion = (key: JsonSchemaVersionKeys) => {
  const context = useContext(RemoteFlowContext);
  if (!context) {
    throw new Error(
      'useJsonSchemaVersion must be used within a RemoteFlowProvider',
    );
  }

  if (context.jsonSchemaVersion?.[key] === undefined) {
    return {};
  }

  return {
    json_schema_version: context.jsonSchemaVersion[key],
  };
};
