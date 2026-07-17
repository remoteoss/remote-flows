import { render, screen } from '@testing-library/react';
import { BankAccountStep } from '../components/BankAccountStep';
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

describe('BankAccountStep', () => {
  it('returns null when bank substep is NOT required', () => {
    mockContext(buildBag({ selfOnboardingSubsteps: [] }));
    const { container } = render(<BankAccountStep />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the form when employee_provides_bank_details is in substeps', () => {
    mockContext(
      buildBag({
        selfOnboardingSubsteps: [
          {
            id: 'employee_provides_bank_details',
            type: 'employee_provides_bank_details',
            label: 'Bank account',
            status: 'not_started',
            optional: false,
          },
        ],
        initialValues: { bank_account: { iban: 'XX' } },
      }),
    );
    render(<BankAccountStep />);
    expect(screen.getByTestId('payroll-employee-form')).toHaveAttribute(
      'data-default',
      JSON.stringify({ iban: 'XX' }),
    );
  });
});
