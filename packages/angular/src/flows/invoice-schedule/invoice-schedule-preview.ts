import { Directive } from '@angular/core';
import { injectInvoiceScheduleFlow } from './invoice-schedule-flow';

@Directive({
  selector: 'button[rfInvoiceSchedulePreview]',
  host: {
    type: 'button',
    '[disabled]': 'flow.bag.isPreviewing()',
    '(click)': 'flow.bag.previewInvoice()',
  },
})
export class InvoiceSchedulePreviewDirective {
  protected readonly flow = injectInvoiceScheduleFlow();
}
