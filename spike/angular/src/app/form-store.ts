import {
  computed,
  effect,
  linkedSignal,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import {
  buildHeadlessForm,
  HeadlessFormOptions,
  parseValuesForValidation,
  withFieldsetObjects,
} from '@/src/common/headlessForm';
import {
  getBlankRowValues,
  getInitialValues,
  parseJSFToValidate,
} from '@/src/components/form/utils';
import { FieldView, FieldOption } from './field-contract';
import { getIn, Path, setIn } from './path';

type Values = Record<string, unknown>;
type Schema = Record<string, unknown>;

type JsfField = {
  name: string;
  type: string;
  inputType: string;
  label?: string;
  description?: string;
  required?: boolean;
  isVisible?: boolean;
  deprecated?: boolean;
  options?: FieldOption[];
  fields?: JsfField[];
  additionalProps?: Record<string, unknown>;
  statement?: {
    title?: string;
    description?: string;
    severity?: string;
  };
  hideLabel?: boolean;
  addFieldText?: string;
  minItems?: number;
  maxItems?: number;
};

type CreateFormStoreArgs = {
  schema: Signal<Schema | undefined>;
  defaultValues?: Signal<Values>;
  options?: HeadlessFormOptions;
};

const isSkipped = (field: JsfField) =>
  field.isVisible === false || field.deprecated === true;

export function createFormStore({
  schema,
  defaultValues,
  options,
}: CreateFormStoreArgs) {
  const form = computed(() => {
    const currentSchema = schema();
    if (!currentSchema) {
      return null;
    }
    return buildHeadlessForm(currentSchema, 'buildOnce', {}, options);
  });

  const values = linkedSignal<ReturnType<typeof form>, Values>({
    source: form,
    computation: (current, previous) => {
      if (!current) {
        return {};
      }
      if (previous && previous.value && Object.keys(previous.value).length) {
        return previous.value;
      }
      return getInitialValues(current.fields as never, defaultValues?.() ?? {});
    },
  });

  const touched = signal<Record<string, boolean>>({});
  const submitAttempted = signal(false);
  const formErrors = signal<Record<string, unknown>>({});
  const revision = signal(0);
  let validationRun = 0;

  const jsfFields = () => (form()?.fields ?? []) as unknown as JsfField[];

  function toViews(fields: JsfField[], base: Path): FieldView[] {
    return fields.flatMap((field): FieldView[] => {
      if (isSkipped(field)) {
        return [];
      }
      const isStatement = field.type === 'hidden' && field.statement;
      if (field.type === 'hidden' && !isStatement) {
        return [];
      }

      const path = [...base, field.name];
      const key = path.join('.');
      const error = getIn(formErrors(), path);
      const isTouched = touched()[key] === true || submitAttempted();
      const message = isTouched && typeof error === 'string' ? error : null;

      const view: FieldView = {
        key,
        field: {
          name: key,
          value: getIn(values(), path),
          onChange: (value) => setValue(path, value),
          onBlur: () => setTouched(key),
        },
        fieldState: {
          error: message,
          invalid: message !== null,
          touched: isTouched,
        },
        fieldData: {
          label: field.label ?? field.name,
          hideLabel: field.hideLabel === true,
          description: field.description ?? null,
          inputType: isStatement ? 'statement' : field.inputType,
          required: field.required === true,
          options: field.options ?? [],
          additionalProps: field.additionalProps ?? {},
          statement: field.statement
            ? {
                title: field.statement.title ?? null,
                description: field.statement.description ?? null,
                severity: field.statement.severity ?? 'info',
              }
            : null,
        },
        children: [],
        group: null,
      };

      if (field.type === 'fieldset' && field.fields) {
        view.children = toViews(field.fields, path);
      }

      if (field.type === 'group-array' && field.fields) {
        const rows = (getIn(values(), path) as unknown[] | undefined) ?? [];
        const minItems = field.minItems ?? 0;
        view.group = {
          addFieldText: field.addFieldText ?? 'Add item',
          canAdd: field.maxItems === undefined || rows.length < field.maxItems,
          add: () =>
            setValue(path, [...rows, getBlankRowValues(field.fields ?? [])]),
          rows: rows.map((_, index) => ({
            id: index,
            index,
            canRemove: rows.length > minItems,
            remove: () =>
              setValue(
                path,
                rows.filter((__, rowIndex) => rowIndex !== index),
              ),
            fields: toViews(
              field.fields!.map((child) => ({
                ...child,
                additionalProps: {
                  ...field.additionalProps,
                  ...child.additionalProps,
                },
              })),
              [...path, index],
            ),
          })),
        };
      }

      return [view];
    });
  }

  const fields = computed<FieldView[]>(() => {
    revision();
    return toViews(jsfFields(), []);
  });

  async function validate() {
    const current = form();
    if (!current) {
      return { hasErrors: false };
    }
    const run = ++validationRun;
    const parsed = await parseValuesForValidation(
      current,
      'buildOnce',
      values(),
    );
    const result = current.handleValidation(
      withFieldsetObjects(parsed, current.fields),
    ) as { formErrors?: Record<string, unknown> } | undefined;
    const errors = result?.formErrors ?? {};
    if (run === validationRun) {
      formErrors.set(errors);
    }
    revision.update((count) => count + 1);
    return { hasErrors: Object.keys(errors).length > 0 };
  }

  function setValue(path: Path, value: unknown) {
    values.update((current) => setIn(current, path, value));
    void validate();
  }

  function setTouched(key: string) {
    touched.update((current) => ({ ...current, [key]: true }));
  }

  effect(() => {
    if (form()) {
      untracked(() => void validate());
    }
  });

  async function submit() {
    submitAttempted.set(true);
    const { hasErrors } = await validate();
    return { hasErrors };
  }

  async function parse() {
    const current = form();
    return current ? parseJSFToValidate(values(), current.fields as never) : {};
  }

  return {
    fields,
    values: values.asReadonly(),
    formErrors: formErrors.asReadonly(),
    validate,
    submit,
    parse,
  };
}
