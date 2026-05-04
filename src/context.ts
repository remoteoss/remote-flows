import { Client } from '@/src/client/client';
import { createContext, useContext } from 'react';
import { Components } from './types/remoteFlows';

export const FormFieldsContext = createContext<{
  components: Components;
  transformHtmlToComponents?: (htmlContent: string) => React.ReactNode;
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

// Internal hook for accessing transformer (used during field processing and in FormDescription/FieldSetField)
export const useTransformer = () => {
  const context = useContext(FormFieldsContext);
  return context?.transformHtmlToComponents;
};

export const RemoteFlowContext = createContext<{ client: Client | null }>({
  client: null,
});

export const useClient = () => useContext(RemoteFlowContext);
