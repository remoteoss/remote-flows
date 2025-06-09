/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormFields } from '@/src/context';
import { useOnboardingContext } from '@/src/flows/Onboarding/context';
import { fireEvent, render, screen } from '@testing-library/react';
import { OnboardingSubmit } from '../OnboardingSubmit';

// Mock dependencies
vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

vi.mock('@/src/flows/Onboarding/context', () => ({
  useOnboardingContext: vi.fn(),
}));

describe('OnboardingSubmit Component', () => {
  const mockFormId = 'test-form-id';
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOnboardingContext as any).mockReturnValue({
      formId: mockFormId,
      onboardingBag: {},
    });
    (useFormFields as any).mockReturnValue({ components: {} });
  });

  it('renders the default button implementation correctly', () => {
    render(
      <OnboardingSubmit onClick={mockOnClick}>
        Submit Application
      </OnboardingSubmit>,
    );

    const button = screen.getByRole('button', { name: 'Submit Application' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('form', mockFormId);
  });

  it('handles click events on default button', () => {
    render(
      <OnboardingSubmit onClick={mockOnClick}>
        Submit Application
      </OnboardingSubmit>,
    );

    const button = screen.getByRole('button', { name: 'Submit Application' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('passes additional props to default button', () => {
    render(
      <OnboardingSubmit
        onClick={mockOnClick}
        disabled={true}
        className="custom-class"
        type="submit"
      >
        Submit Application
      </OnboardingSubmit>,
    );

    const button = screen.getByRole('button', { name: 'Submit Application' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', mockFormId);
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

    render(
      <OnboardingSubmit onClick={mockOnClick}>
        Submit Application
      </OnboardingSubmit>,
    );

    expect(CustomButton).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    expect(screen.getByText('Submit Application')).toBeInTheDocument();
  });

  it('passes correct props to custom button component', () => {
    const CustomButton = vi
      .fn()
      .mockImplementationOnce(({ children }) => (
        <button data-testid="custom-button">{children}</button>
      ));

    (useFormFields as any).mockReturnValue({
      components: { button: CustomButton },
    });

    const additionalProps = {
      onClick: mockOnClick,
      disabled: true,
      className: 'custom-class',
      type: 'submit' as const,
    };

    render(
      <OnboardingSubmit {...additionalProps}>
        Submit Application
      </OnboardingSubmit>,
    );

    const call = CustomButton.mock.calls[0][0];
    expect(call.form).toBe(mockFormId);
    expect(call.children).toBe('Submit Application');
    expect(call.props).toEqual(additionalProps);
  });

  it('handles custom button component with form interaction correctly', () => {
    const CustomButton = vi
      .fn()
      .mockImplementationOnce(({ form, children, props }) => (
        <button
          data-testid="custom-button"
          form={form}
          onClick={props?.onClick}
        >
          {children}
        </button>
      ));

    (useFormFields as any).mockReturnValue({
      components: { button: CustomButton },
    });

    render(
      <OnboardingSubmit onClick={mockOnClick}>
        Submit Application
      </OnboardingSubmit>,
    );

    const customButton = screen.getByTestId('custom-button');
    expect(customButton).toHaveAttribute('form', mockFormId);

    fireEvent.click(customButton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('works without children', () => {
    render(<OnboardingSubmit onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('form', mockFormId);
  });

  it('works without additional props', () => {
    render(<OnboardingSubmit>Submit</OnboardingSubmit>);

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('form', mockFormId);
  });

  it('handles missing formId gracefully', () => {
    (useOnboardingContext as any).mockReturnValue({
      formId: undefined,
      onboardingBag: {},
    });

    render(<OnboardingSubmit>Submit</OnboardingSubmit>);

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('form');
  });
});
