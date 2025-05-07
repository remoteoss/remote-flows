import { Client } from '@hey-api/client-fetch';
import { createContext, useContext } from 'react';
import { Components } from './types/remoteFlows';

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
  jsonSchemaVersion: number | undefined;
}>({
  client: null,
  jsonSchemaVersion: undefined,
});

export const useClient = () => useContext(RemoteFlowContext);

export const useJsonSchemaVersion = () => {
  const context = useContext(RemoteFlowContext);
  if (!context) {
    throw new Error(
      'useJsonSchemaVersion must be used within a RemoteFlowProvider',
    );
  }

  if (context.jsonSchemaVersion === undefined) {
    return {};
  }

  return {
    json_schema_version: context.jsonSchemaVersion,
  };
};
