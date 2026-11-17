import { render, screen } from '@testing-library/react';
import { AcknowledgeInformationFees } from '../components/AcknowledgeInformation/AcknowledgeInformationFees';

vi.mock('@/src/components/shared/zendesk-drawer/ZendeskTriggerButton', () => ({
  ZendeskTriggerButton: ({ children }: { children: React.ReactNode }) => (
    <button type='button'>{children}</button>
  ),
}));

const zendeskIds = {
  involuntaryOffboardingServiceChargeZendeskId: 1,
  reconciliationInvoiceZendeskId: 2,
};

describe('AcknowledgeInformationFees', () => {
  it.each([false, null, undefined])(
    'shows the offboarding service charge note when the charge is not waived (%s)',
    (isOffboardingServiceChargeWaived) => {
      const { container } = render(
        <AcknowledgeInformationFees
          {...zendeskIds}
          isOffboardingServiceChargeWaived={isOffboardingServiceChargeWaived}
        />,
      );

      expect(container).toHaveTextContent(
        "You'll receive an offboarding service charge (Termination) ↗ on your reconciliation invoice ↗",
      );
      expect(screen.queryByText(/involuntary/i)).not.toBeInTheDocument();
    },
  );

  it('renders nothing when the charge is waived', () => {
    const { container } = render(
      <AcknowledgeInformationFees
        {...zendeskIds}
        isOffboardingServiceChargeWaived
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
