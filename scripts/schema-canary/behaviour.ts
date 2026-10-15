import {
  buildHeadlessForm,
  HeadlessFormStrategy,
  parseValuesForValidation,
} from '@/src/common/headlessForm';

type FormValues = Record<string, unknown>;

type FormField = {
  name: string;
  type?: string;
  inputType?: string;
  isVisible?: boolean;
  required?: boolean;
  valueGroupingDisabled?: boolean;
  options?: { value: unknown }[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  fields?: FormField[];
};

type Constraints = {
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type ScenarioDelta = {
  addedVisible: string[];
  removedVisible: string[];
  addedRequired: string[];
  removedRequired: string[];
};

export type SchemaFingerprint = {
  fingerprintVersion: 1;
  base: { visible: string[]; required: string[] };
  types: Record<string, string>;
  options: Record<string, string[]>;
  constraints: Record<string, Constraints>;
  scenarios: Record<string, ScenarioDelta>;
};

export type DiffSeverity = 'breaking' | 'info';

export type FingerprintChange = {
  severity: DiffSeverity;
  message: string;
};

const MAX_DRIVER_OPTIONS = 8;
const CONSTRAINT_KEYS = [
  'minimum',
  'maximum',
  'minLength',
  'maxLength',
  'pattern',
] as const;

type FlatField = { path: string; groupPath: string[]; field: FormField };

function flatten(
  fields: FormField[] | undefined,
  groupPath: string[] = [],
  prefix = '',
): FlatField[] {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.flatMap((field) => {
    const path = `${prefix}${field.name}`;
    const nested = flatten(
      field.fields,
      field.valueGroupingDisabled ? groupPath : [...groupPath, field.name],
      field.valueGroupingDisabled ? prefix : `${path}.`,
    );
    return field.type === 'fieldset' || field.fields
      ? nested
      : [{ path, groupPath, field }];
  });
}

function sorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

function setNested(
  values: FormValues,
  groupPath: string[],
  name: string,
  value: unknown,
): FormValues {
  if (groupPath.length === 0) {
    return { ...values, [name]: value };
  }
  const [head, ...rest] = groupPath;
  const current = values[head];
  return {
    ...values,
    [head]: setNested(
      typeof current === 'object' && current !== null
        ? (current as FormValues)
        : {},
      rest,
      name,
      value,
    ),
  };
}

async function resolveFields(
  schema: Record<string, unknown>,
  strategy: HeadlessFormStrategy,
  values: FormValues,
): Promise<FlatField[]> {
  const form = buildHeadlessForm(schema, strategy, values);
  await form.handleValidation(
    await parseValuesForValidation(form, strategy, values),
  );
  return flatten(form.fields as FormField[]);
}

function visibleAndRequired(fields: FlatField[]) {
  const visible = fields
    .filter(({ field }) => field.isVisible !== false)
    .map(({ path }) => path);
  const required = fields
    .filter(({ field }) => field.isVisible !== false && field.required)
    .map(({ path }) => path);
  return { visible: sorted(visible), required: sorted(required) };
}

function difference(next: string[], previous: string[]): string[] {
  const known = new Set(previous);
  return next.filter((item) => !known.has(item));
}

function driverValues(field: FormField): unknown[] {
  if (field.inputType === 'checkbox' || field.type === 'checkbox') {
    return [true];
  }
  const options = field.options ?? [];
  if (options.length === 0 || options.length > MAX_DRIVER_OPTIONS) {
    return [];
  }
  return options.map((option) => option.value);
}

function constraintsOf(field: FormField): Constraints {
  return CONSTRAINT_KEYS.reduce<Constraints>((acc, key) => {
    const value = field[key];
    const isUsable =
      value !== undefined &&
      (typeof value !== 'number' || Number.isFinite(value));
    return isUsable ? { ...acc, [key]: value } : acc;
  }, {});
}

export async function fingerprintSchema(
  schema: Record<string, unknown>,
  strategy: HeadlessFormStrategy,
): Promise<SchemaFingerprint> {
  const baseFields = await resolveFields(schema, strategy, {});
  const base = visibleAndRequired(baseFields);

  const types: Record<string, string> = {};
  const options: Record<string, string[]> = {};
  const constraints: Record<string, Constraints> = {};
  for (const { path, field } of baseFields) {
    types[path] = field.inputType ?? field.type ?? 'unknown';
    if (field.options && field.options.length > 0) {
      options[path] = sorted(field.options.map((o) => String(o.value)));
    }
    const fieldConstraints = constraintsOf(field);
    if (Object.keys(fieldConstraints).length > 0) {
      constraints[path] = fieldConstraints;
    }
  }

  const scenarios: Record<string, ScenarioDelta> = {};
  for (const { path, groupPath, field } of baseFields) {
    if (field.isVisible === false) {
      continue;
    }
    for (const value of driverValues(field)) {
      const fields = await resolveFields(
        schema,
        strategy,
        setNested({}, groupPath, field.name, value),
      );
      const state = visibleAndRequired(fields);
      const delta: ScenarioDelta = {
        addedVisible: difference(state.visible, base.visible),
        removedVisible: difference(base.visible, state.visible),
        addedRequired: difference(state.required, base.required),
        removedRequired: difference(base.required, state.required),
      };
      if (Object.values(delta).some((list) => list.length > 0)) {
        scenarios[`${path}=${String(value)}`] = delta;
      }
    }
  }

  return {
    fingerprintVersion: 1,
    base,
    types,
    options,
    constraints,
    scenarios,
  };
}

function isTightened(
  key: (typeof CONSTRAINT_KEYS)[number],
  before: Constraints[typeof key],
  after: Constraints[typeof key],
): boolean {
  if (before === after) {
    return false;
  }
  if (key === 'minimum' || key === 'minLength') {
    return after !== undefined && (before === undefined || after > before);
  }
  if (key === 'maximum' || key === 'maxLength') {
    return after !== undefined && (before === undefined || after < before);
  }
  return after !== undefined;
}

export function diffFingerprints(
  previous: SchemaFingerprint,
  next: SchemaFingerprint,
): FingerprintChange[] {
  const changes: FingerprintChange[] = [];
  const add = (severity: DiffSeverity, message: string) =>
    changes.push({ severity, message });

  for (const name of difference(next.base.required, previous.base.required)) {
    const wasVisible = previous.base.visible.includes(name);
    add(
      'breaking',
      wasVisible
        ? `\`${name}\` is now required`
        : `\`${name}\` is a new required field`,
    );
  }
  for (const name of difference(previous.base.required, next.base.required)) {
    add('info', `\`${name}\` is no longer required`);
  }
  for (const name of difference(previous.base.visible, next.base.visible)) {
    add('breaking', `\`${name}\` is no longer shown`);
  }
  for (const name of difference(next.base.visible, previous.base.visible)) {
    if (!next.base.required.includes(name)) {
      add('info', `\`${name}\` is a new optional field`);
    }
  }

  for (const [name, type] of Object.entries(next.types)) {
    const before = previous.types[name];
    if (before !== undefined && before !== type) {
      add(
        'breaking',
        `\`${name}\` changed input type from ${before} to ${type}`,
      );
    }
  }

  for (const [name, values] of Object.entries(previous.options)) {
    const after = next.options[name];
    if (!after) {
      continue;
    }
    for (const removed of difference(values, after)) {
      add('breaking', `\`${name}\` no longer accepts "${removed}"`);
    }
    for (const added of difference(after, values)) {
      add('info', `\`${name}\` accepts a new value "${added}"`);
    }
  }

  for (const [name, before] of Object.entries(previous.constraints)) {
    const after = next.constraints[name] ?? {};
    for (const key of CONSTRAINT_KEYS) {
      if (before[key] !== after[key]) {
        add(
          isTightened(key, before[key], after[key]) ? 'breaking' : 'info',
          `\`${name}\` ${key} changed from ${before[key] ?? 'unset'} to ${after[key] ?? 'unset'}`,
        );
      }
    }
  }
  for (const [name, after] of Object.entries(next.constraints)) {
    if (previous.constraints[name]) {
      continue;
    }
    for (const key of CONSTRAINT_KEYS) {
      if (isTightened(key, undefined, after[key])) {
        add('breaking', `\`${name}\` has a new ${key}: ${after[key]}`);
      }
    }
  }

  for (const [scenario, delta] of Object.entries(previous.scenarios)) {
    const after = next.scenarios[scenario];
    if (!after) {
      add('info', `choosing \`${scenario}\` no longer changes any field`);
      continue;
    }
    for (const name of difference(after.addedRequired, delta.addedRequired)) {
      add('breaking', `choosing \`${scenario}\` now requires \`${name}\``);
    }
    for (const name of difference(delta.addedVisible, after.addedVisible)) {
      add('breaking', `choosing \`${scenario}\` no longer shows \`${name}\``);
    }
  }
  for (const [scenario, delta] of Object.entries(next.scenarios)) {
    const separator = scenario.lastIndexOf('=');
    const driver = scenario.slice(0, separator);
    const value = scenario.slice(separator + 1);
    const isNewDriver =
      !(driver in previous.types) ||
      previous.options[driver]?.includes(value) === false;
    if (previous.scenarios[scenario] || isNewDriver) {
      continue;
    }
    for (const name of delta.addedRequired) {
      add('breaking', `choosing \`${scenario}\` now requires \`${name}\``);
    }
  }

  return changes;
}

export function formatChanges(changes: FingerprintChange[]): string {
  return changes
    .map(
      ({ severity, message }) =>
        `- ${severity === 'breaking' ? '❌' : 'ℹ️'} ${message}`,
    )
    .join('\n');
}
