import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { FieldValues } from 'react-hook-form';
import {
  createHeadlessFormController,
  type HeadlessFormOptions,
} from '@remoteoss/remote-flows-core';
import { ValidationResult } from '@remoteoss/remote-json-schema-form-kit';
import {
  buildHeadlessForm,
  parseValuesForValidation,
  withFieldsetObjects,
} from '@/src/common/headlessForm';
import { useDeepStable } from '@/src/common/hooks';
import { parseJSFToValidate } from '@/src/components/form/utils';
import { JSONSchemaFormResultWithFieldsets } from '@/src/flows/types';
import { convertFilesToBase64 } from '@/src/lib/files';

export type { HeadlessFormStrategy } from '@remoteoss/remote-flows-core';

type Schema = Record<string, unknown>;

type UseHeadlessFormArgs = {
  schema: Schema | undefined;
  options?: HeadlessFormOptions;
} & (
  | { strategy: 'buildOnce'; initialValues?: FieldValues }
  | { strategy: 'rebuild'; values: FieldValues }
);

export type HeadlessForm = {
  form: JSONSchemaFormResultWithFieldsets | null;
  handleValidation: (values: FieldValues) => Promise<ValidationResult | null>;
  onValuesChange: (values: FieldValues) => Promise<void>;
  parseFormValues: (values: FieldValues) => Promise<FieldValues>;
};

const noop = async () => {};

export function useHeadlessForm(args: UseHeadlessFormArgs): HeadlessForm {
  const { schema, options, strategy } = args;
  const isBuildOnce = strategy === 'buildOnce';

  const [controller] = useState(() =>
    createHeadlessFormController({
      convertFiles: convertFilesToBase64,
      logModifyWarnings: process.env.RF_INTERNAL_DEV === 'true',
    }),
  );
  useSyncExternalStore(
    controller.subscribe,
    controller.getRevision,
    controller.getRevision,
  );

  const rebuildOptions = useDeepStable(isBuildOnce ? undefined : options);
  const rebuildValues = args.strategy === 'rebuild' ? args.values : undefined;

  const rebuildForm = useMemo(() => {
    if (isBuildOnce || !schema) {
      return null;
    }
    return buildHeadlessForm(schema, 'rebuild', rebuildValues, rebuildOptions);
  }, [isBuildOnce, schema, rebuildValues, rebuildOptions]);

  const form = isBuildOnce
    ? controller.sync({
        schema,
        options,
        initialValues: args.initialValues,
      })
    : rebuildForm;

  const rebuildHandleValidation = useCallback(
    async (nextValues: FieldValues) => {
      if (!rebuildForm || !schema) {
        return null;
      }
      const parsedValues = await parseValuesForValidation(
        rebuildForm,
        'rebuild',
        nextValues,
      );
      return rebuildForm.handleValidation(
        withFieldsetObjects(parsedValues, rebuildForm.fields),
      );
    },
    [rebuildForm, schema],
  );

  const rebuildParseFormValues = useCallback(
    async (nextValues: FieldValues) =>
      rebuildForm ? parseJSFToValidate(nextValues, rebuildForm.fields) : {},
    [rebuildForm],
  );

  if (isBuildOnce) {
    return {
      form,
      handleValidation: controller.handleValidation,
      onValuesChange: controller.onValuesChange,
      parseFormValues: controller.parseFormValues,
    };
  }

  return {
    form: rebuildForm,
    handleValidation: rebuildHandleValidation,
    onValuesChange: noop,
    parseFormValues: rebuildParseFormValues,
  };
}
