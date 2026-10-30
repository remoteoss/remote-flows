import { Component } from '@angular/core';
import { FieldComponent } from './field-contract';

@Component({
  selector: 'partner-chip-select',
  template: `
    <fieldset class="PartnerChips">
      <legend>{{ fieldData().label }}</legend>
      @for (option of fieldData().options; track option.value) {
        <button
          type="button"
          class="PartnerChips__Chip"
          [attr.aria-pressed]="option.value === field().value"
          (click)="select(option.value)"
        >
          {{ option.label }}
        </button>
      }
      @if (fieldState().error; as error) {
        <p class="PartnerChips__Error">{{ error }}</p>
      }
    </fieldset>
  `,
})
export class PartnerChipSelect extends FieldComponent {
  protected select(value: string) {
    this.field().onChange(value);
    this.field().onBlur();
  }
}
