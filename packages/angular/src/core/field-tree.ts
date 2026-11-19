import {
  getBlankRowValues,
  resolveFieldDynamicProperties,
} from '../remote-core';

export type FieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FieldStatement = {
  title: string | null;
  description: string | null;
  severity: string;
};

export type FieldMeta = {
  label: string;
  hideLabel: boolean;
  description: string | null;
  inputType: string;
  required: boolean;
  disabled: boolean;
  options: FieldOption[];
  additionalProps: Record<string, unknown>;
  statement: FieldStatement | null;
};

export type ArrayConfig = {
  minItems: number;
  maxItems: number | undefined;
  addFieldText: string;
  itemFields: FieldNode[];
  blankRow: () => Record<string, unknown>;
};

export type FieldNode = {
  name: string;
  kind: 'control' | 'statement' | 'fieldset' | 'array';
  isVisible: () => boolean;
  meta: () => FieldMeta;
  lockedDefault: (values: Record<string, unknown>) => unknown;
  children: FieldNode[];
  array: ArrayConfig | null;
};

type JsfField = {
  name: string;
  type: string;
  inputType: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  default?: unknown;
  isVisible?: boolean;
  deprecated?: boolean;
  options?: FieldOption[];
  fields?: JsfField[];
  additionalProps?: Record<string, unknown>;
  statement?: { title?: string; description?: string; severity?: string };
  hideLabel?: boolean;
  addFieldText?: string;
  minItems?: number;
  maxItems?: number;
};

const isLocked = (field: JsfField) =>
  field.disabled === true || field.readOnly === true;

function toMeta(
  field: JsfField,
  isStatement: boolean,
  inheritedProps: () => Record<string, unknown>,
): FieldMeta {
  return {
    label: field.label ?? field.name,
    hideLabel: field.hideLabel === true,
    description: field.description ?? null,
    inputType: isStatement ? 'statement' : field.inputType,
    required: field.required === true,
    disabled: isLocked(field),
    options: field.options ?? [],
    additionalProps: { ...inheritedProps(), ...field.additionalProps },
    statement: field.statement
      ? {
          title: field.statement.title ?? null,
          description: field.statement.description ?? null,
          severity: field.statement.severity ?? 'info',
        }
      : null,
  };
}

export function toFieldNodes(
  getFields: () => JsfField[],
  inheritedProps: () => Record<string, unknown> = () => ({}),
): FieldNode[] {
  return getFields().flatMap((initial): FieldNode[] => {
    if (initial.deprecated === true) {
      return [];
    }
    const isStatement = initial.type === 'hidden' && Boolean(initial.statement);
    if (initial.type === 'hidden' && !isStatement) {
      return [];
    }

    const live = () =>
      getFields().find((field) => field.name === initial.name) ?? initial;

    const node: FieldNode = {
      name: initial.name,
      kind: isStatement ? 'statement' : 'control',
      isVisible: () => live().isVisible !== false,
      meta: () => toMeta(live(), isStatement, inheritedProps),
      lockedDefault: (values) => {
        const resolved = resolveFieldDynamicProperties(live(), values);
        return isLocked(resolved) ? resolved.default : undefined;
      },
      children: [],
      array: null,
    };

    if (initial.type === 'fieldset' && initial.fields) {
      node.kind = 'fieldset';
      node.children = toFieldNodes(() => live().fields ?? []);
    }

    if (initial.type === 'group-array' && initial.fields) {
      node.kind = 'array';
      node.array = {
        minItems: initial.minItems ?? 0,
        maxItems: initial.maxItems,
        addFieldText: initial.addFieldText ?? 'Add item',
        itemFields: toFieldNodes(
          () => live().fields ?? [],
          () => live().additionalProps ?? {},
        ),
        blankRow: () => getBlankRowValues(live().fields ?? []),
      };
    }

    return [node];
  });
}
