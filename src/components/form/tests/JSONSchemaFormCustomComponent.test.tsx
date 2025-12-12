import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(() => ({ components: {} })),
}));

// Mock custom component that uses setValue
const CustomToggle = ({ setValue, options }: JSFCustomComponentProps) => {
  return (
    <div data-testid='custom-toggle'>
      {options?.map((option) => (
        <button
          key={option.value}
          data-testid={`toggle-${option.value}`}
          onClick={() => setValue(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

describe('Custom JSF Component with setValue', () => {
  it('should update form value when custom component calls setValue', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const methods = useForm({
        defaultValues: { payment_type: '' },
      });

      const fields = [
        {
          name: 'payment_type',
          label: 'Payment Type',
          Component: CustomToggle,
          options: [
            { value: 'monthly', label: 'Monthly' },
            { value: 'weekly', label: 'Weekly' },
          ],
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
          <div data-testid='form-value'>{methods.watch('payment_type')}</div>
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Custom component should render
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

    // Initially empty
    expect(screen.getByTestId('form-value')).toHaveTextContent('');

    // Click the monthly button
    await user.click(screen.getByTestId('toggle-monthly'));

    // Form value should update
    await waitFor(() => {
      expect(screen.getByTestId('form-value')).toHaveTextContent('monthly');
    });

    // Click the weekly button
    await user.click(screen.getByTestId('toggle-weekly'));

    // Form value should update again
    await waitFor(() => {
      expect(screen.getByTestId('form-value')).toHaveTextContent('weekly');
    });
  });

  it('should update form value when custom component calls setValue inside a fieldset', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const methods = useForm({
        defaultValues: { payment_info: { payment_type: '' } },
      });

      const fields = [
        {
          name: 'payment_info',
          label: 'Payment Information',
          description: 'Payment details',
          inputType: 'fieldset' as const,
          fields: [
            {
              name: 'payment_type',
              label: 'Payment Type',
              Component: CustomToggle,
              options: [
                { value: 'monthly', label: 'Monthly' },
                { value: 'weekly', label: 'Weekly' },
              ],
              inputType: 'text' as const,
            },
          ],
          isFlatFieldset: false,
          variant: 'outset' as const,
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
          <div data-testid='form-value'>
            {methods.watch('payment_info.payment_type')}
          </div>
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Custom component should render inside fieldset
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

    // Initially empty
    expect(screen.getByTestId('form-value')).toHaveTextContent('');

    // Click the monthly button
    await user.click(screen.getByTestId('toggle-monthly'));

    // Form value should update with nested path
    await waitFor(() => {
      expect(screen.getByTestId('form-value')).toHaveTextContent('monthly');
    });

    // Click the weekly button
    await user.click(screen.getByTestId('toggle-weekly'));

    // Form value should update again
    await waitFor(() => {
      expect(screen.getByTestId('form-value')).toHaveTextContent('weekly');
    });
  });
});
