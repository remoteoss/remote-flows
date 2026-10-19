import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        text: TextFieldDefault,
      },
    })),
  };
});

const extra =
  'Contact Remote. <a href="https://example.com/help" target="_blank">Learn more.</a>';

const textField = (overrides = {}) => ({
  name: 'full_name',
  label: 'Full name',
  inputType: 'text' as const,
  type: 'text' as const,
  jsonType: 'string',
  isVisible: true,
  ...overrides,
});

const renderWithForm = (
  fields: Array<Record<string, unknown>>,
  defaultValues: Record<string, unknown>,
) => {
  const TestComponent = () => {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <JSONSchemaFormFields fields={fields} />
      </FormProvider>
    );
  };
  return render(<TestComponent />);
};

const verifyLink = () => {
  expect(screen.getByRole('link', { name: 'Learn more.' })).toHaveAttribute(
    'href',
    'https://example.com/help',
  );
  expect(screen.queryByText(/<a href/)).not.toBeInTheDocument();
};

describe('JSONSchemaForm - HTML string extra on built-in fields', () => {
  it('should render the markup as a link at root level', () => {
    renderWithForm([textField({ extra })], { full_name: '' });

    verifyLink();
  });

  it('should render the markup as a link inside a fieldset', () => {
    renderWithForm(
      [
        {
          name: 'details',
          label: 'Details',
          inputType: 'fieldset' as const,
          type: 'fieldset' as const,
          fields: [textField({ extra })],
          isFlatFieldset: false,
          variant: 'outset' as const,
        },
      ],
      { details: { full_name: '' } },
    );

    verifyLink();
  });

  it('should render the fieldset own extra as a link', () => {
    renderWithForm(
      [
        {
          name: 'details',
          label: 'Details',
          inputType: 'fieldset' as const,
          type: 'fieldset' as const,
          fields: [textField()],
          extra,
          isFlatFieldset: false,
          variant: 'outset' as const,
        },
      ],
      { details: { full_name: '' } },
    );

    verifyLink();
  });
});
