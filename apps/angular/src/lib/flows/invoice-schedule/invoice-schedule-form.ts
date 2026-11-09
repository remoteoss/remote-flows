import { Component, inject } from '@angular/core';
import { FieldOutlet } from '../../forms/field-outlet';
import { INVOICE_SCHEDULE_CONTEXT } from './invoice-schedule-context';

@Component({
  selector: 'rf-invoice-schedule-form',
  imports: [FieldOutlet],
  template: `
    <form
      class="rf-form"
      novalidate
      [id]="context.formId"
      (submit)="submit($event)"
    >
      @for (view of context.bag.fields(); track view.key) {
        <rf-field [view]="view" />
      }
    </form>
  `,
})
export class InvoiceScheduleFormComponent {
  protected readonly context = inject(INVOICE_SCHEDULE_CONTEXT);

  protected submit(event: Event) {
    event.preventDefault();
    void this.context.bag.onSubmit();
  }
}
