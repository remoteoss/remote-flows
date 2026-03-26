import type { JSFField } from '@/src/types/remoteFlows';

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface FieldDiff {
  fieldName: string;
  diffType: DiffType;
  changes?: {
    label?: { old: string; new: string };
    required?: { old: boolean; new: boolean };
    type?: { old: string; new: string };
    options?: { old: unknown[]; new: unknown[] };
  };
}

export interface FormDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
  fieldDiffs: Map<string, FieldDiff>;
}

const isFieldModified = (field1: JSFField, field2: JSFField): boolean => {
  return (
    field1.label !== field2.label ||
    field1.required !== field2.required ||
    field1.inputType !== field2.inputType ||
    field1.type !== field2.type ||
    JSON.stringify(field1.options) !== JSON.stringify(field2.options)
  );
};

const getFieldChanges = (field1: JSFField, field2: JSFField) => {
  const changes: FieldDiff['changes'] = {};

  if (field1.label !== field2.label) {
    changes.label = { old: field1.label, new: field2.label };
  }

  if (field1.required !== field2.required) {
    changes.required = { old: field1.required, new: field2.required };
  }

  if (field1.type !== field2.type) {
    changes.type = { old: field1.type, new: field2.type };
  }

  if (JSON.stringify(field1.options) !== JSON.stringify(field2.options)) {
    changes.options = { old: field1.options || [], new: field2.options || [] };
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
};

export const compareFormFields = (
  fields1: JSFField[] = [],
  fields2: JSFField[] = [],
): FormDiff => {
  const fieldMap1 = new Map(fields1.map((f) => [f.name, f]));
  const fieldMap2 = new Map(fields2.map((f) => [f.name, f]));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];
  const fieldDiffs = new Map<string, FieldDiff>();

  fieldMap2.forEach((_, name) => {
    if (!fieldMap1.has(name)) {
      added.push(name);
      fieldDiffs.set(name, {
        fieldName: name,
        diffType: 'added',
      });
    }
  });

  fieldMap1.forEach((field1, name) => {
    if (!fieldMap2.has(name)) {
      removed.push(name);
      fieldDiffs.set(name, {
        fieldName: name,
        diffType: 'removed',
      });
    } else {
      const field2 = fieldMap2.get(name)!;
      if (isFieldModified(field1, field2)) {
        modified.push(name);
        fieldDiffs.set(name, {
          fieldName: name,
          diffType: 'modified',
          changes: getFieldChanges(field1, field2),
        });
      } else {
        unchanged.push(name);
        fieldDiffs.set(name, {
          fieldName: name,
          diffType: 'unchanged',
        });
      }
    }
  });

  return {
    added,
    removed,
    modified,
    unchanged,
    fieldDiffs,
  };
};

export const getDiffStyles = (diffType: DiffType): string => {
  switch (diffType) {
    case 'added':
      return 'bg-green-50 border-l-4 border-green-500';
    case 'removed':
      return 'bg-red-50 border-l-4 border-red-500';
    case 'modified':
      return 'bg-yellow-50 border-l-4 border-yellow-500';
    case 'unchanged':
    default:
      return '';
  }
};
