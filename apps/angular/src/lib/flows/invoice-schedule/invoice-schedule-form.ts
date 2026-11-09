import { Component } from '@angular/core';
import { FieldOutlet } from '../../forms/field-outlet';
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

  protected submit(event: Event) {
    event.preventDefault();
    void this.flow.bag.onSubmit();
  }
}
