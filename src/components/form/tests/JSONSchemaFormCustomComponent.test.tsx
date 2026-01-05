import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';
import { StatementComponentProps } from '@/src/types/fields';

// Mock statement component
const MockStatement = ({ data }: StatementComponentProps) => (
  <div data-testid='mock-statement' data-severity={data.severity}>
    {data.title && <div data-testid='statement-title'>{data.title}</div>}
    <div data-testid='statement-description'>{data.description}</div>
  </div>
);

vi.mock('@/src/context', () => ({
  useFormFields: vi.fn(() => ({
    components: {
      statement: MockStatement,
    },
  })),
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

  it('should render statement prop alongside custom component', () => {
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
          statement: {
            title: 'Important Notice',
            description: 'Please select your preferred payment frequency.',
            severity: 'info',
          },
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Custom component should render
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

    // Statement should render alongside the custom component
    expect(screen.getByTestId('mock-statement')).toBeInTheDocument();
    expect(screen.getByTestId('statement-title')).toHaveTextContent(
      'Important Notice',
    );
    expect(screen.getByTestId('statement-description')).toHaveTextContent(
      'Please select your preferred payment frequency.',
    );
    expect(screen.getByTestId('mock-statement')).toHaveAttribute(
      'data-severity',
      'info',
    );
  });

  it('should render extra prop alongside custom component', () => {
    const ExtraContent = () => (
      <div data-testid='extra-content'>Additional info here</div>
    );

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
          extra: <ExtraContent />,
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Custom component should render
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

    // Extra content should render alongside the custom component
    expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    expect(screen.getByTestId('extra-content')).toHaveTextContent(
      'Additional info here',
    );
  });

  it('should render statement prop alongside custom component inside fieldset', () => {
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
              statement: {
                title: 'Fieldset Statement Title',
                description: 'This statement is inside a fieldset.',
                severity: 'warning',
              },
            },
          ],
          isFlatFieldset: false,
          variant: 'outset' as const,
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Custom component should render inside fieldset
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

    // Statement should render alongside the custom component inside fieldset
    expect(screen.getByTestId('mock-statement')).toBeInTheDocument();
    expect(screen.getByTestId('statement-title')).toHaveTextContent(
      'Fieldset Statement Title',
    );
    expect(screen.getByTestId('statement-description')).toHaveTextContent(
      'This statement is inside a fieldset.',
    );
    expect(screen.getByTestId('mock-statement')).toHaveAttribute(
      'data-severity',
      'warning',
    );
  });

  it('should render extra prop alongside custom component inside fieldset', () => {
    const ExtraContent = () => (
      <div data-testid='fieldset-extra'>Fieldset extra content</div>
    );

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
              extra: <ExtraContent />,
            },
          ],
          isFlatFieldset: false,
          variant: 'outset' as const,
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Custom component should render inside fieldset
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

    // Extra content should render alongside the custom component inside fieldset
    expect(screen.getByTestId('fieldset-extra')).toBeInTheDocument();
    expect(screen.getByTestId('fieldset-extra')).toHaveTextContent(
      'Fieldset extra content',
    );
  });
});
