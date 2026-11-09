import { Directive, InjectionToken, input, Type } from '@angular/core';

export type FieldOption = { value: string; label: string };

export type FieldBinding = {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
};

export type FieldState = {
  error: string | null;
  invalid: boolean;
  touched: boolean;
};

export type FieldStatement = {
  title: string | null;
  description: string | null;
  severity: string;
};

export type FieldData = {
  label: string;
  hideLabel: boolean;
  description: string | null;
  inputType: string;
  required: boolean;
  options: FieldOption[];
  additionalProps: Record<string, unknown>;
  statement: FieldStatement | null;
};

export type GroupArrayRow = {
  id: number;
  index: number;
  canRemove: boolean;
  remove: () => void;
  fields: FieldView[];
};

export type GroupArrayView = {
  addFieldText: string;
  canAdd: boolean;
  add: () => void;
  rows: GroupArrayRow[];
};

export type FieldView = {
  key: string;
  field: FieldBinding;
  fieldState: FieldState;
  fieldData: FieldData;
  children: FieldView[];
  group: GroupArrayView | null;
};

export type FieldComponents = Partial<Record<string, Type<FieldComponent>>>;

export const FIELD_COMPONENTS = new InjectionToken<FieldComponents>(
  'FIELD_COMPONENTS',
);

@Directive()
export abstract class FieldComponent {
  readonly field = input.required<FieldBinding>();
  readonly fieldState = input.required<FieldState>();
  readonly fieldData = input.required<FieldData>();
  readonly children = input<FieldView[]>([]);
  readonly group = input<GroupArrayView | null>(null);
}
