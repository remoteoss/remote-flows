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
}>({
  client: null,
});

export const useClient = () => useContext(RemoteFlowContext);
