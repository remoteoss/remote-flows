import type { $TSFixMe, JSFField } from '@/src/types/remoteFlows';
import isEqual from 'lodash.isequal';

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface FieldDiff {
  fieldName: string;
  diffType: DiffType;
  orderChanged?: { oldIndex: number; newIndex: number };
  changes?: {
    label?: { old: string; new: string };
    required?: { old: boolean; new: boolean };
    type?: { old: string; new: string };
    inputType?: { old: string; new: string };
    jsonType?: { old: string; new: string };
    defaultValue?: { old: unknown; new: unknown };
    minDate?: { old: string; new: string };
    maxDate?: { old: string; new: string };
    maxLength?: { old: number; new: number };
    multiple?: { old: boolean; new: boolean };
    isVisible?: { old: boolean; new: boolean };
    options?: {
      added: Array<{ value: string; label: string }>;
      removed: Array<{ value: string; label: string }>;
      modified: Array<{
        value: string;
        changes: { label?: { old: string; new: string } };
      }>;
    };
    nestedFields?: FieldDiff[];
  };
}

export interface FormDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
  reordered: string[];
  fieldDiffs: Map<string, FieldDiff>;
}

const validateField = (field: JSFField): boolean => {
  if (!field.name) {
    console.warn('Field missing required "name" property:', field);
    return false;
  }
  if (!field.type) {
    console.warn(`Field "${field.name}" missing required "type" property`);
    return false;
  }
  return true;
};

const compareOptions = (
  options1: JSFField['options'],
  options2: JSFField['options'],
):
  | {
      added: Array<{ value: string; label: string }>;
      removed: Array<{ value: string; label: string }>;
      modified: Array<{
        value: string;
        changes: { label?: { old: string; new: string } };
      }>;
    }
  | undefined => {
  if (isEqual(options1, options2)) return undefined;

  const map1 = new Map((options1 || []).map((o) => [o.value, o]));
  const map2 = new Map((options2 || []).map((o) => [o.value, o]));

  const added: Array<{ value: string; label: string }> = [];
  const removed: Array<{ value: string; label: string }> = [];
  const modified: Array<{
    value: string;
    changes: { label?: { old: string; new: string } };
  }> = [];

  map2.forEach((option, value) => {
    if (!map1.has(value)) {
      added.push({ value: option.value, label: option.label });
    }
  });

  map1.forEach((option1, value) => {
    if (!map2.has(value)) {
      removed.push({ value: option1.value, label: option1.label });
    } else {
      const option2 = map2.get(value)!;
      if (!isEqual(option1, option2)) {
        const changes: { label?: { old: string; new: string } } = {};
        if (option1.label !== option2.label) {
          changes.label = { old: option1.label, new: option2.label };
        }
        if (Object.keys(changes).length > 0) {
          modified.push({ value, changes });
        }
      }
    }
  });

  if (added.length === 0 && removed.length === 0 && modified.length === 0) {
    return undefined;
  }

  return { added, removed, modified };
};

const compareNestedFields = (
  field1: JSFField,
  field2: JSFField,
): FieldDiff[] | undefined => {
  const nestedFields1 = (field1 as $TSFixMe).fields;

  const nestedFields2 = (field2 as $TSFixMe).fields;

  if (!nestedFields1 && !nestedFields2) return undefined;

  const nestedDiff = compareFormFields(
    nestedFields1 || [],
    nestedFields2 || [],
  );

  const hasChanges =
    nestedDiff.added.length > 0 ||
    nestedDiff.removed.length > 0 ||
    nestedDiff.modified.length > 0 ||
    nestedDiff.reordered.length > 0;

  if (!hasChanges) return undefined;

  return Array.from(nestedDiff.fieldDiffs.values());
};

const isFieldModified = (
  field1: JSFField,
  field2: JSFField,
  index1: number,
  index2: number,
): boolean => {
  if (index1 !== index2) {
    return true;
  }

  // Only compare user-facing schema properties, not internal/computed ones
  // Ignore: schema (Yup), computedAttributes, scopedJsonSchema, errorMessage, meta, description
  // Note: nested fields are checked via compareNestedFields to avoid deep isEqual with problematic properties
  const checks = {
    label: field1.label !== field2.label,
    required: field1.required !== field2.required,
    inputType: field1.inputType !== field2.inputType,
    type: field1.type !== field2.type,
    jsonType: !isEqual(field1.jsonType, field2.jsonType), // Use isEqual since jsonType can be an array like ['string', 'null']
    name: field1.name !== field2.name,
    defaultValue: field1.defaultValue !== field2.defaultValue,
    minDate: field1.minDate !== field2.minDate,
    maxDate: field1.maxDate !== field2.maxDate,
    maxLength: field1.maxLength !== field2.maxLength,
    multiple: field1.multiple !== field2.multiple,
    isVisible: field1.isVisible !== field2.isVisible,
    options: !isEqual(field1.options, field2.options),
  };

  // Check for nested field changes using compareNestedFields to avoid deep isEqual
  const hasNestedChanges = (() => {
    const nestedFields1 = (field1 as $TSFixMe).fields;
    const nestedFields2 = (field2 as $TSFixMe).fields;

    // If both undefined or null, no changes
    if (!nestedFields1 && !nestedFields2) return false;

    // If one is defined and the other isn't, there's a change
    if (!nestedFields1 || !nestedFields2) return true;

    // Recursively compare using our proper comparison logic
    const nestedDiff = compareFormFields(nestedFields1, nestedFields2);
    return (
      nestedDiff.added.length > 0 ||
      nestedDiff.removed.length > 0 ||
      nestedDiff.modified.length > 0 ||
      nestedDiff.reordered.length > 0
    );
  })();

  const isModified =
    Object.values(checks).some((check) => check) || hasNestedChanges;

  return isModified;
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

  if (field1.inputType !== field2.inputType) {
    changes.inputType = {
      old: field1.inputType,
      new: field2.inputType,
    };
  }

  if (!isEqual(field1.jsonType, field2.jsonType)) {
    changes.jsonType = {
      old: field1.jsonType,
      new: field2.jsonType,
    };
  }

  if (!isEqual(field1.defaultValue, field2.defaultValue)) {
    changes.defaultValue = {
      old: field1.defaultValue,
      new: field2.defaultValue,
    };
  }

  if (field1.minDate !== field2.minDate) {
    changes.minDate = {
      old: field1.minDate || '',
      new: field2.minDate || '',
    };
  }

  if (field1.maxDate !== field2.maxDate) {
    changes.maxDate = {
      old: field1.maxDate || '',
      new: field2.maxDate || '',
    };
  }

  if (field1.maxLength !== field2.maxLength) {
    changes.maxLength = {
      old: field1.maxLength || 0,
      new: field2.maxLength || 0,
    };
  }

  if (field1.multiple !== field2.multiple) {
    changes.multiple = {
      old: field1.multiple || false,
      new: field2.multiple || false,
    };
  }

  if (field1.isVisible !== field2.isVisible) {
    changes.isVisible = {
      old: field1.isVisible,
      new: field2.isVisible,
    };
  }

  const optionsDiff = compareOptions(field1.options, field2.options);
  if (optionsDiff) {
    changes.options = optionsDiff;
  }

  const nestedFieldsDiff = compareNestedFields(field1, field2);
  if (nestedFieldsDiff) {
    changes.nestedFields = nestedFieldsDiff;
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
};

export const compareFormFields = (
  fields1: JSFField[] = [],
  fields2: JSFField[] = [],
): FormDiff => {
  const validFields1 = fields1.filter(validateField);
  const validFields2 = fields2.filter(validateField);

  const fieldMap1 = new Map(
    validFields1.map((f, i) => [f.name, { field: f, index: i }]),
  );
  const fieldMap2 = new Map(
    validFields2.map((f, i) => [f.name, { field: f, index: i }]),
  );

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];
  const reordered: string[] = [];
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

  fieldMap1.forEach(({ field: field1, index: index1 }, name) => {
    if (!fieldMap2.has(name)) {
      removed.push(name);
      fieldDiffs.set(name, {
        fieldName: name,
        diffType: 'removed',
      });
    } else {
      const { field: field2, index: index2 } = fieldMap2.get(name)!;

      if (isFieldModified(field1, field2, index1, index2)) {
        const onlyPositionChanged =
          index1 !== index2 && !isFieldModified(field1, field2, index1, index1);

        if (onlyPositionChanged) {
          reordered.push(name);
          fieldDiffs.set(name, {
            fieldName: name,
            diffType: 'unchanged',
            orderChanged: { oldIndex: index1, newIndex: index2 },
          });
        } else {
          modified.push(name);
          fieldDiffs.set(name, {
            fieldName: name,
            diffType: 'modified',
            orderChanged:
              index1 !== index2
                ? { oldIndex: index1, newIndex: index2 }
                : undefined,
            changes: getFieldChanges(field1, field2),
          });
        }
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
    reordered,
    fieldDiffs,
  };
};

export const getDiffStyles = (
  diffType: DiffType,
  hasOrderChange?: boolean,
): string => {
  if (hasOrderChange && diffType === 'unchanged') {
    return 'bg-blue-50 border-l-4 border-blue-500';
  }

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
