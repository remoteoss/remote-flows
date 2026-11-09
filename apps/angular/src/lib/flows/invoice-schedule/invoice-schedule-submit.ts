import { Directive, inject } from '@angular/core';
import { INVOICE_SCHEDULE_CONTEXT } from './invoice-schedule-context';

@Directive({
  selector: 'button[rfInvoiceScheduleSubmit]',
  host: {
    type: 'submit',
    '[attr.form]': 'context.formId',
    '[disabled]': 'context.bag.isSubmitting()',
  },
})
export class InvoiceScheduleSubmitDirective {
  protected readonly context = inject(INVOICE_SCHEDULE_CONTEXT);
}
