import { Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {
  FieldComponent,
  FieldComponents,
} from '../remote-flows/field-contract';
import { FieldOutlet } from '../remote-flows/field-outlet';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="rf-full">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [type]="htmlType()"
        [attr.inputmode]="inputMode()"
        [attr.aria-required]="meta().required"
        [formControl]="formControl()"
      />
      @if (currency(); as code) {
        <span matTextSuffix>{{ code }}&nbsp;</span>
      }
      @if (meta().description; as description) {
        <mat-hint [innerHTML]="description"></mat-hint>
      }
      @if (visibleError(); as error) {
        <mat-error>{{ error }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class InputField extends FieldComponent {
  protected readonly label = computed(
    () => this.meta().label + (this.meta().required ? ' *' : ''),
  );
  protected readonly htmlType = computed(() =>
    this.meta().inputType === 'date' ? 'date' : 'text',
  );
  protected readonly inputMode = computed(() =>
    ['money', 'number'].includes(this.meta().inputType) ? 'decimal' : null,
  );
  protected readonly currency = computed(() =>
    this.meta().inputType === 'money'
      ? ((this.meta().additionalProps['currency'] as string | null) ?? null)
      : null,
  );
}

@Component({
  selector: 'app-textarea-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="rf-full">
      <mat-label>{{ label() }}</mat-label>
      <textarea
        matInput
        rows="3"
        [attr.aria-required]="meta().required"
        [formControl]="formControl()"
      ></textarea>
      @if (meta().description; as description) {
        <mat-hint [innerHTML]="description"></mat-hint>
      }
      @if (visibleError(); as error) {
        <mat-error>{{ error }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class TextareaField extends FieldComponent {
  protected readonly label = computed(
    () => this.meta().label + (this.meta().required ? ' *' : ''),
  );
}

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="rf-full">
      <mat-label>{{ label() }}</mat-label>
      <mat-select
        [attr.aria-required]="meta().required"
        [formControl]="formControl()"
      >
        @if (!meta().required) {
          <mat-option value="">None</mat-option>
        }
        @for (option of meta().options; track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
      @if (meta().description; as description) {
        <mat-hint [innerHTML]="description"></mat-hint>
      }
      @if (visibleError(); as error) {
        <mat-error>{{ error }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class SelectField extends FieldComponent {
  protected readonly label = computed(
    () => this.meta().label + (this.meta().required ? ' *' : ''),
  );
}

let radioCount = 0;

@Component({
  selector: 'app-radio-field',
  imports: [ReactiveFormsModule, MatRadioModule],
  template: `
    <div class="rf-radio">
      <div class="rf-radio__label" [id]="labelId">{{ meta().label }}</div>
      <mat-radio-group
        [attr.aria-labelledby]="labelId"
        [formControl]="formControl()"
        (change)="formControl().markAsTouched()"
      >
        @for (option of meta().options; track option.value) {
          <mat-radio-button [value]="option.value">{{
            option.label
          }}</mat-radio-button>
        }
      </mat-radio-group>
      @if (visibleError(); as error) {
        <p class="rf-error" role="alert">{{ error }}</p>
      }
    </div>
  `,
})
export class RadioField extends FieldComponent {
  protected readonly labelId = `rf-radio-label-${radioCount++}`;
}

@Component({
  selector: 'app-statement-field',
  template: `
    @if (meta().statement; as statement) {
      <div class="rf-statement" [attr.data-severity]="statement.severity">
        @if (statement.title) {
          <strong>{{ statement.title }}</strong>
        }
        @if (statement.description) {
          <span [innerHTML]="statement.description"></span>
        }
      </div>
    }
  `,
})
export class StatementField extends FieldComponent {}

@Component({
  selector: 'app-fieldset-field',
  imports: [FieldOutlet],
  template: `
    <fieldset class="rf-fieldset">
      <legend>{{ meta().label }}</legend>
      @for (child of children(); track child.key) {
        <rf-field [view]="child" />
      }
    </fieldset>
  `,
})
export class FieldsetField extends FieldComponent {}

@Component({
  selector: 'app-group-array-field',
  imports: [FieldOutlet, MatButtonModule],
  template: `
    @if (array(); as array) {
      <section class="rf-group">
        @if (!meta().hideLabel) {
          <h3>{{ meta().label }}</h3>
        }
        @for (row of array.rows; track row.id; let index = $index) {
          <div class="rf-group__row">
            <div class="rf-group__fields">
              @for (child of row.fields; track child.control ?? child.key) {
                <rf-field [view]="child" />
              }
            </div>
            @if (row.canRemove) {
              <button
                mat-stroked-button
                type="button"
                [attr.aria-label]="'Remove item ' + (index + 1)"
                (click)="row.remove()"
              >
                Remove
              </button>
            }
          </div>
        }
        @if (visibleError(); as error) {
          <p class="rf-error" role="alert">{{ error }}</p>
        }
        <button
          mat-stroked-button
          type="button"
          [disabled]="!array.canAdd"
          (click)="array.add()"
        >
          {{ array.addFieldText }}
        </button>
      </section>
    }
  `,
})
export class GroupArrayField extends FieldComponent {}

export const MATERIAL_FIELD_COMPONENTS: FieldComponents = {
  text: InputField,
  email: InputField,
  number: InputField,
  money: InputField,
  date: InputField,
  textarea: TextareaField,
  select: SelectField,
  radio: RadioField,
  statement: StatementField,
  fieldset: FieldsetField,
  'group-array': GroupArrayField,
};
