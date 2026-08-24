/**
 * Invoice schedule status values
 * Based on ContractorInvoiceScheduleStatus from the API
 */
export const INVOICE_SCHEDULE_STATUS = {
  PENDING_CONTRACTOR_ACTION: 'pending_contractor_action',
  PROCESSING: 'processing',
  PENDING_COMPANY_ACTION: 'pending_company_action',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  GENERATION_FAILED_UNRELATED_TO_WITHDRAWAL_METHOD:
    'generation_failed_unrelated_to_withdrawal_method',
  DELETED: 'deleted',
} as const;
