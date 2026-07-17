import { render, screen } from '@testing-library/react';
import { HomeAddressStep } from '../components/HomeAddressStep';
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

describe('HomeAddressStep', () => {
  it('renders the form with home_address initialValues', () => {
    mockContext(
      buildBag({ initialValues: { home_address: { city: 'Lagos' } } }),
    );
    render(<HomeAddressStep />);
    expect(screen.getByTestId('payroll-employee-form')).toHaveAttribute(
      'data-default',
      JSON.stringify({ city: 'Lagos' }),
    );
  });
});
