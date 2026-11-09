import { Component, inject, input } from '@angular/core';
import { injectInvoiceSchedule } from './inject-invoice-schedule';
import { INVOICE_SCHEDULE_CONTEXT } from './invoice-schedule-context';

let flowCount = 0;

@Component({
  selector: 'rf-invoice-schedule-flow',
  exportAs: 'rfInvoiceScheduleFlow',
  template: `<ng-content />`,
  providers: [
    {
      provide: INVOICE_SCHEDULE_CONTEXT,
      useFactory: () => {
        const flow = inject(InvoiceScheduleFlowComponent);
        return { formId: flow.formId, bag: flow.bag };
      },
    },
  ],
})
export class InvoiceScheduleFlowComponent {
  readonly employmentId = input.required<string>();

  readonly formId = `rf-invoice-schedule-form-${flowCount++}`;
  readonly bag = injectInvoiceSchedule({ employmentId: this.employmentId });
}
