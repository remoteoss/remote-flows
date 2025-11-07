import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';

type AcknowledgeInformationFeesProps = {
  involuntaryOffboardingServiceChargeZendeskId: number;
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
