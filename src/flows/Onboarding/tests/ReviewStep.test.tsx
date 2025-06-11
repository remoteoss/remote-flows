/* eslint-disable @typescript-eslint/no-explicit-any */
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { ReviewStep } from '@/src/flows/Onboarding/ReviewStep';
import { CreditRiskStatus, Employment } from '@/src/flows/Onboarding/types';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the context
vi.mock('@/src/flows/Onboarding/context', () => ({
  useOnboardingContext: vi.fn(),
}));

describe('ReviewStep Component', () => {
  const mockRender = vi.fn();

  const mockOnboardingBag = {
    creditRiskStatus: 'deposit_required' as CreditRiskStatus,
    employment: {
      status: 'created',
    } as Employment,
  };

  const mockCreditScore = {
    showReserveInvoice: false,
    showInviteSuccessful: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockReturnValue(
      <div data-testid="rendered-content">Test Content</div>,
    );

    (useOnboardingContext as any).mockReturnValue({
      onboardingBag: mockOnboardingBag,
      creditScore: mockCreditScore,
    });
  });

  describe('deposit_required scenarios', () => {
    it('should render with creditRiskState "deposit_required" when deposit is required and status allows it', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'deposit_required',
        creditRiskStatus: 'deposit_required',
      });
    });

    it('should not show deposit_required when employment status is "invited"', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: { status: 'invited' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'invite',
        creditRiskStatus: 'deposit_required',
      });
    });

    it('should not show deposit_required when employment status is "created_reserve_paid"', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: { status: 'created_reserve_paid' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'invite',
        creditRiskStatus: 'deposit_required',
      });
    });
  });

  describe('invite scenarios', () => {
    it('should render with creditRiskState "invite" when creditRiskStatus is not in CREDIT_RISK_STATUSES', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'ready',
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'invite',
        creditRiskStatus: 'ready',
      });
    });
  });

  describe('invite_successful scenarios', () => {
    it('should render with creditRiskState "invite_successful" when showInviteSuccessful is true and employment status is in statusesToNotShowDeposit', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: { status: 'invited' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: true,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'invite_successful',
        creditRiskStatus: 'deposit_required',
      });
    });
  });

  describe('edge cases and null scenarios', () => {
    it('should render with creditRiskState null when no conditions are met', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'referred',
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: null,
        creditRiskStatus: 'referred',
      });
    });

    it('should handle missing employment gracefully', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: undefined,
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: null,
        creditRiskStatus: 'deposit_required',
      });
    });

    it('should handle missing employment status gracefully', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: {},
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: null,
        creditRiskStatus: 'deposit_required',
      });
    });

    it('should handle undefined creditRiskStatus', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: undefined,
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: null,
        creditRiskStatus: undefined,
      });
    });
  });

  describe('complex scenarios', () => {
    it('should prioritize deposit_required_successful over deposit_required when showReserveInvoice is true', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'deposit_required',
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: true,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'deposit_required_successful',
        creditRiskStatus: 'deposit_required',
      });
    });

    it('should prioritize invite_successful over invite when showInviteSuccessful is true', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'ready',
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: true,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledWith({
        creditRiskState: 'invite_successful',
        creditRiskStatus: 'ready',
      });
    });

    it('should handle all credit risk statuses correctly', () => {
      const creditRiskStatuses: CreditRiskStatus[] = [
        'not_started',
        'ready',
        'in_progress',
        'referred',
        'fail',
        'deposit_required',
        'no_deposit_required',
      ];

      creditRiskStatuses.forEach((status) => {
        mockRender.mockClear();

        (useOnboardingContext as any).mockReturnValue({
          onboardingBag: {
            creditRiskStatus: status,
            employment: { status: 'created' },
          },
          creditScore: {
            showReserveInvoice: false,
            showInviteSuccessful: false,
          },
        });

        render(<ReviewStep render={mockRender} />);

        let expectedcreditRiskState;
        if (status === 'deposit_required') {
          expectedcreditRiskState = 'deposit_required';
        } else if (status === 'referred') {
          expectedcreditRiskState = null;
        } else {
          expectedcreditRiskState = 'invite';
        }

        expect(mockRender).toHaveBeenCalledWith({
          creditRiskState: expectedcreditRiskState,
          creditRiskStatus: status,
        });
      });
    });
  });

  describe('render prop functionality', () => {
    it('should call the render prop with correct arguments', () => {
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          creditRiskStatus: 'ready',
          employment: { status: 'created' },
        },
        creditScore: {
          showReserveInvoice: false,
          showInviteSuccessful: false,
        },
      });

      render(<ReviewStep render={mockRender} />);

      expect(mockRender).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          creditRiskState: expect.any(String),
          creditRiskStatus: expect.any(String),
        }),
      );
    });

    it('should render the content returned by the render prop', () => {
      mockRender.mockReturnValue(
        <div data-testid="custom-content">Custom Review Content</div>,
      );

      render(<ReviewStep render={mockRender} />);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Review Content')).toBeInTheDocument();
    });

    it('should handle render prop returning null', () => {
      mockRender.mockReturnValue(null);

      const { container } = render(<ReviewStep render={mockRender} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
