import {
  computed,
  Directive,
  InjectionToken,
  input,
  Type,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { controlState } from './control-state';
import { FieldMeta } from '../core/field-tree';

export type RowView = {
  id: AbstractControl;
  canRemove: boolean;
  remove: () => void;
  fields: FieldView[];
};

export type ArrayView = {
  addFieldText: string;
  canAdd: boolean;
  add: () => void;
  rows: RowView[];
};

export type FieldView = {
  key: string;
  meta: FieldMeta;
  control: AbstractControl | null;
  children: FieldView[];
  array: ArrayView | null;
};

export type FieldComponents = Partial<Record<string, Type<FieldComponent>>>;

export const FIELD_COMPONENTS = new InjectionToken<FieldComponents>(
  'FIELD_COMPONENTS',
);

@Directive()
export abstract class FieldComponent {
  readonly meta = input.required<FieldMeta>();
  readonly control = input<AbstractControl | null>(null);
  readonly children = input<FieldView[]>([]);
  readonly array = input<ArrayView | null>(null);

  protected readonly formControl = computed(
    () => this.control() as FormControl,
  );
  protected readonly state = controlState(this.control);
  protected readonly visibleError = computed(() => {
    const { error, touched } = this.state();
    return touched ? error : null;
  });
}
