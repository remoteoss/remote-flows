import { render, screen, fireEvent } from '@testing-library/react';
import { TerminationBack } from '../TerminationBack';
import { useTerminationContext } from '../context';
import { useFormFields } from '@/src/context';
import { defaultComponents } from '@/src/default-components';
import { defaultComponents as defaultRemoteFlowsComponents } from '@/src/default-components';

// Mock the hooks
vi.mock('../context');
vi.mock('@/src/context');

const mockUseTerminationContext = vi.mocked(useTerminationContext);
const mockUseFormFields = vi.mocked(useFormFields);

describe('TerminationBack', () => {
  const mockFormId = 'test-form-id';
  const mockBack = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockUseTerminationContext.mockReturnValue({
      formId: mockFormId,
      terminationBag: {
        back: mockBack,
      } as unknown as ReturnType<
        typeof useTerminationContext
      >['terminationBag'],
    });

    mockUseFormFields.mockReturnValue({
      components: defaultComponents,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default behavior (no custom button)', () => {
    it('renders the default Button component with correct attributes and functionality', () => {
      render(
        <TerminationBack
          disabled
          data-testid='back-button'
          aria-label='Go back'
          className='custom-class'
          onClick={mockOnClick}
        >
          <span>Back Step</span>
        </TerminationBack>,
      );

      const button = screen.getByRole('button', { name: 'Go back' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('custom-class');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-testid', 'back-button');
      expect(screen.getByText('Back Step')).toBeInTheDocument();
    });

    it('calls back function when clicked', () => {
      render(<TerminationBack onClick={mockOnClick}>Back</TerminationBack>);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls back function even when onClick is not provided', () => {
      render(<TerminationBack>Back</TerminationBack>);

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
          ...defaultRemoteFlowsComponents,
          ...defaultComponents,
          button: CustomButton,
        },
      });
    });

    it('renders the custom button component with correct props and functionality', () => {
      render(
        <TerminationBack
          disabled
          className='custom-class'
          data-testid='back-button'
          onClick={mockOnClick}
          variant='custom'
        >
          Back custom button
        </TerminationBack>,
      );

      expect(screen.getByTestId('back-button')).toBeInTheDocument();

      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: true,
          className: 'custom-class',
          'data-testid': 'back-button',
          onClick: expect.any(Function),
          children: 'Back custom button',
          variant: 'custom',
        }),
        expect.anything(),
      );
    });

    it('calls back function when custom button is clicked', () => {
      render(<TerminationBack onClick={mockOnClick}>Back</TerminationBack>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls back function even when onClick is not provided to custom button', () => {
      render(<TerminationBack>Back</TerminationBack>);

      const button = screen.getByTestId('custom-button');
      fireEvent.click(button);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });
});
