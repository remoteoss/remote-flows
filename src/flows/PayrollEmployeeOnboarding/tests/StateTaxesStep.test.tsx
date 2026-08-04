import { render, screen } from '@testing-library/react';
import { StateTaxesStep } from '../components/StateTaxesStep';
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

describe('StateTaxesStep', () => {
  it('returns null when not available (e.g. no_jurisdiction)', () => {
    mockContext(
      buildBag({
        taxStepsAvailability: {
          federal_taxes: { isAvailable: true, unavailableReason: null },
          state_taxes: {
            isAvailable: false,
            unavailableReason: 'no_jurisdiction',
          },
        },
      }),
    );
    const { container } = render(<StateTaxesStep />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the form when available', () => {
    mockContext(
      buildBag({
        initialValues: { state_taxes: { filing_status: 'single' } },
      }),
    );
    render(<StateTaxesStep />);
    expect(screen.getByTestId('payroll-employee-form')).toHaveAttribute(
      'data-default',
      JSON.stringify({ filing_status: 'single' }),
    );
  });
});
