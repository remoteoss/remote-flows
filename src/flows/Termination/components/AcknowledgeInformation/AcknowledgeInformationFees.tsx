import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

/**
 * The acknowledge information fees component props
 */
export type AcknowledgeInformationFeesProps = {
  /**
   * The Zendesk ID for the offboarding service charge (Termination)
   */
  involuntaryOffboardingServiceChargeZendeskId: number;
  /**
   * The Zendesk ID for the reconciliation invoice
   */
  reconciliationInvoiceZendeskId: number;
  /**
   * Whether the offboarding service charge (Termination) is waived for the employment.
   * The note is hidden when it is `true`.
   */
  isOffboardingServiceChargeWaived?: boolean | null;
};

export const AcknowledgeInformationFees = ({
  involuntaryOffboardingServiceChargeZendeskId,
  reconciliationInvoiceZendeskId,
  isOffboardingServiceChargeWaived,
}: AcknowledgeInformationFeesProps) => {
  if (isOffboardingServiceChargeWaived) {
    return null;
  }

  return (
    <p className='RemoteFlows__AcknowledgeInformationFees text-xs text-[#71717A]'>
      You'll receive an{' '}
      <ZendeskTriggerButton
        zendeskId={involuntaryOffboardingServiceChargeZendeskId}
        className='align-baseline'
      >
        offboarding service charge (Termination) ↗
      </ZendeskTriggerButton>{' '}
      on your{' '}
      <ZendeskTriggerButton zendeskId={reconciliationInvoiceZendeskId}>
        reconciliation invoice ↗
      </ZendeskTriggerButton>
    </p>
  );
};
