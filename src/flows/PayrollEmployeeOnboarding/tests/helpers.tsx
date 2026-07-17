import { usePayrollEmployeeOnboardingContext } from '../context';
import { useFormFields } from '@/src/context';
import { ButtonDefault } from '@/src/components/form/fields/default/ButtonDefault';

export const mockUseCtx = vi.mocked(usePayrollEmployeeOnboardingContext);
export const mockUseFormFields = vi.mocked(useFormFields);

export type Bag = ReturnType<
  typeof usePayrollEmployeeOnboardingContext
>['employeeBag'];

export function buildBag(overrides: Partial<Bag> = {}): Bag {
  return {
    isSubmitting: false,
    selfOnboardingSubsteps: [],
    initialValues: undefined,
    stepState: { values: null },
    back: vi.fn(),
    next: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ data: 'ok' }),
    taxStepsAvailability: {
      federal_taxes: { isAvailable: true, unavailableReason: null },
      state_taxes: { isAvailable: true, unavailableReason: null },
    },
    ...overrides,
  } as unknown as Bag;
}

export function mockContext(bag: Bag, formId = 'form-id') {
  mockUseCtx.mockReturnValue({ formId, employeeBag: bag });
}

/** Default form-fields mock (a working button). Call from a `beforeEach`. */
export function resetFormFields() {
  mockUseFormFields.mockReturnValue({ components: { button: ButtonDefault } });
}
