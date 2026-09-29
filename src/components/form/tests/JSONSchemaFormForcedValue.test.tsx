import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { ForcedValueComponentProps } from '@/src/types/fields';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        forcedValue: ({ fieldData }: ForcedValueComponentProps) => (
          <p>{`Forced value: ${fieldData.value}`}</p>
        ),
      },
    })),
  };
});

const schema = {
  type: 'object',
  properties: {
    allowance: {
      title: 'Allowance',
      type: 'integer',
      const: 81257,
      default: 81257,
      'x-jsf-presentation': {
        inputType: 'money',
        currency: 'EUR',
        statement: {
          title: 'Allowance',
          description: 'You need to pay an allowance',
        },
      },
    },
  },
  'x-jsf-order': ['allowance'],
};

describe('JSONSchemaForm - money forced value', () => {
  it('holds a money forced value in major units, like any other money field', async () => {
    const form = createHeadlessForm(schema, {});
    let latestValues: Record<string, unknown> = {};

    const TestComponent = () => {
      const methods = useForm();
      latestValues = methods.watch();

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={form.fields} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    await screen.findByText('Forced value: 812.57');

    await waitFor(() => {
      expect(latestValues).toEqual({ allowance: 812.57 });
    });
  });
});
