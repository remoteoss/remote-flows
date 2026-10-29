import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FIELD_COMPONENTS, FieldView } from './field-contract';

@Component({
  selector: 'rf-field',
  imports: [NgComponentOutlet],
  template: `<ng-container
    *ngComponentOutlet="component(); inputs: inputs()"
  />`,
})
export class FieldOutlet {
  readonly view = input.required<FieldView>();

  private readonly components = inject(FIELD_COMPONENTS);

  protected readonly component = computed(() => {
    const { name, fieldData } = this.view();
    const component = this.components[fieldData.inputType];
    if (!component) {
      throw new Error(
        `Component not found for inputType "${fieldData.inputType}" on field ${name}`,
      );
    }
    return component;
  });

  protected readonly inputs = computed(() => {
    const { field, fieldState, fieldData } = this.view();
    return { field, fieldState, fieldData };
  });
}
