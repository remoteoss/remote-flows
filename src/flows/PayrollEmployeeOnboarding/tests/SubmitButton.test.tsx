import { render, screen } from '@testing-library/react';
import { SubmitButton } from '../components/SubmitButton';
import { useFormFields } from '@/src/context';
import {
  buildBag,
  mockContext,
  mockUseFormFields,
  resetFormFields,
} from './helpers';

vi.mock('../context');
vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return { ...actual, useFormFields: vi.fn() };
});

beforeEach(resetFormFields);
afterEach(() => vi.clearAllMocks());

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
