import {
  createHeadlessFormController,
  getInitialValues,
  type HeadlessFormOptions,
} from '@remoteoss/remote-flows-core';
import { FieldNode, toFieldNodes } from './field-tree';

type Values = Record<string, unknown>;
type Schema = Record<string, unknown>;
type JsfFields = Parameters<typeof getInitialValues>[0];
type FormErrors = Record<string, unknown>;

export type SyncedForm = {
  nodes: FieldNode[];
  initialValues: (defaults: Values) => Values;
};

export type FormEngine = {
  sync: (
    schema: Schema | undefined,
    initialValues?: Values,
    options?: HeadlessFormOptions,
  ) => SyncedForm | null;
  validate: (values: Values) => Promise<FormErrors | null>;
  parse: (values: Values) => Promise<Values>;
};

export function createFormEngine(): FormEngine {
  const controller = createHeadlessFormController();

  return {
    sync: (schema, initialValues, options) => {
      const form = controller.sync({ schema, initialValues, options });
      if (!form) {
        return null;
      }
      const fields = form.fields as unknown as JsfFields;
      return {
        nodes: toFieldNodes(
          () =>
            form.fields as unknown as ReturnType<
              Parameters<typeof toFieldNodes>[0]
            >,
        ),
        initialValues: (defaults) => getInitialValues(fields, defaults),
      };
    },
    validate: async (values) => {
      const result = (await controller.handleValidation(values)) as {
        formErrors?: FormErrors;
      } | null;
      return result ? (result.formErrors ?? {}) : null;
    },
    parse: (values) => controller.parseFormValues(values),
  };
}
