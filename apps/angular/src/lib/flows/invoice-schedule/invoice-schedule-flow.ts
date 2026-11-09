import { Component, inject, input } from '@angular/core';
import { injectInvoiceSchedule } from './inject-invoice-schedule';

let flowCount = 0;

@Component({
  selector: 'rf-invoice-schedule-flow',
  exportAs: 'rfInvoiceScheduleFlow',
  template: `<ng-content />`,
})
export class InvoiceScheduleFlowComponent {
  readonly employmentId = input.required<string>();

  readonly formId = `rf-invoice-schedule-form-${flowCount++}`;
  readonly bag = injectInvoiceSchedule({ employmentId: this.employmentId });
}

export function injectInvoiceScheduleFlow() {
  const flow = inject(InvoiceScheduleFlowComponent, { optional: true });
  if (!flow) {
    throw new Error(
      'The invoice schedule form and submit button must be used inside <rf-invoice-schedule-flow>',
    );
  }
  return flow;
}
