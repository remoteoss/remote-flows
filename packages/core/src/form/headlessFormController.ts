import equal from 'fast-deep-equal';
import type { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import { parseJSFToValidate } from './form';
import type { FileConverter } from './form';
import {
  buildHeadlessForm,
  parseValuesForValidation,
  withFieldsetObjects,
} from './headlessForm';
import type { HeadlessFormOptions } from './headlessForm';
import type { FieldValues, JSONSchemaFormResultWithFieldsets } from '../types';

type Schema = Record<string, unknown>;

export type HeadlessFormControllerInput = {
  schema: Schema | undefined;
  initialValues?: FieldValues;
  options?: HeadlessFormOptions;
};

export type HeadlessFormControllerConfig = {
  convertFiles?: FileConverter;
  logModifyWarnings?: boolean;
};

export type HeadlessFormController = {
  sync: (
    input: HeadlessFormControllerInput,
  ) => JSONSchemaFormResultWithFieldsets | null;
  getForm: () => JSONSchemaFormResultWithFieldsets | null;
  getRevision: () => number;
  subscribe: (listener: () => void) => () => void;
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
  onValuesChange: (values: FieldValues) => Promise<void>;
  parseFormValues: (values: FieldValues) => Promise<FieldValues>;
};

const passthroughFiles: FileConverter = async (files) => files;

/**
 * Framework-neutral controller for a `buildOnce` JSON Schema headless form.
 * Sync inputs during render or inside a computed signal, and subscribe to
 * revision updates triggered by validation.
 */
export function createHeadlessFormController(
  config?: HeadlessFormControllerConfig,
): HeadlessFormController {
  const convertFiles = config?.convertFiles ?? passthroughFiles;
  const listeners = new Set<() => void>();

  let hasSynced = false;
  let currentSchema: Schema | undefined;
  let currentOptions: HeadlessFormOptions | undefined;
  let currentInitialValues: FieldValues | undefined;
  let form: JSONSchemaFormResultWithFieldsets | null = null;
  let lastValidated: { schema: Schema; values: FieldValues } | null = null;
  let revision = 0;
  let validationRun = 0;

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const resolveBuildOptions = (
    options: HeadlessFormOptions | undefined,
  ): HeadlessFormOptions | undefined => {
    if (!options && config?.logModifyWarnings === undefined) {
      return undefined;
    }
    return {
      ...options,
      logModifyWarnings:
        options?.logModifyWarnings ?? config?.logModifyWarnings,
    };
  };

  function sync(
    input: HeadlessFormControllerInput,
  ): JSONSchemaFormResultWithFieldsets | null {
    const schemaChanged = !hasSynced || input.schema !== currentSchema;
    const optionsChanged = !hasSynced || !equal(currentOptions, input.options);
    const initialValuesChanged =
      !hasSynced || !equal(currentInitialValues, input.initialValues);

    if (!schemaChanged && !optionsChanged && !initialValuesChanged) {
      return form;
    }

    hasSynced = true;
    if (schemaChanged) {
      lastValidated = null;
    }
    currentSchema = input.schema;
    if (optionsChanged) {
      currentOptions = input.options;
    }
    if (initialValuesChanged) {
      currentInitialValues = input.initialValues;
    }

    if (!currentSchema) {
      form = null;
      return null;
    }

    const buildValues =
      lastValidated?.schema === currentSchema
        ? lastValidated.values
        : currentInitialValues;

    form = buildHeadlessForm(
      currentSchema,
      'buildOnce',
      buildValues,
      resolveBuildOptions(currentOptions),
    );
    return form;
  }

  async function handleValidation(
    nextValues: FieldValues,
  ): Promise<ValidationResult | null> {
    const activeForm = form;
    const activeSchema = currentSchema;
    if (!activeForm || !activeSchema) {
      return null;
    }
    const run = ++validationRun;
    const parsedValues = await parseValuesForValidation(
      activeForm,
      'buildOnce',
      nextValues,
      convertFiles,
    );
    if (run !== validationRun || activeForm !== form) {
      return null;
    }
    lastValidated = {
      schema: activeSchema,
      values: JSON.parse(JSON.stringify(parsedValues)),
    };
    // An untouched fieldset has no value, so jsf v1 reports one error for the
    // whole fieldset, which no input can display. An empty object makes it
    // check the fields inside, so their own errors show up.
    const result = activeForm.handleValidation(
      withFieldsetObjects(parsedValues, activeForm.fields),
    );
    revision += 1;
    notify();
    return result;
  }

  async function onValuesChange(nextValues: FieldValues): Promise<void> {
    await handleValidation(nextValues);
  }

  async function parseFormValues(
    nextValues: FieldValues,
  ): Promise<FieldValues> {
    return form
      ? parseJSFToValidate(nextValues, form.fields, { convertFiles })
      : {};
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    sync,
    getForm: () => form,
    getRevision: () => revision,
    subscribe,
    handleValidation,
    onValuesChange,
    parseFormValues,
  };
}
