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
  userId?: string;
}>({
  client: null,
  userId: undefined,
});

export const useClient = () => {
  const context = useContext(RemoteFlowContext);
  if (!context) {
    throw new Error('useClient must be used within a RemoteFlowContext');
  }
  return {
    client: context.client,
  };
};

/**
 * useUserId returns the userId passed in the auth function
 * @returns The userId passed in the auth function
 
 */
export const useUserId = () => {
  const context = useContext(RemoteFlowContext);
  if (!context) {
    throw new Error('useUserId must be used within a RemoteFlowContext');
  }
  return context.userId;
};
