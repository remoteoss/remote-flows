import { computed, signal } from '@angular/core';
import {
  buildHeadlessForm,
  parseValuesForValidation,
} from '@/src/common/headlessForm';
import { FieldOption, FieldView } from './field-contract';

type Values = Record<string, unknown>;
type ValidationOutput = { formErrors?: Record<string, unknown> } | undefined;

type JsfField = {
  name: string;
  label?: string;
  description?: string;
  inputType: string;
  required?: boolean;
  isVisible?: boolean;
  options?: FieldOption[];
};

export function createFormStore(schema: Record<string, unknown>) {
  const form = buildHeadlessForm(schema, 'buildOnce', {});
  const values = signal<Values>({});
  const touched = signal<Record<string, boolean>>({});
  const formErrors = signal<Record<string, unknown>>({});
  const submitted = signal<Values | null>(null);

  const jsfFields = form.fields as unknown as JsfField[];

  const fields = computed<FieldView[]>(() =>
    jsfFields
      .filter((field) => field.isVisible !== false)
      .map((field) => {
        const error = formErrors()[field.name];
        const isTouched = touched()[field.name] === true;
        const message = isTouched && typeof error === 'string' ? error : null;
        return {
          name: field.name,
          field: {
            name: field.name,
            value: values()[field.name],
            onChange: (value) => setValue(field.name, value),
            onBlur: () => setTouched(field.name),
          },
          fieldState: {
            error: message,
            invalid: message !== null,
            touched: isTouched,
          },
          fieldData: {
            label: field.label ?? field.name,
            description: field.description ?? null,
            inputType: field.inputType,
            required: field.required === true,
            options: field.options ?? [],
          },
        };
      }),
  );

  async function validate() {
    const parsed = await parseValuesForValidation(form, 'buildOnce', values());
    const result = form.handleValidation(parsed) as ValidationOutput;
    formErrors.set(result?.formErrors ?? {});
    return {
      parsed,
      hasErrors: Object.keys(result?.formErrors ?? {}).length > 0,
    };
  }

  function setValue(name: string, value: unknown) {
    values.update((current) => ({ ...current, [name]: value }));
    void validate();
  }

  function setTouched(name: string) {
    touched.update((current) => ({ ...current, [name]: true }));
  }

  async function submit() {
    touched.set(
      Object.fromEntries(jsfFields.map((field) => [field.name, true])),
    );
    const { parsed, hasErrors } = await validate();
    submitted.set(hasErrors ? null : parsed);
  }

  return {
    fields,
    submitted: submitted.asReadonly(),
    submit,
  };
}
