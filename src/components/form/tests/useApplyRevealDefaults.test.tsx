import { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { RadioGroupFieldDefault } from '@/src/components/form/fields/default/RadioGroupFieldDefault';
import { NumberFieldDefault } from '@/src/components/form/fields/default/NumberFieldDefault';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        radio: RadioGroupFieldDefault,
        number: NumberFieldDefault,
        text: TextFieldDefault,
      },
    })),
  };
});

type Defaults = { choice: string; amount: string };

function TestForm({
  defaultValues,
  withError = false,
}: {
  defaultValues: Defaults;
  withError?: boolean;
}) {
  const methods = useForm({ defaultValues });

  useEffect(() => {
    if (withError) {
      methods.setError('amount', {
        type: 'required',
        message: 'Required field',
      });
    }
  }, [withError, methods]);
  const choice = methods.watch('choice');

  const fields = [
    {
      name: 'choice',
      label: 'Choice',
      inputType: 'radio' as const,
      type: 'radio',
      isVisible: true,
      jsonType: 'string',
      options: [
        { value: 'off', label: 'Off' },
        { value: 'on', label: 'On' },
      ],
    },
    {
      name: 'amount',
      label: 'Amount',
      inputType: 'number' as const,
      type: 'number',
      isVisible: choice === 'on',
      jsonType: 'integer',
      default: 5,
    },
  ];

  return (
    <FormProvider {...methods}>
      <JSONSchemaFormFields fields={fields} />
    </FormProvider>
  );
}

function AsyncLoadedForm() {
  const methods = useForm({ defaultValues: { amount: '' } });
  const [loaded, setLoaded] = useState(false);

  const fields = loaded
    ? [
        {
          name: 'amount',
          label: 'Amount',
          inputType: 'number' as const,
          type: 'number',
          isVisible: true,
          jsonType: 'integer',
          default: 5,
        },
      ]
    : [];

  return (
    <FormProvider {...methods}>
      <button type='button' onClick={() => setLoaded(true)}>
        Load schema
      </button>
      <JSONSchemaFormFields fields={fields} />
    </FormProvider>
  );
}

describe('useApplyRevealDefaults', () => {
  it('fills an empty field with its default when a conditional reveals it', async () => {
    const user = userEvent.setup();
    render(<TestForm defaultValues={{ choice: 'off', amount: '' }} />);

    expect(screen.queryByLabelText('Amount')).toBeNull();

    await user.click(screen.getByRole('radio', { name: 'On' }));

    expect(await screen.findByLabelText('Amount')).toHaveValue('5');
  });

  it('drops a stale required error when the default fills the revealed field', async () => {
    const user = userEvent.setup();
    render(
      <TestForm defaultValues={{ choice: 'off', amount: '' }} withError />,
    );

    await user.click(screen.getByRole('radio', { name: 'On' }));

    expect(await screen.findByLabelText('Amount')).toHaveValue('5');
    expect(screen.queryByText('Required field')).toBeNull();
  });

  it('keeps a value the user already entered when the field is revealed', async () => {
    const user = userEvent.setup();
    render(<TestForm defaultValues={{ choice: 'off', amount: '9' }} />);

    await user.click(screen.getByRole('radio', { name: 'On' }));

    expect(await screen.findByLabelText('Amount')).toHaveValue('9');
  });

  it('does not apply the default to a field that is visible on first render', () => {
    render(<TestForm defaultValues={{ choice: 'on', amount: '' }} />);

    expect(screen.getByLabelText('Amount')).toHaveValue('');
  });

  it('does not apply the default to a field that is visible once the schema finishes loading', async () => {
    const user = userEvent.setup();
    render(<AsyncLoadedForm />);

    await user.click(screen.getByRole('button', { name: 'Load schema' }));

    expect(await screen.findByLabelText('Amount')).toHaveValue('');
  });
});
