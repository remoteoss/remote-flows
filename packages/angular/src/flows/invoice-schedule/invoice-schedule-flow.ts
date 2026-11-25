import { Component, inject, input } from '@angular/core';
import type { JSFModify } from '@remoteoss/remote-flows-core';
import { injectInvoiceSchedule } from './inject-invoice-schedule';

let flowCount = 0;

@Component({
  selector: 'rf-invoice-schedule-flow',
  exportAs: 'rfInvoiceScheduleFlow',
  template: `<ng-content />`,
})
export class InvoiceScheduleFlowComponent {
  readonly employmentId = input.required<string>();
  readonly defaultValues = input<Record<string, unknown>>();
  readonly jsfModify = input<JSFModify>();

  readonly formId = `rf-invoice-schedule-form-${flowCount++}`;
  readonly bag = injectInvoiceSchedule({
    employmentId: this.employmentId,
    defaultValues: this.defaultValues,
    jsfModify: this.jsfModify,
  });
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
