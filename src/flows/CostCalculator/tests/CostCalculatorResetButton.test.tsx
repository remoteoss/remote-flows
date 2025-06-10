import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CostCalculatorResetButton } from '../CostCalculatorResetButton';
import { useCostCalculatorContext } from '../context';
import { useFormFields } from '@/src/context';

// Mock the hooks
vi.mock('../context');
vi.mock('@/src/context');

const mockUseCostCalculatorContext = vi.mocked(useCostCalculatorContext);
const mockUseFormFields = vi.mocked(useFormFields);

describe('CostCalculatorResetButton', () => {
  const mockFormId = 'test-form-id';
  const mockFormReset = vi.fn();
  const mockResetForm = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockUseCostCalculatorContext.mockReturnValue({
      formId: mockFormId,
      form: {
        reset: mockFormReset,
      } as unknown as ReturnType<typeof useCostCalculatorContext>['form'],
      costCalculatorBag: {
        resetForm: mockResetForm,
      } as unknown as ReturnType<
        typeof useCostCalculatorContext
      >['costCalculatorBag'],
    });

    mockUseFormFields.mockReturnValue({
      components: {},
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default behavior (no custom button)', () => {
    it.only('renders the default Button component with correct attributes and functionality', () => {
      render(
        <CostCalculatorResetButton
          disabled
          data-testid="reset-button"
          aria-label="Reset form"
          className="custom-class"
          onClick={mockOnClick}
        >
          <span>Reset Form</span>
        </CostCalculatorResetButton>,
      );

      const button = screen.getByRole('button', { name: 'Reset form' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'reset');
      expect(button).toHaveAttribute('form', mockFormId);
      expect(button).toHaveClass('custom-class');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-testid', 'reset-button');
      expect(screen.getByText('Reset Form')).toBeInTheDocument();
    });

    it.only('calls reset functions when clicked', () => {
      render(
        <CostCalculatorResetButton onClick={mockOnClick}>
          Reset
        </CostCalculatorResetButton>,
      );

      const button = screen.getByRole('button', { name: 'Reset' });
      fireEvent.click(button);

      expect(mockResetForm).toHaveBeenCalledTimes(1);
      expect(mockFormReset).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it.only('calls reset functions even when onClick is not provided', () => {
      render(<CostCalculatorResetButton>Reset</CostCalculatorResetButton>);

      const button = screen.getByRole('button', { name: 'Reset' });
      fireEvent.click(button);

      expect(mockResetForm).toHaveBeenCalledTimes(1);
      expect(mockFormReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom button behavior', () => {
    const CustomButton = vi.fn(({ children, onClick, ...props }) => (
      <button data-testid="custom-button" onClick={onClick} {...props}>
        {children}
      </button>
    ));

    beforeEach(() => {
      mockUseFormFields.mockReturnValue({
        components: {
          button: CustomButton,
        },
      });
    });

    it.only('renders the custom button component with correct props and functionality', () => {
      render(
        <CostCalculatorResetButton
          disabled
          className="custom-class"
          data-testid="reset-button"
          onClick={mockOnClick}
        >
          Reset custom button
        </CostCalculatorResetButton>,
      );

      expect(screen.getByTestId('reset-button')).toBeInTheDocument();

      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          form: mockFormId,
          disabled: true,
          className: 'custom-class',
          'data-testid': 'reset-button',
          type: 'reset',
          onClick: expect.any(Function),
          children: 'Reset custom button',
        }),
        expect.anything(),
      );
    });

    it.only('calls reset functions when custom button is clicked', () => {
      render(
        <CostCalculatorResetButton onClick={mockOnClick}>
          Reset
        </CostCalculatorResetButton>,
      );

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockResetForm).toHaveBeenCalledTimes(1);
      expect(mockFormReset).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it.only('calls reset functions even when onClick is not provided to custom button', () => {
      render(<CostCalculatorResetButton>Reset</CostCalculatorResetButton>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockResetForm).toHaveBeenCalledTimes(1);
      expect(mockFormReset).toHaveBeenCalledTimes(1);
    });
  });
});
