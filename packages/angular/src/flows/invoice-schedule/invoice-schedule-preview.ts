import { Directive, output } from '@angular/core';
import { injectInvoiceScheduleFlow } from './invoice-schedule-flow';
import type { InvoiceSchedulePreview } from './inject-invoice-schedule';

@Directive({
  selector: 'button[rfInvoiceSchedulePreview]',
  host: {
    type: 'button',
    '[disabled]': 'flow.bag.isPreviewing() || flow.bag.isSubmitting()',
    '(click)': 'preview()',
  },
})
export class InvoiceSchedulePreviewDirective {
  protected readonly flow = injectInvoiceScheduleFlow();

  readonly previewed = output<InvoiceSchedulePreview>();
  readonly previewFailed = output<Error>();

  protected async preview() {
    const result = await this.flow.bag.previewInvoice();
    if (result.status === 'previewed') {
      this.previewed.emit(result.preview);
    }
    if (result.status === 'failed') {
      this.previewFailed.emit(result.error);
    }
  }
}
