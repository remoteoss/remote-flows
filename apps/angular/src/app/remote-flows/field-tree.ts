import { getBlankRowValues } from '@remoteoss/remote-flows-core';

export type FieldOption = { value: string; label: string };

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

function toMeta(
  field: JsfField,
  isStatement: boolean,
  inheritedProps: Record<string, unknown>,
): FieldMeta {
  return {
    label: field.label ?? field.name,
    hideLabel: field.hideLabel === true,
    description: field.description ?? null,
    inputType: isStatement ? 'statement' : field.inputType,
    required: field.required === true,
    options: field.options ?? [],
    additionalProps: { ...inheritedProps, ...field.additionalProps },
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
  fields: JsfField[],
  inheritedProps: Record<string, unknown> = {},
): FieldNode[] {
  return fields.flatMap((field): FieldNode[] => {
    if (field.deprecated === true) {
      return [];
    }
    const isStatement = field.type === 'hidden' && Boolean(field.statement);
    if (field.type === 'hidden' && !isStatement) {
      return [];
    }

    const node: FieldNode = {
      name: field.name,
      kind: isStatement ? 'statement' : 'control',
      isVisible: () => field.isVisible !== false,
      meta: () => toMeta(field, isStatement, inheritedProps),
      children: [],
      array: null,
    };

    if (field.type === 'fieldset' && field.fields) {
      node.kind = 'fieldset';
      node.children = toFieldNodes(field.fields);
    }

    if (field.type === 'group-array' && field.fields) {
      node.kind = 'array';
      node.array = {
        minItems: field.minItems ?? 0,
        maxItems: field.maxItems,
        addFieldText: field.addFieldText ?? 'Add item',
        itemFields: toFieldNodes(field.fields, field.additionalProps),
        blankRow: () => getBlankRowValues(field.fields ?? []),
      };
    }

    return [node];
  });
}
