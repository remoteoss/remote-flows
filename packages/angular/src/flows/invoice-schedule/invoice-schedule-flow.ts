import { Component, inject, input, output } from '@angular/core';
import {
  CreatedInvoiceSchedules,
  injectInvoiceSchedule,
} from './inject-invoice-schedule';

let flowCount = 0;

@Component({
  selector: 'rf-invoice-schedule-flow',
  exportAs: 'rfInvoiceScheduleFlow',
  template: `<ng-content />`,
})
export class InvoiceScheduleFlowComponent {
  readonly employmentId = input.required<string>();
  readonly created = output<CreatedInvoiceSchedules>();
  readonly submitFailed = output<Error>();

  readonly formId = `rf-invoice-schedule-form-${flowCount++}`;
  readonly bag = injectInvoiceSchedule({
    employmentId: this.employmentId,
    onSuccess: (response) => this.created.emit(response),
    onError: (error) => this.submitFailed.emit(error),
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
