import { Component, input, output } from '@angular/core';
import { FieldOutlet } from '../../forms/field-outlet';
import {
  CreatedInvoiceSchedules,
  InvoiceSchedulePayload,
} from './inject-invoice-schedule';
import { injectInvoiceScheduleFlow } from './invoice-schedule-flow';

@Component({
  selector: 'rf-invoice-schedule-form',
  imports: [FieldOutlet],
  template: `
    <form
      class="rf-form"
      novalidate
      [id]="flow.formId"
      (submit)="submit($event)"
    >
      @for (view of flow.bag.fields(); track view.key) {
        <rf-field [view]="view" />
      }
    </form>
  `,
})
export class InvoiceScheduleFormComponent {
  protected readonly flow = injectInvoiceScheduleFlow();

  readonly beforeSubmit =
    input<(payload: InvoiceSchedulePayload) => Promise<void> | void>();
  readonly created = output<CreatedInvoiceSchedules>();
  readonly submitFailed = output<Error>();

  protected async submit(event: Event) {
    event.preventDefault();
    const result = await this.flow.bag.onSubmit({
      beforeSubmit: this.beforeSubmit(),
    });
    if (result.status === 'created') {
      this.created.emit(result.response);
    }
    if (result.status === 'failed') {
      this.submitFailed.emit(result.error);
    }
  }
}
