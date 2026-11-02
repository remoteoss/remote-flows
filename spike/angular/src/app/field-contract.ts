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

export type FieldData = {
  label: string;
  description: string | null;
  inputType: string;
  required: boolean;
  options: FieldOption[];
};

export type FieldView = {
  name: string;
  field: FieldBinding;
  fieldState: FieldState;
  fieldData: FieldData;
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
}
