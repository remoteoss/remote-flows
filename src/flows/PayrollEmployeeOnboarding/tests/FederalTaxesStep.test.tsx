import { render, screen } from '@testing-library/react';
import { FederalTaxesStep } from '../components/FederalTaxesStep';
import { buildBag, mockContext, resetFormFields } from './helpers';

vi.mock('../context');
vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return { ...actual, useFormFields: vi.fn() };
});
vi.mock('../components/PayrollEmployeeForm', () => ({
  PayrollEmployeeForm: (props: { defaultValues?: Record<string, unknown> }) => (
    <div
      data-testid='payroll-employee-form'
      data-default={JSON.stringify(props.defaultValues ?? null)}
    />
  ),
}));

beforeEach(resetFormFields);
afterEach(() => vi.clearAllMocks());

describe('FederalTaxesStep', () => {
  it('returns null when not available', () => {
    mockContext(
      buildBag({
        taxStepsAvailability: {
          federal_taxes: {
            isAvailable: false,
            unavailableReason: 'pending_enrollment',
          },
          state_taxes: { isAvailable: true, unavailableReason: null },
        },
      }),
    );
    const { container } = render(<FederalTaxesStep />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the form when available', () => {
    mockContext(
      buildBag({
        initialValues: { federal_taxes: { filing_status: 'single' } },
      }),
    );
    render(<FederalTaxesStep />);
    expect(screen.getByTestId('payroll-employee-form')).toHaveAttribute(
      'data-default',
      JSON.stringify({ filing_status: 'single' }),
    );
  });
});
