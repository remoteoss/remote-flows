import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';
import { StatementComponentProps } from '@/src/types/fields';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';

const MockStatement = ({ data }: StatementComponentProps) => (
  <div data-testid='mock-statement' data-severity={data.severity}>
    {data.title && <div data-testid='statement-title'>{data.title}</div>}
    <div data-testid='statement-description'>{data.description}</div>
  </div>
);

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        statement: MockStatement,
        text: TextFieldDefault,
      },
    })),
  };
});

const CustomToggle = ({
  setValue,
  value,
  options,
}: JSFCustomComponentProps) => {
  return (
    <div data-testid='custom-toggle' data-value={value || ''}>
      {options?.map((option) => (
        <button
          key={option.value}
          data-testid={`toggle-${option.value}`}
          onClick={() => setValue(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const CustomValueDisplay = ({ value }: JSFCustomComponentProps) => (
  <div data-testid='value-display'>{value || 'empty'}</div>
);

const createToggleField = (overrides = {}) => ({
  name: 'payment_type',
  label: 'Payment Type',
  Component: CustomToggle,
  options: [
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
  ],
  ...overrides,
});

const createFieldsetField = (innerField: Record<string, unknown>) => ({
  name: 'payment_info',
  label: 'Payment Information',
  description: 'Payment details',
  inputType: 'fieldset' as const,
  type: 'fieldset' as const,
  fields: [
    {
      ...innerField,
      inputType: 'text' as const,
      type: 'text' as const,
    },
  ],
  isFlatFieldset: false,
  variant: 'outset' as const,
});

const renderWithForm = (
  fields: Array<Record<string, unknown>>,
  defaultValues: Record<string, unknown> = {},
) => {
  const TestComponent = () => {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <JSONSchemaFormFields fields={fields} />
        <div data-testid='form-value'>{JSON.stringify(methods.watch())}</div>
      </FormProvider>
    );
  };
  return render(<TestComponent />);
};

describe('Custom JSF Component', () => {
  describe.each([
    {
      context: 'at root level',
      defaultValues: { payment_type: '' },
      createFields: (field: Record<string, unknown>) => [field],
    },
    {
      context: 'inside fieldset',
      defaultValues: { payment_info: { payment_type: '' } },
      createFields: (field: Record<string, unknown>) => [
        createFieldsetField(field),
      ],
    },
  ])('setValue $context', ({ defaultValues, createFields }) => {
    it('should update form value when called', async () => {
      const user = userEvent.setup();
      const fields = createFields(createToggleField());

      renderWithForm(fields, defaultValues);

      expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();

      await user.click(screen.getByTestId('toggle-monthly'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('monthly');
      });

      await user.click(screen.getByTestId('toggle-weekly'));

      await waitFor(() => {
        expect(screen.getByTestId('form-value')).toHaveTextContent('weekly');
      });
    });
  });

  describe('value prop', () => {
    it('should pass initial value to custom component', () => {
      const field = createToggleField({
        Component: CustomValueDisplay,
      });

      renderWithForm([field], { payment_type: 'monthly' });

      expect(screen.getByTestId('value-display')).toHaveTextContent('monthly');
    });

    it('should pass empty value when no default', () => {
      const field = createToggleField({
        Component: CustomValueDisplay,
      });

      renderWithForm([field], { payment_type: '' });

      expect(screen.getByTestId('value-display')).toHaveTextContent('empty');
    });

    it('should update value prop when form changes', async () => {
      const user = userEvent.setup();
      const field = createToggleField();

      renderWithForm([field], { payment_type: '' });

      expect(screen.getByTestId('custom-toggle')).toHaveAttribute(
        'data-value',
        '',
      );

      await user.click(screen.getByTestId('toggle-monthly'));

      await waitFor(() => {
        expect(screen.getByTestId('custom-toggle')).toHaveAttribute(
          'data-value',
          'monthly',
        );
      });
    });

    it('should reflect value in aria-pressed', async () => {
      const user = userEvent.setup();
      const field = createToggleField();

      renderWithForm([field], { payment_type: 'weekly' });

      expect(screen.getByTestId('toggle-weekly')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByTestId('toggle-monthly')).toHaveAttribute(
        'aria-pressed',
        'false',
      );

      await user.click(screen.getByTestId('toggle-monthly'));

      await waitFor(() => {
        expect(screen.getByTestId('toggle-monthly')).toHaveAttribute(
          'aria-pressed',
          'true',
        );
      });
    });
  });

  describe.each([
    {
      prop: 'statement',
      config: {
        title: 'Important Notice',
        description: 'Please select your preferred payment frequency.',
        severity: 'info',
      },
      verify: () => {
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
      },
    },
    {
      prop: 'extra',
      config: <div data-testid='extra-content'>Additional info here</div>,
      verify: () => {
        expect(screen.getByTestId('extra-content')).toBeInTheDocument();
        expect(screen.getByTestId('extra-content')).toHaveTextContent(
          'Additional info here',
        );
      },
    },
  ])(
    'rendering $prop alongside custom component',
    ({ prop, config, verify }) => {
      it('should render at root level', () => {
        const field = createToggleField({ [prop]: config });

        renderWithForm([field], { payment_type: '' });

        expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();
        verify();
      });

      it('should render inside fieldset', () => {
        const field = createToggleField({ [prop]: config });
        const fields = [createFieldsetField(field)];

        renderWithForm(fields, { payment_info: { payment_type: '' } });

        expect(screen.getByTestId('custom-toggle')).toBeInTheDocument();
        verify();
      });
    },
  );
  describe.each([
    {
      kind: 'custom component',
      createField: (overrides = {}) => createToggleField(overrides),
    },
    {
      kind: 'built-in field',
      createField: (overrides = {}) => ({
        name: 'payment_type',
        label: 'Payment Type',
        inputType: 'text' as const,
        type: 'text' as const,
        jsonType: 'string',
        isVisible: true,
        ...overrides,
      }),
    },
  ])('rendering an HTML string as extra on a $kind', ({ createField }) => {
    const extra =
      'Contact Remote. <a href="https://example.com/help" target="_blank">Learn more.</a><img src="x" onerror="alert(1)">';

    const verify = () => {
      const link = screen.getByRole('link', { name: 'Learn more.' });
      expect(link).toHaveAttribute('href', 'https://example.com/help');
      expect(link).toHaveAttribute('target', '_blank');
      expect(screen.queryByText(/<a href/)).not.toBeInTheDocument();
      expect(document.querySelector('img[onerror]')).not.toBeInTheDocument();
    };

    it('should render the markup, sanitized, at root level', () => {
      renderWithForm([createField({ extra })], { payment_type: '' });

      verify();
    });

    it('should render the markup, sanitized, inside fieldset', () => {
      renderWithForm([createFieldsetField(createField({ extra }))], {
        payment_info: { payment_type: '' },
      });

      verify();
    });

    it('should render the fieldset own extra', () => {
      renderWithForm([{ ...createFieldsetField(createField()), extra }], {
        payment_info: { payment_type: '' },
      });

      verify();
    });
  });
});
