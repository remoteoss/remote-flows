/**
 * Thrown by the flow's `onSubmit` when a tax-step PUT fails because the tax
 * task isn't provisioned yet (pending enrollment). The submit handler treats
 * this as an availability change — it neither advances nor surfaces a raw error
 * via `onError` — because the flow already reflects it through
 * `taxStepsAvailability`.
 */
export class TaxPendingEnrollmentError extends Error {
  constructor() {
    super('Tax step is pending enrollment');
    this.name = 'TaxPendingEnrollmentError';
  }
}
