import { InjectionToken } from '@angular/core';
import { injectInvoiceSchedule } from './inject-invoice-schedule';

export type InvoiceScheduleBag = ReturnType<typeof injectInvoiceSchedule>;

export type InvoiceScheduleContext = {
  formId: string;
  bag: InvoiceScheduleBag;
};

export const INVOICE_SCHEDULE_CONTEXT =
  new InjectionToken<InvoiceScheduleContext>('INVOICE_SCHEDULE_CONTEXT');
