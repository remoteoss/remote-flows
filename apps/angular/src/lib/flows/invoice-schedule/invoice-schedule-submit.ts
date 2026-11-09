import { Directive } from '@angular/core';
import { injectInvoiceScheduleFlow } from './invoice-schedule-flow';

@Directive({
  selector: 'button[rfInvoiceScheduleSubmit]',
  host: {
    type: 'submit',
    '[attr.form]': 'flow.formId',
    '[disabled]': 'flow.bag.isSubmitting()',
  },
})
export class InvoiceScheduleSubmitDirective {
  protected readonly flow = injectInvoiceScheduleFlow();
}
