import {
  buildHeadlessForm,
  getInitialValues,
  HeadlessFormOptions,
  parseJSFToValidate,
  parseValuesForValidation,
  withFieldsetObjects,
} from '@remoteoss/remote-flows-core';
import { FieldNode, toFieldNodes } from './field-tree';

type Values = Record<string, unknown>;
type Schema = Record<string, unknown>;
type JsfFields = Parameters<typeof getInitialValues>[0];
type FormErrors = Record<string, unknown>;

const convertFiles = async (files: unknown[]) => files;

export type FormEngine = {
  nodes: FieldNode[];
  initialValues: (defaults: Values) => Values;
  validate: (values: Values) => Promise<FormErrors>;
  parse: (values: Values) => Promise<Values>;
};

export function createFormEngine(
  schema: Schema,
  options?: HeadlessFormOptions,
): FormEngine {
  const form = buildHeadlessForm(schema, 'buildOnce', {}, options);
  const fields = form.fields as unknown as JsfFields;

  return {
    nodes: toFieldNodes(
      form.fields as unknown as Parameters<typeof toFieldNodes>[0],
    ),
    initialValues: (defaults) => getInitialValues(fields, defaults),
    validate: async (values) => {
      const parsed = await parseValuesForValidation(
        form,
        'buildOnce',
        values,
        convertFiles,
      );
      const result = form.handleValidation(
        withFieldsetObjects(parsed, form.fields),
      ) as { formErrors?: FormErrors } | undefined;
      return result?.formErrors ?? {};
    },
    parse: (values) => parseJSFToValidate(values, fields, { convertFiles }),
  };
}
