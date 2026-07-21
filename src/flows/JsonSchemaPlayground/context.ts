import { createContext, useContext } from 'react';
import { useJsonSchemaPlayground } from './hooks';

export interface JsonSchemaPlaygroundContextValue {
  formId: string;
  playgroundBag: ReturnType<typeof useJsonSchemaPlayground>;
}

export const JsonSchemaPlaygroundContext =
  createContext<JsonSchemaPlaygroundContextValue | null>(null);

export const useJsonSchemaPlaygroundContext = () => {
  const context = useContext(JsonSchemaPlaygroundContext);
  if (!context) {
    throw new Error(
      'useJsonSchemaPlaygroundContext must be used within a JsonSchemaPlaygroundFlow',
    );
  }

  return context;
};
