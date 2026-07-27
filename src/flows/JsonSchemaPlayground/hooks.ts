import { useState, useCallback, useMemo, useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { SAMPLE_SCHEMAS } from './schemas';
import {
  JsonSchemaPlaygroundResult,
  JsonSchemaPlaygroundState,
  SampleSchema,
  UseJsonSchemaPlaygroundOptions,
} from './types';
import { $TSFixMe } from '@/src/types/remoteFlows';

export const useJsonSchemaPlayground = (
  options: UseJsonSchemaPlaygroundOptions = {},
) => {
  const {
    defaultSchema = 'simple-user-profile',
    initialValues: jsonSchemaInitialValues = {},
    schemas: customSchemas,
    onSubmit,
    onError,
  } = options;

  const [state, setState] = useState<JsonSchemaPlaygroundState>({
    selectedSchema: defaultSchema,
    submittedResults: [],
    isLoading: false,
    isSubmitting: false,
    resetKey: 0,
  });

  const [trackedFields, setTrackedFields] = useState<$TSFixMe[]>([]);

  const fieldValues = useMemo(() => {
    return {
      ...jsonSchemaInitialValues,
    };
  }, [jsonSchemaInitialValues]);

  const availableSchemasMap = useMemo<Record<string, SampleSchema>>(
    () => ({ ...SAMPLE_SCHEMAS, ...customSchemas }),
    [customSchemas],
  );

  // Get current schema
  const currentSchemaData = useMemo(() => {
    return (
      availableSchemasMap[state.selectedSchema] ||
      availableSchemasMap['simple-user-profile']
    );
  }, [availableSchemasMap, state.selectedSchema]);

  // Create headless form from current schema
  const headlessForm = useMemo(() => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const form = createHeadlessForm(currentSchemaData.schema, fieldValues, {
        transformMoneyFields: false,
      });
      setState((prev) => ({ ...prev, isLoading: false }));
      return form;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      onError?.(error);
      throw error;
    }
  }, [currentSchemaData.schema, fieldValues, onError, state.resetKey]);

  useEffect(() => {
    setTrackedFields([...headlessForm.fields]);
  }, [headlessForm, fieldValues]);

  // Handle schema selection
  const handleSchemaChange = useCallback((schemaKey: string) => {
    setState((prev) => ({ ...prev, selectedSchema: schemaKey }));
    setState((prev) => ({ ...prev, resetKey: prev.resetKey + 1 }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: FieldValues) => {
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit?.(values);

        const result: JsonSchemaPlaygroundResult = {
          success: true,
          data: values,
          timestamp: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          submittedResults: [result, ...prev.submittedResults],
        }));

        return result;
      } catch (error) {
        const result: JsonSchemaPlaygroundResult = {
          success: false,
          data: values,
          timestamp: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          submittedResults: [result, ...prev.submittedResults],
        }));

        onError?.(error);
        throw error;
      }
    },
    [onSubmit, onError],
  );

  // Handle form reset
  const handleReset = useCallback(() => {
    setState((prev) => ({ ...prev, resetKey: prev.resetKey + 1 }));
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setState((prev) => ({ ...prev, submittedResults: [] }));
  }, []);

  // Validation functions
  const handleValidation = useCallback(
    async (values: FieldValues) => {
      if (!headlessForm.fields) {
        return null;
      }
      const parsedValues = await parseJSFToValidate(
        values,
        headlessForm.fields,
        { isPartialValidation: false },
      );
      const result = await headlessForm.handleValidation(parsedValues);

      setTrackedFields([...headlessForm.fields]);

      return result;
    },
    [headlessForm],
  );

  const initialValues = useMemo(() => {
    return getInitialValues(headlessForm.fields, fieldValues);
  }, [headlessForm.fields, fieldValues]);

  return {
    // State
    selectedSchema: state.selectedSchema,
    resetKey: state.resetKey,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    submittedResults: state.submittedResults,
    fieldValues,
    initialValues,

    // Schema data
    currentSchemaData,
    availableSchemas: Object.entries(availableSchemasMap).map(
      ([key, value]) => ({
        key,
        name: value.name,
        description: value.description,
      }),
    ),

    // Form data from headless form
    fields: trackedFields,
    meta: headlessForm.meta,

    // Actions
    handleSchemaChange,
    handleSubmit,
    handleReset,
    clearResults,

    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: async (values: FieldValues) => {
      await handleValidation(values);
    },

    // Validation
    handleValidation,
  };
};
