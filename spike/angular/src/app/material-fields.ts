import { Component, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FieldComponent, FieldComponents } from './field-contract';
import { FieldOutlet } from './field-outlet';

@Component({
  selector: 'rf-mat-input',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="rf-full">
      <mat-label>{{ fieldData().label }}</mat-label>
      <input
        matInput
        [id]="field().name"
        [type]="htmlType()"
        [required]="fieldData().required"
        [value]="field().value ?? ''"
        [attr.aria-invalid]="fieldState().invalid"
        (input)="field().onChange($any($event.target).value)"
        (blur)="field().onBlur()"
      />
      @if (currency(); as code) {
        <span matTextSuffix>{{ code }}&nbsp;</span>
      }
      @if (fieldData().description; as description) {
        <mat-hint [innerHTML]="description"></mat-hint>
      }
      @if (fieldState().error; as error) {
        <p class="rf-error" role="alert">{{ error }}</p>
      }
    </mat-form-field>
  `,
})
export class MaterialInputField extends FieldComponent {
  protected readonly htmlType = computed(() => {
    const type = this.fieldData().inputType;
    return type === 'money' ? 'number' : type;
  });
  protected readonly currency = computed(() =>
    this.fieldData().inputType === 'money'
      ? ((this.fieldData().additionalProps['currency'] as string | null) ??
        null)
      : null,
  );
}

@Component({
  selector: 'rf-mat-textarea',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="rf-full">
      <mat-label>{{ fieldData().label }}</mat-label>
      <textarea
        matInput
        rows="3"
        [value]="field().value ?? ''"
        [attr.aria-invalid]="fieldState().invalid"
        (input)="field().onChange($any($event.target).value)"
        (blur)="field().onBlur()"
      ></textarea>
      @if (fieldData().description; as description) {
        <mat-hint [innerHTML]="description"></mat-hint>
      }
      @if (fieldState().error; as error) {
        <p class="rf-error" role="alert">{{ error }}</p>
      }
    </mat-form-field>
  `,
})
export class MaterialTextareaField extends FieldComponent {}

@Component({
  selector: 'rf-mat-select',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="rf-full">
      <mat-label>{{ fieldData().label }}</mat-label>
      <mat-select
        [required]="fieldData().required"
        [value]="field().value ?? ''"
        [attr.aria-invalid]="fieldState().invalid"
        (selectionChange)="field().onChange($event.value)"
        (closed)="field().onBlur()"
      >
        @if (!fieldData().required) {
          <mat-option value="">None</mat-option>
        }
        @for (option of fieldData().options; track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
      @if (fieldData().description; as description) {
        <mat-hint [innerHTML]="description"></mat-hint>
      }
      @if (fieldState().error; as error) {
        <p class="rf-error" role="alert">{{ error }}</p>
      }
    </mat-form-field>
  `,
})
export class MaterialSelectField extends FieldComponent {}

@Component({
  selector: 'rf-mat-radio',
  imports: [MatRadioModule],
  template: `
    <div class="rf-radio">
      <div class="rf-radio__label">{{ fieldData().label }}</div>
      <mat-radio-group
        [value]="field().value"
        (change)="field().onChange($event.value); field().onBlur()"
      >
        @for (option of fieldData().options; track option.value) {
          <mat-radio-button [value]="option.value">{{
            option.label
          }}</mat-radio-button>
        }
      </mat-radio-group>
      @if (fieldState().error; as error) {
        <p class="rf-error">{{ error }}</p>
      }
    </div>
  `,
})
export class MaterialRadioField extends FieldComponent {}

@Component({
  selector: 'rf-mat-statement',
  template: `
    @if (fieldData().statement; as statement) {
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
export class MaterialStatementField extends FieldComponent {}

@Component({
  selector: 'rf-mat-fieldset',
  imports: [FieldOutlet],
  template: `
    <fieldset class="rf-fieldset">
      <legend>{{ fieldData().label }}</legend>
      @for (child of children(); track child.key) {
        <rf-field [view]="child" />
      }
    </fieldset>
  `,
})
export class MaterialFieldsetField extends FieldComponent {}

@Component({
  selector: 'rf-mat-group-array',
  imports: [FieldOutlet, MatButtonModule],
  template: `
    @if (group(); as group) {
      <section class="rf-group">
        @if (!fieldData().hideLabel) {
          <h3>{{ fieldData().label }}</h3>
        }
        @for (row of group.rows; track row.id) {
          <div class="rf-group__row">
            <div class="rf-group__fields">
              @for (child of row.fields; track child.key) {
                <rf-field [view]="child" />
              }
            </div>
            @if (row.canRemove) {
              <button mat-stroked-button type="button" (click)="row.remove()">
                Remove
              </button>
            }
          </div>
        }
        @if (fieldState().error; as error) {
          <p class="rf-error">{{ error }}</p>
        }
        <button
          mat-stroked-button
          type="button"
          [disabled]="!group.canAdd"
          (click)="group.add()"
        >
          {{ group.addFieldText }}
        </button>
      </section>
    }
  `,
})
export class MaterialGroupArrayField extends FieldComponent {}

export const MATERIAL_FIELD_COMPONENTS: FieldComponents = {
  text: MaterialInputField,
  email: MaterialInputField,
  number: MaterialInputField,
  money: MaterialInputField,
  date: MaterialInputField,
  textarea: MaterialTextareaField,
  select: MaterialSelectField,
  radio: MaterialRadioField,
  statement: MaterialStatementField,
  fieldset: MaterialFieldsetField,
  'group-array': MaterialGroupArrayField,
};
