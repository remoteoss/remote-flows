import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

/**
 * The acknowledge information fees component props
 */
export type AcknowledgeInformationFeesProps = {
  /**
   * The Zendesk ID for the involuntary offboarding service charge
   */
  involuntaryOffboardingServiceChargeZendeskId: number;
  /**
   * The Zendesk ID for the reconciliation invoice
   */
  reconciliationInvoiceZendeskId: number;
};

export const AcknowledgeInformationFees = ({
  involuntaryOffboardingServiceChargeZendeskId,
  reconciliationInvoiceZendeskId,
}: AcknowledgeInformationFeesProps) => {
  return (
    <p className='RemoteFlows__AcknowledgeInformationFees text-xs text-[#71717A]'>
      You'll receive an{' '}
      <ZendeskTriggerButton
        zendeskId={involuntaryOffboardingServiceChargeZendeskId}
        className='align-baseline'
      >
        involuntary offboarding service charge ↗
      </ZendeskTriggerButton>{' '}
      on your{' '}
      <ZendeskTriggerButton zendeskId={reconciliationInvoiceZendeskId}>
        reconciliation invoice ↗
      </ZendeskTriggerButton>
    </p>
  );
};
