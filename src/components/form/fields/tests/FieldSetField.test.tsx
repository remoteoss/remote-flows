import { render, screen } from '@testing-library/react';
import { FieldSetField, FieldSetProps } from '../FieldSetField';
import { FormProvider, useForm } from 'react-hook-form';

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(),
}));

const defaultProps = {
  name: 'test-fieldset',
  title: 'Test Fieldset',
  fields: [],
  label: 'Test Fieldset',
  description: 'Test Description',
  components: {},
  isFlatFieldset: false,
  variant: 'outset' as const,
};

const renderWithFormContext = (
  props: Partial<FieldSetProps> = defaultProps,
) => {
  const TestComponent = () => {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <FieldSetField {...defaultProps} {...props} />
      </FormProvider>
    );
  };

  return render(<TestComponent />);
};

describe('FieldSetField', () => {
  it('renders with default variant (outset)', () => {
    renderWithFormContext();

    // Title should be in legend
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveTextContent('Test Fieldset');
  });

  it('renders with inset variant', () => {
    renderWithFormContext({
      variant: 'inset',
    });

    // Title should be inside fieldset as heading
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveTextContent('Test Fieldset');
    expect(screen.getByRole('heading')).toHaveTextContent('Test Fieldset');
  });
});
