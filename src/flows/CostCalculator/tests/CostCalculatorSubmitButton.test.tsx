import { render, screen } from '@testing-library/react';
import { CostCalculatorSubmitButton } from '../CostCalculatorSubmitButton';
import { useCostCalculatorContext } from '../context';
import { useFormFields } from '@/src/context';
import { defaultComponents } from '@/src/default-components';

// Mock the hooks
vi.mock('../context');
vi.mock('@/src/context');

const mockUseCostCalculatorContext = vi.mocked(useCostCalculatorContext);
const mockUseFormFields = vi.mocked(useFormFields);

describe('CostCalculatorSubmitButton', () => {
  const mockFormId = 'test-form-id';

  beforeEach(() => {
    mockUseCostCalculatorContext.mockReturnValue({
      formId: mockFormId,
      form: {} as ReturnType<typeof useCostCalculatorContext>['form'],
      costCalculatorBag: {} as ReturnType<
        typeof useCostCalculatorContext
      >['costCalculatorBag'],
    });

    mockUseFormFields.mockReturnValue({
      components: defaultComponents,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default behavior (no custom button)', () => {
    it('renders the default Button component', () => {
      render(
        <CostCalculatorSubmitButton
          disabled
          data-testid='submit-button'
          aria-label='Submit form'
          className='custom-class'
        >
          <span>Custom Submit Text</span>
        </CostCalculatorSubmitButton>,
      );

      const button = screen.getByRole('button', { name: 'Submit form' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', mockFormId);
      expect(button).toHaveClass('custom-class');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-testid', 'submit-button');
      expect(screen.getByText('Custom Submit Text')).toBeInTheDocument();
    });
  });

  describe('custom button behavior', () => {
    const CustomButton = vi.fn(({ children, ...props }) => (
      <button data-testid='custom-button' {...props}>
        {children}
      </button>
    ));

    beforeEach(() => {
      mockUseFormFields.mockReturnValue({
        components: {
          ...defaultComponents,
          button: CustomButton,
        },
      });
    });

    it('renders the custom button component when provided', () => {
      render(
        <CostCalculatorSubmitButton
          disabled
          className='custom-class'
          data-testid='submit-button'
          onClick={vi.fn()}
          variant='custom'
        >
          Submit custom button
        </CostCalculatorSubmitButton>,
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();

      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          form: mockFormId,
          disabled: true,
          className: 'custom-class',
          'data-testid': 'submit-button',
          variant: 'custom',
          onClick: expect.any(Function),
          children: 'Submit custom button',
        }),
        expect.anything(),
      );
    });
  });
});
