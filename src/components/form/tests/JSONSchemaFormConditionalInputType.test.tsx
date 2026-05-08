import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { RadioGroupFieldDefault } from '@/src/components/form/fields/default/RadioGroupFieldDefault';
import { NumberFieldDefault } from '@/src/components/form/fields/default/NumberFieldDefault';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';
import { SelectFieldDefault } from '@/src/components/form/fields/default/SelectFieldDefault';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        radio: RadioGroupFieldDefault,
        number: NumberFieldDefault,
        text: TextFieldDefault,
        select: SelectFieldDefault,
      },
    })),
  };
});

describe('JSONSchemaForm - Conditional inputType Changes', () => {
  it('should render NumberField when field.type changes from hidden to number', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const methods = useForm({
        defaultValues: { choice: 'hidden', value: '30' },
      });

      const choice = methods.watch('choice');

      // Simulate how json-schema-form updates fields based on conditionals
      // Initially: inputType stays 'hidden', but type changes to 'number'
      const fields = [
        {
          name: 'choice',
          label: 'Choice',
          inputType: 'radio' as const,
          type: 'radio',
          isVisible: true,
          jsonType: 'string',
          required: true,
          options: [
            { value: 'hidden', label: 'Hidden' },
            { value: 'number', label: 'Number' },
          ],
        },
        {
          name: 'value',
          label: 'Value',
          // inputType stays at the initial value (this is the bug behavior)
          inputType: 'hidden' as const,
          // type changes based on conditional (this is what we should use)
          type: choice === 'number' ? 'number' : 'hidden',
          isVisible: true,
          jsonType: choice === 'number' ? 'number' : 'string',
          required: choice === 'number',
        },
      ];

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={fields} />
          <div data-testid='current-choice'>{choice}</div>
        </FormProvider>
      );
    };

    render(<TestComponent />);

    // Initially, choice is 'hidden', so value field should be hidden
    expect(screen.queryByLabelText('Value')).not.toBeInTheDocument();
    expect(screen.getByTestId('current-choice')).toHaveTextContent('hidden');

    // Change choice to 'number'
    const numberRadio = screen.getByLabelText('Number');
    await user.click(numberRadio);

    await waitFor(() => {
      expect(screen.getByTestId('current-choice')).toHaveTextContent('number');
    });

    // Now the value field should render as a number input (not hidden)
    // The fix makes it use field.type='number' instead of field.inputType='hidden'
    await waitFor(() => {
      const input = screen.getByLabelText('Value');
      expect(input).toBeInTheDocument();
      // NumberField renders as TextField with proper input, not hidden
      expect(input).not.toHaveAttribute('type', 'hidden');
    });
  });
});
