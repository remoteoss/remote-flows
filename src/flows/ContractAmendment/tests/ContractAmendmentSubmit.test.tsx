import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ContractAmendmentSubmit } from '../ContractAmendmentSubmit';
import { useContractAmendmentContext } from '../context';
import { useFormFields } from '@/src/context';

// Mock the hooks
vi.mock('../context');
vi.mock('@/src/context');

const mockUseContractAmendmentContext = vi.mocked(useContractAmendmentContext);
const mockUseFormFields = vi.mocked(useFormFields);

describe('ContractAmendmentSubmit', () => {
  const mockFormId = 'test-form-id';

  beforeEach(() => {
    mockUseContractAmendmentContext.mockReturnValue({
      formId: mockFormId,
      contractAmendment: {} as unknown as ReturnType<
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
        <ContractAmendmentSubmit
          disabled
          data-testid="submit-button"
          aria-label="Submit form"
          className="custom-class"
        >
          <span>Submit Amendment</span>
        </ContractAmendmentSubmit>,
      );

      const button = screen.getByRole('button', { name: 'Submit form' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('form', mockFormId);
      expect(button).toHaveClass('custom-class');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-testid', 'submit-button');
      expect(screen.getByText('Submit Amendment')).toBeInTheDocument();
    });
  });

  describe('custom button behavior', () => {
    const CustomButton = vi.fn(({ children, ...props }) => (
      <button data-testid="custom-button" {...props}>
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

    it('passes through all props to the custom button', () => {
      render(
        <ContractAmendmentSubmit
          disabled
          className="custom-class"
          data-testid="submit-button"
          aria-label="Submit form"
          onClick={vi.fn()}
        >
          Submit custom button
        </ContractAmendmentSubmit>,
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
          children: 'Submit custom button',
        }),
        expect.anything(),
      );
    });
  });
});
