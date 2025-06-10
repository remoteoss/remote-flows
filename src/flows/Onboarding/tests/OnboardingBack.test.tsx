/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { fireEvent, render, screen } from '@testing-library/react';
import { OnboardingBack } from '../OnboardingBack';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

vi.mock('@/src/flows/Onboarding/context', () => ({
  useOnboardingContext: vi.fn(),
}));

describe('OnboardingBack Component', () => {
  const mockBack = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOnboardingContext as any).mockReturnValue({
      onboardingBag: {
        back: mockBack,
      },
    });
    (useFormFields as any).mockReturnValue({ components: {} });
  });

  it('renders the default button implementation correctly', () => {
    render(<OnboardingBack onClick={mockOnClick}>Go Back</OnboardingBack>);

    const button = screen.getByRole('button', { name: 'Go Back' });
    expect(button).toBeInTheDocument();
  });

  it('calls back function when default button is clicked', () => {
    render(<OnboardingBack onClick={mockOnClick}>Go Back</OnboardingBack>);

    const button = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(button);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('passes additional props to default button', () => {
    render(
      <OnboardingBack
        onClick={mockOnClick}
        disabled={true}
        className="custom-class"
        type="button"
      >
        Go Back
      </OnboardingBack>,
    );

    const button = screen.getByRole('button', { name: 'Go Back' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders custom button component when provided', () => {
    const CustomButton = vi
      .fn()
      .mockImplementationOnce(({ children }) => (
        <button data-testid="custom-button">{children}</button>
      ));

    (useFormFields as any).mockReturnValue({
      components: { button: CustomButton },
    });

    render(<OnboardingBack onClick={mockOnClick}>Go Back</OnboardingBack>);

    expect(CustomButton).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('calls both back function and onClick when custom button is clicked', () => {
    const CustomButton = vi
      .fn()
      .mockImplementationOnce(({ children, onClick, ...props }) => (
        <button data-testid="custom-button" onClick={onClick} {...props}>
          {children}
        </button>
      ));

    (useFormFields as any).mockReturnValue({
      components: { button: CustomButton },
    });

    render(<OnboardingBack onClick={mockOnClick}>Go Back</OnboardingBack>);

    const customButton = screen.getByTestId('custom-button');
    fireEvent.click(customButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('passes correct props to custom button component', () => {
    const CustomButton = vi
      .fn()
      .mockImplementationOnce(({ children, ...props }) => (
        <button data-testid="custom-button" {...props}>
          {children}
        </button>
      ));

    (useFormFields as any).mockReturnValue({
      components: { button: CustomButton },
    });

    const additionalProps = {
      onClick: mockOnClick,
      disabled: true,
      className: 'custom-class',
      type: 'button' as const,
    };

    render(<OnboardingBack {...additionalProps}>Go Back</OnboardingBack>);

    const call = CustomButton.mock.calls[0][0];
    expect(call.children).toBe('Go Back');
    expect(call.disabled).toBe(true);
    expect(call.className).toBe('custom-class');
    expect(call.type).toBe('button');
    expect(typeof call.onClick).toBe('function');
  });
});
