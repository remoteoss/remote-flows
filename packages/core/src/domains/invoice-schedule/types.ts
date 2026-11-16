/**
 * A draft (non-persisted) contractor invoice preview document.
 *
 * Shared by the in-flow onboarding step and the standalone invoice-schedule screen, so it
 * lives here rather than in either flow — flows must not import from siblings.
 */
export type ContractorInvoicePreview = {
  name: string;
  /**
   * A `data:application/pdf;base64,...` data URI.
   */
  content: string;
};
