import { useState, useCallback, useMemo, useEffect } from 'react';
import { FieldValues } from 'react-hook-form';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import {
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { SAMPLE_SCHEMAS, SchemaKey } from './schemas';
import {
  JsonSchemaPlaygroundResult,
  JsonSchemaPlaygroundState,
  UseJsonSchemaPlaygroundOptions,
} from './types';

export const useJsonSchemaPlayground = (
  options: UseJsonSchemaPlaygroundOptions = {},
) => {
  const {
    defaultSchema = 'simple-salary-test',
    initialValues: jsonSchemaFormInitialValues = {},
    onSubmit,
    onError,
  } = options;

  const [state, setState] = useState<JsonSchemaPlaygroundState>({
    selectedSchema: defaultSchema,
    submittedResults: [],
    isLoading: false,
    isSubmitting: false,
  });

  const [fieldValues, setFieldValues] = useState<FieldValues>(
    jsonSchemaFormInitialValues,
  );
  const [parsedValues, setParsedValues] = useState<FieldValues>({});

  // Get current schema
  const currentSchemaData = useMemo(() => {
    return (
      SAMPLE_SCHEMAS[state.selectedSchema as SchemaKey] ||
      SAMPLE_SCHEMAS['france-wage-portage-simplified']
    );
  }, [state.selectedSchema]);

  // Create headless form from current schema
  const headlessForm = useMemo(() => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const form = createHeadlessForm(currentSchemaData.schema, fieldValues);
      setState((prev) => ({ ...prev, isLoading: false }));
      return form;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      onError?.(error);
      throw error;
    }
  }, [currentSchemaData.schema, fieldValues, onError]);

  // Parse initial values when headless form is ready and fieldValues change
  useEffect(() => {
    const parseInitialValues = async () => {
      if (
        headlessForm.fields &&
        fieldValues &&
        Object.keys(fieldValues).length > 0
      ) {
        try {
          const parsed = await parseJSFToValidate(
            fieldValues,
            headlessForm.fields,
            { isPartialValidation: false },
          );
          setParsedValues(parsed);
        } catch (error) {
          console.error('Error parsing initial values:', error);
          setParsedValues({});
        }
      }
    };

    parseInitialValues();
  }, [headlessForm.fields, fieldValues]);

  // Handle schema selection
  const handleSchemaChange = useCallback(
    (schemaKey: string) => {
      setState((prev) => ({ ...prev, selectedSchema: schemaKey }));
      setFieldValues(jsonSchemaFormInitialValues);
    },
    [jsonSchemaFormInitialValues],
  );

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
    setFieldValues(jsonSchemaFormInitialValues);
  }, [jsonSchemaFormInitialValues]);

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
      // Store the parsed values for debugging
      setParsedValues(parsedValues);
      const result = await headlessForm.handleValidation(parsedValues);
      return result;
    },
    [headlessForm],
  );

  const parseFormValues = useCallback(
    async (values: FieldValues) => {
      if (!headlessForm.fields) {
        return values;
      }
      return parseJSFToValidate(values, headlessForm.fields, {
        isPartialValidation: false,
      });
    },
    [headlessForm.fields],
  );

  const checkFieldUpdates = useCallback(
    async (values: FieldValues) => {
      const parsedValues =
        headlessForm.fields.length > 0
          ? await parseJSFToValidate(values, headlessForm.fields, {
              isPartialValidation: false,
            })
          : values;
      setFieldValues({
        ...values,
        ...parsedValues,
      });
    },
    [headlessForm.fields],
  );

  const initialValues = useMemo(() => {
    return getInitialValues(headlessForm.fields, fieldValues);
  }, [headlessForm.fields, fieldValues]);

  return {
    // State
    selectedSchema: state.selectedSchema,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    submittedResults: state.submittedResults,
    fieldValues,
    parsedValues,

    // Schema data
    currentSchemaData,
    availableSchemas: Object.entries(SAMPLE_SCHEMAS).map(([key, value]) => ({
      key,
      name: value.name,
      description: value.description,
    })),

    // Form data from headless form
    fields: headlessForm.fields || [],
    meta: headlessForm.meta,
    initialValues,

    // Actions
    handleSchemaChange,
    handleSubmit,
    handleReset,
    clearResults,
    setFieldValues,

    /**
     * Function to update the current form field values
     * @param values - New form values to set
     */
    checkFieldUpdates: checkFieldUpdates,

    // Validation
    handleValidation,
    parseFormValues,
  };
};
