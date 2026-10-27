import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { RadioGroupFieldDefault } from '@/src/components/form/fields/default/RadioGroupFieldDefault';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        radio: RadioGroupFieldDefault,
        text: TextFieldDefault,
      },
    })),
  };
});

const radioField = {
  name: 'contract_duration_type',
  label: 'Contract duration',
  type: 'radio',
  inputType: 'radio',
  options: [
    { value: 'indefinite', label: 'Indefinite' },
    {
      value: 'fixed_term',
      label: 'Fixed term',
      nested_fields: ['occurrences'],
    },
  ],
};

const nestedField = {
  name: 'occurrences',
  label: 'Occurrences',
  type: 'text',
  inputType: 'text',
};

const renderFields = (fields: Array<Record<string, unknown>>) => {
  const TestComponent = () => {
    const methods = useForm({
      defaultValues: { contract_duration_type: '', occurrences: '' },
    });
    return (
      <FormProvider {...methods}>
        <JSONSchemaFormFields fields={fields as never} />
        <div data-testid='form-value'>{JSON.stringify(methods.watch())}</div>
      </FormProvider>
    );
  };
  return render(<TestComponent />);
};

describe('Radio nested_fields', () => {
  it('renders the nested field once, inside its option, disabled until the option is selected', async () => {
    const user = userEvent.setup();
    renderFields([radioField, nestedField]);

    expect(screen.getAllByLabelText('Occurrences')).toHaveLength(1);
    const input = screen.getByLabelText('Occurrences');
    expect(
      input.closest('fieldset.RemoteFlows__RadioField__NestedFields'),
    ).toBeDisabled();
    expect(input).toBeDisabled();

    await user.click(screen.getByLabelText('Fixed term'));
    expect(input).toBeEnabled();

    await user.type(input, '5');
    expect(screen.getByTestId('form-value')).toHaveTextContent(
      '{"contract_duration_type":"fixed_term","occurrences":"5"}',
    );

    await user.click(screen.getByLabelText('Indefinite'));
    expect(input).toBeDisabled();
    expect(screen.getByTestId('form-value')).toHaveTextContent(
      '{"contract_duration_type":"indefinite","occurrences":"5"}',
    );
  });

  it('renders radios without nested_fields as before', () => {
    const plainRadio = {
      ...radioField,
      options: radioField.options.map(({ value, label }) => ({ value, label })),
    };
    renderFields([plainRadio, nestedField]);

    const input = screen.getByLabelText('Occurrences');
    expect(input).toBeEnabled();
    expect(
      input.closest('fieldset.RemoteFlows__RadioField__NestedFields'),
    ).toBeNull();
  });
});
