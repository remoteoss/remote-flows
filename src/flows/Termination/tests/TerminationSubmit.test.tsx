import { render, screen } from '@testing-library/react';
import { TerminationSubmit } from '../TerminationSubmit';
import { useTerminationContext } from '../context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

// Mock the hooks
vi.mock('../context');
vi.mock('@/src/context');

const mockUseTerminationContext = vi.mocked(useTerminationContext);
const mockUseFormFields = vi.mocked(useFormFields);

describe('TerminationSubmit', () => {
  const mockFormId = 'test-form-id';

  beforeEach(() => {
    mockUseTerminationContext.mockReturnValue({
      formId: mockFormId,
      terminationBag: {} as unknown as ReturnType<
        typeof useTerminationContext
      >['terminationBag'],
    });

    mockUseFormFields.mockReturnValue({
      components: {
        button: ButtonDefault,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default behavior (no custom button)', () => {
    it('renders the default Button component with correct attributes and functionality', () => {
      render(
        <TerminationSubmit
          disabled
          data-testid='submit-button'
          aria-label='Submit form'
          className='custom-class'
        >
          <span>Submit Termination</span>
        </TerminationSubmit>,
      );

      const button = screen.getByRole('button', { name: 'Submit form' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('form', mockFormId);
      expect(button).toHaveClass('custom-class');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-testid', 'submit-button');
      expect(screen.getByText('Submit Termination')).toBeInTheDocument();
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
          button: CustomButton,
        },
      });
    });

    it('passes the form prop to the custom button', () => {
      render(
        <TerminationSubmit
          disabled
          className='custom-class'
          data-testid='submit-button'
          aria-label='Submit form'
          onClick={vi.fn()}
          variant='custom'
        >
          Submit
        </TerminationSubmit>,
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();

      expect(CustomButton).toHaveBeenCalledWith(
        expect.objectContaining({
          form: mockFormId,
          disabled: true,
          className: 'custom-class',
          'data-testid': 'submit-button',
          'aria-label': 'Submit form',
          onClick: expect.any(Function),
          children: 'Submit',
          variant: 'custom',
        }),
        expect.anything(),
      );
    });
  });
});
