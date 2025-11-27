import { render, screen, fireEvent } from '@testing-library/react';
import { ContractAmendmentBack } from '../ContractAmendmentBack';
import { useContractAmendmentContext } from '../context';
import { useFormFields } from '@/src/context';

// Mock the hooks
vi.mock('../context');
vi.mock('@/src/context');

const mockUseContractAmendmentContext = vi.mocked(useContractAmendmentContext);
const mockUseFormFields = vi.mocked(useFormFields);

describe('ContractAmendmentBack', () => {
  const mockFormId = 'test-form-id';
  const mockBack = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockUseContractAmendmentContext.mockReturnValue({
      formId: mockFormId,
      contractAmendment: {
        back: mockBack,
      } as unknown as ReturnType<
        typeof useContractAmendmentContext
      >['contractAmendment'],
    });

    mockUseFormFields.mockReturnValue({
      components: {},
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default behavior (no custom button)', () => {
    it('renders the default Button component with correct attributes and functionality', () => {
      render(
        <ContractAmendmentBack
          disabled
          data-testid='back-button'
          aria-label='Go back'
          className='custom-class'
          onClick={mockOnClick}
        >
          <span>Back Step</span>
        </ContractAmendmentBack>,
      );

      const button = screen.getByRole('button', { name: 'Go back' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('custom-class');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-testid', 'back-button');
      expect(screen.getByText('Back Step')).toBeInTheDocument();
    });

    it('calls back function when clicked', () => {
      render(
        <ContractAmendmentBack onClick={mockOnClick}>
          Back
        </ContractAmendmentBack>,
      );

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls back function even when onClick is not provided', () => {
      render(<ContractAmendmentBack>Back</ContractAmendmentBack>);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom button behavior', () => {
    const CustomButton = vi.fn(({ children, onClick, ...props }) => (
      <button data-testid='custom-button' onClick={onClick} {...props}>
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

    it('renders the custom button component with correct props and functionality', () => {
      render(
        <ContractAmendmentBack
          disabled
          className='custom-class'
          variant='custom'
          data-testid='back-button'
          onClick={mockOnClick}
        >
          Back custom button
        </ContractAmendmentBack>,
      );

      expect(screen.getByTestId('back-button')).toBeInTheDocument();

      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
          className: 'custom-class',
          'data-testid': 'back-button',
          variant: 'custom',
          onClick: expect.any(Function),
          children: 'Back custom button',
        }),
        expect.anything(),
      );
    });

    it('calls back function when custom button is clicked', () => {
      render(
        <ContractAmendmentBack onClick={mockOnClick}>
          Back
        </ContractAmendmentBack>,
      );

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls back function even when onClick is not provided to custom button', () => {
      render(<ContractAmendmentBack>Back</ContractAmendmentBack>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
