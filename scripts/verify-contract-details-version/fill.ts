import { faker } from '@faker-js/faker';
import { $TSFixMe } from '@/src/types/remoteFlows';

export type FillPass = 'required' | 'full';

export type FillableFieldOption = {
  value: unknown;
  meta?: Record<string, unknown>;
};

export type FillableField = {
  name: string;
  inputType?: string;
  required?: boolean;
  isVisible?: boolean;
  multiple?: boolean;
  options?: FillableFieldOption[];
  fields?: FillableField[];
};

function preferNoOption(options: FillableFieldOption[]) {
  return (
    options.find((option) => String(option.value).toLowerCase() === 'no') ||
    options[0]
  );
}

export function fakeValueFor(field: FillableField): unknown {
  const { inputType, options, multiple, name } = field;

  if (options?.length) {
    if (inputType === 'radio' || inputType === 'select') {
      return preferNoOption(options).value;
    }
    if (inputType === 'countries' || multiple) {
      return [faker.helpers.arrayElement(options).value];
    }
    if (inputType === 'tel') {
      const option =
        options.find((candidate) => candidate.meta?.countryCode) || options[0];
      return `+${option.meta?.countryCode}${faker.string.numeric(9)}`;
    }
    return preferNoOption(options).value;
  }

  switch (inputType) {
    case 'email':
      return name === 'work_email'
        ? faker.internet.email({ provider: 'remote-e2e-test.com' })
        : faker.internet.email();
    case 'tel':
      return `+1${faker.string.numeric(9)}`;
    case 'date': {
      const date = new Date();
      date.setDate(date.getDate() + 21);
      return date.toISOString().slice(0, 10);
    }
    case 'number':
      return faker.number.int({ min: 5, max: 30 });
    case 'money':
      return faker.number.int({ min: 3_000_000, max: 8_000_000 });
    case 'textarea':
      return faker.lorem.sentence();
    case 'checkbox':
      return [true];
    case 'file':
    case 'group-array':
      return undefined;
    default:
      return faker.lorem.words({ min: 2, max: 4 });
  }
}

export function fillVisibleFields(
  fields: FillableField[],
  values: Record<string, unknown>,
  pass: FillPass,
  skipped: string[] = [],
): boolean {
  let changed = false;

  for (const field of fields) {
    if (field.isVisible === false) continue;

    if (field.fields?.length) {
      const nestedValues = ((values[field.name] as $TSFixMe) || {}) as Record<
        string,
        unknown
      >;
      const nestedChanged = fillVisibleFields(
        field.fields,
        nestedValues,
        pass,
        skipped,
      );
      if (nestedChanged) {
        values[field.name] = nestedValues;
        changed = true;
      }
      continue;
    }

    if (pass === 'required' && !field.required) continue;
    if (values[field.name] !== undefined) continue;

    if (field.inputType === 'file' || field.inputType === 'group-array') {
      if (!skipped.includes(field.name)) skipped.push(field.name);
      continue;
    }

    const value = fakeValueFor(field);
    if (value === undefined) {
      if (!skipped.includes(field.name)) skipped.push(field.name);
      continue;
    }

    values[field.name] = value;
    changed = true;
  }

  return changed;
}
