import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { BackButton } from '../components/BackButton';
import { BankAccountStep } from '../components/BankAccountStep';
import { FederalTaxesStep } from '../components/FederalTaxesStep';
import { HomeAddressStep } from '../components/HomeAddressStep';
import { PersonalDetailsStep } from '../components/PersonalDetailsStep';
import { StateTaxesStep } from '../components/StateTaxesStep';
import { SubmitButton } from '../components/SubmitButton';
import { useEmployeeStepSubmitHandler } from '../components/useEmployeeStepSubmitHandler';
import { usePayrollEmployeeOnboardingContext } from '../context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

vi.mock('../context');
vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return { ...actual, useFormFields: vi.fn() };
});
// Stub the form renderer — its real implementation pulls in react-hook-form
// resolvers we don't need to exercise here; the step components' branch
// behaviour is what we're after.
vi.mock('../components/PayrollEmployeeForm', () => ({
  PayrollEmployeeForm: (props: { defaultValues?: Record<string, unknown> }) => (
    <div
      data-testid='payroll-employee-form'
      data-default={JSON.stringify(props.defaultValues ?? null)}
    />
  ),
}));

const mockUseCtx = vi.mocked(usePayrollEmployeeOnboardingContext);
const mockUseFormFields = vi.mocked(useFormFields);

type Bag = ReturnType<
  typeof usePayrollEmployeeOnboardingContext
>['employeeBag'];

function buildBag(overrides: Partial<Bag> = {}): Bag {
  return {
    isSubmitting: false,
    selfOnboardingSubsteps: [],
    initialValues: undefined,
    goToPreviousStep: vi.fn(),
    goToNextStep: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ data: 'ok' }),
    taxStepsAvailability: {
      federal_taxes: { isAvailable: true, unavailableReason: null },
      state_taxes: { isAvailable: true, unavailableReason: null },
    },
    ...overrides,
  } as unknown as Bag;
}

function mockContext(bag: Bag, formId = 'form-id') {
  mockUseCtx.mockReturnValue({ formId, employeeBag: bag });
}

beforeEach(() => {
  mockUseFormFields.mockReturnValue({ components: { button: ButtonDefault } });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SubmitButton', () => {
  it('forwards form id and disables when bag.isSubmitting is true', () => {
    mockContext(buildBag({ isSubmitting: true }));
    render(<SubmitButton>Save</SubmitButton>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('form', 'form-id');
  });

  it('respects explicit disabled prop when isSubmitting is false', () => {
    mockContext(buildBag({ isSubmitting: false }));
    render(<SubmitButton disabled>Save</SubmitButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('throws when no button component is configured', () => {
    mockContext(buildBag());
    mockUseFormFields.mockReturnValue({
      components: {} as ReturnType<typeof useFormFields>['components'],
    });
    expect(() => render(<SubmitButton>Save</SubmitButton>)).toThrow(
      /Button component not found/,
    );
  });
});

describe('BackButton', () => {
  it('calls goToPreviousStep then the consumer onClick on click', () => {
    const goToPreviousStep = vi.fn();
    const onClick = vi.fn();
    mockContext(buildBag({ goToPreviousStep }));
    render(<BackButton onClick={onClick}>Back</BackButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(goToPreviousStep).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('still calls goToPreviousStep when no onClick is supplied', () => {
    const goToPreviousStep = vi.fn();
    mockContext(buildBag({ goToPreviousStep }));
    render(<BackButton>Back</BackButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(goToPreviousStep).toHaveBeenCalledTimes(1);
  });

  it('throws when no button component is configured', () => {
    mockContext(buildBag());
    mockUseFormFields.mockReturnValue({
      components: {} as ReturnType<typeof useFormFields>['components'],
    });
    expect(() => render(<BackButton>Back</BackButton>)).toThrow(
      /Button component not found/,
    );
  });
});

describe('PersonalDetailsStep / HomeAddressStep', () => {
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

describe('FederalTaxesStep / StateTaxesStep', () => {
  it('FederalTaxesStep returns null when not available', () => {
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

  it('FederalTaxesStep renders the form when available', () => {
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

  it('StateTaxesStep returns null when not available (e.g. no_jurisdiction)', () => {
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

  it('StateTaxesStep renders the form when available', () => {
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

describe('useEmployeeStepSubmitHandler', () => {
  it('calls onSubmit, bag.onSubmit, onSuccess, then advances', async () => {
    const goToNextStep = vi.fn();
    const bagOnSubmit = vi.fn().mockResolvedValue({ id: '1' });
    mockContext(buildBag({ onSubmit: bagOnSubmit, goToNextStep }));

    const onSubmit = vi.fn();
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEmployeeStepSubmitHandler({ onSubmit, onSuccess, onError }),
    );
    await result.current({ a: 1 });
    expect(onSubmit).toHaveBeenCalledWith({ a: 1 });
    expect(bagOnSubmit).toHaveBeenCalledWith({ a: 1 });
    expect(onSuccess).toHaveBeenCalledWith({ id: '1' });
    expect(goToNextStep).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes mutation-shaped errors through onError without advancing', async () => {
    const goToNextStep = vi.fn();
    const mutationErr = {
      error: new Error('boom'),
      rawError: { message: 'boom' },
      normalizedErrors: {},
      fieldErrors: [{ field: 'x', messages: ['bad'] }],
    };
    const bagOnSubmit = vi.fn().mockRejectedValue(mutationErr);
    mockContext(buildBag({ onSubmit: bagOnSubmit, goToNextStep }));

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEmployeeStepSubmitHandler({ onError }),
    );
    await result.current({});
    expect(onError).toHaveBeenCalledWith({
      error: mutationErr.error,
      rawError: mutationErr.rawError,
      fieldErrors: mutationErr.fieldErrors,
    });
    expect(goToNextStep).not.toHaveBeenCalled();
  });

  it('falls back to plain-error shape when error is not a MutationError', async () => {
    const plainErr = new Error('plain');
    const bagOnSubmit = vi.fn().mockRejectedValue(plainErr);
    mockContext(buildBag({ onSubmit: bagOnSubmit }));

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEmployeeStepSubmitHandler({ onError }),
    );
    await result.current({});
    expect(onError).toHaveBeenCalledWith({
      error: plainErr,
      rawError: plainErr,
      fieldErrors: [],
    });
  });
});
