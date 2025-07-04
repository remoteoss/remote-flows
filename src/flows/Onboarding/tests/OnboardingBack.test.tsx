/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { fireEvent, render, screen } from '@testing-library/react';
import { OnboardingBack } from '../components/OnboardingBack';

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
        isEmploymentReadOnly: false,
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

  it('passes all props (standard and custom) to custom button component', () => {
    const CustomButton = vi
      .fn()
      .mockImplementationOnce(
        ({
          children,
          size,
          variant,
          intent,
          onClick,
          disabled,
          className,
          type,
          ...props
        }) => (
          <button
            data-testid="custom-button"
            onClick={onClick}
            disabled={disabled}
            className={className}
            type={type}
            data-size={size}
            data-variant={variant}
            data-intent={intent}
            {...props}
          >
            {children}
          </button>
        ),
      );

    (useFormFields as any).mockReturnValue({
      components: { button: CustomButton },
    });

    render(
      <OnboardingBack
        onClick={mockOnClick}
        disabled={false}
        className="custom-class"
        type="button"
        variant="outline"
        size="lg"
        intent="secondary"
        data-analytics="back-button"
      >
        Go Back
      </OnboardingBack>,
    );

    // Verify all props are passed to the custom button component
    expect(CustomButton).toHaveBeenCalledWith(
      expect.objectContaining({
        children: 'Go Back',
        onClick: expect.any(Function),
        disabled: false,
        className: 'custom-class',
        type: 'button',
        variant: 'outline',
        size: 'lg',
        intent: 'secondary',
        'data-analytics': 'back-button',
      }),
      {},
    );

    // Verify DOM attributes are properly set
    const button = screen.getByTestId('custom-button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-intent', 'secondary');
    expect(button).toHaveAttribute('data-analytics', 'back-button');

    // Verify onClick functionality works
    fireEvent.click(button);
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  describe('when employment is readonly', () => {
    const mockBack = vi.fn();
    const mockOnClick = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      (useOnboardingContext as any).mockReturnValue({
        onboardingBag: {
          back: mockBack,
          isEmploymentReadOnly: true,
        },
      });
      (useFormFields as any).mockReturnValue({ components: {} });
    });

    it('should not call mockBack', () => {
      render(<OnboardingBack onClick={mockOnClick}>Go Back</OnboardingBack>);

      const button = screen.getByRole('button', { name: 'Go Back' });
      fireEvent.click(button);

      expect(mockBack).not.toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('works with custom button component when employment is readonly', () => {
      const CustomButton = vi
        .fn()
        .mockImplementation(({ children, onClick }) => (
          <button data-testid="custom-button" onClick={onClick}>
            {children}
          </button>
        ));

      (useFormFields as any).mockReturnValue({
        components: { button: CustomButton },
      });

      render(<OnboardingBack onClick={mockOnClick}>Go Back</OnboardingBack>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockBack).not.toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });
  });
});
