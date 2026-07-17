import { render, screen } from '@testing-library/react';
import { PersonalDetailsStep } from '../components/PersonalDetailsStep';
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

describe('PersonalDetailsStep', () => {
  it('renders the form with personal_details initialValues', () => {
    mockContext(
      buildBag({
        initialValues: { personal_details: { given_name: 'A' } },
      }),
    );
    render(<PersonalDetailsStep />);
    expect(screen.getByTestId('payroll-employee-form')).toHaveAttribute(
      'data-default',
      JSON.stringify({ given_name: 'A' }),
    );
  });
});
