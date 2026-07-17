import { fireEvent, render, screen } from '@testing-library/react';
import { BackButton } from '../components/BackButton';
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

describe('BackButton', () => {
  it('calls back then the consumer onClick on click', () => {
    const back = vi.fn();
    const onClick = vi.fn();
    mockContext(buildBag({ back }));
    render(<BackButton onClick={onClick}>Back</BackButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(back).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('still calls back when no onClick is supplied', () => {
    const back = vi.fn();
    mockContext(buildBag({ back }));
    render(<BackButton>Back</BackButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(back).toHaveBeenCalledTimes(1);
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
