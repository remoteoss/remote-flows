import { Component, computed } from '@angular/core';
import { FieldComponent, FieldComponents } from './field-contract';

@Component({
  selector: 'rf-default-input',
  template: `
    <div class="RemoteFlows__TextField__Item">
      <label class="RemoteFlows__TextField__Label" [for]="field().name">
        {{ fieldData().label }}
      </label>
      <input
        class="RemoteFlows__TextField__Input"
        [id]="field().name"
        [type]="type()"
        [value]="field().value ?? ''"
        [attr.aria-invalid]="fieldState().invalid"
        (input)="onInput($event)"
        (blur)="field().onBlur()"
      />
      @if (fieldState().error; as error) {
        <p class="RemoteFlows__TextField__Error">{{ error }}</p>
      }
    </div>
  `,
})
export class DefaultInputField extends FieldComponent {
  protected readonly type = computed(() => this.fieldData().inputType);

  protected onInput(event: Event) {
    this.field().onChange((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'rf-default-select',
  template: `
    <div class="RemoteFlows__SelectField__Item">
      <label class="RemoteFlows__SelectField__Label" [for]="field().name">
        {{ fieldData().label }}
      </label>
      <select
        class="RemoteFlows__SelectField__Input"
        [id]="field().name"
        [attr.aria-invalid]="fieldState().invalid"
        (change)="onChange($event)"
        (blur)="field().onBlur()"
      >
        <option value="">Select...</option>
        @for (option of fieldData().options; track option.value) {
          <option
            [value]="option.value"
            [selected]="option.value === field().value"
          >
            {{ option.label }}
          </option>
        }
      </select>
      @if (fieldState().error; as error) {
        <p class="RemoteFlows__SelectField__Error">{{ error }}</p>
      }
    </div>
  `,
})
export class DefaultSelectField extends FieldComponent {
  protected onChange(event: Event) {
    this.field().onChange((event.target as HTMLSelectElement).value);
  }
}

@Component({
  selector: 'rf-default-checkbox',
  template: `
    <div class="RemoteFlows__CheckboxField__Item">
      <label class="RemoteFlows__CheckboxField__Label">
        <input
          type="checkbox"
          class="RemoteFlows__CheckboxField__Input"
          [checked]="field().value === true"
          (change)="onChange($event)"
          (blur)="field().onBlur()"
        />
        {{ fieldData().label }}
      </label>
      @if (fieldState().error; as error) {
        <p class="RemoteFlows__CheckboxField__Error">{{ error }}</p>
      }
    </div>
  `,
})
export class DefaultCheckboxField extends FieldComponent {
  protected onChange(event: Event) {
    this.field().onChange((event.target as HTMLInputElement).checked);
  }
}

export const DEFAULT_FIELD_COMPONENTS: FieldComponents = {
  text: DefaultInputField,
  email: DefaultInputField,
  number: DefaultInputField,
  select: DefaultSelectField,
  checkbox: DefaultCheckboxField,
};
