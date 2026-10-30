import { fireEvent, render, screen } from '@testing-library/react';
import {
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { GroupArrayFieldDefault } from '@/src/components/form/fields/default/GroupArrayFieldDefault';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';
import { useFormFields } from '@/src/context';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(),
    useTransformer: vi.fn(() => undefined),
  };
});

const groupArray = (name: string) => ({
  name,
  label: 'Members',
  type: 'group-array',
  isVisible: true,
  minItems: 1,
  fields: [{ name: 'name', label: 'Name', type: 'text' }],
});

function FormValues() {
  const { control } = useFormContext();
  const values = useWatch({ control });

  return <output data-testid='values'>{JSON.stringify(values)}</output>;
}

function renderFields(fields: $TSFixMe[], defaultValues: FieldValues) {
  function Harness() {
    const methods = useForm<FieldValues>({ defaultValues });
    return (
      <FormProvider {...methods}>
        <JSONSchemaFormFields fields={fields} />
        <FormValues />
      </FormProvider>
    );
  }

  render(<Harness />);

  return {
    getValues: () => JSON.parse(screen.getByTestId('values').textContent ?? ''),
  };
}

describe('a group-array inside a fieldset', () => {
  beforeEach(() => {
    (useFormFields as $TSFixMe).mockReturnValue({
      components: {
        text: TextFieldDefault,
        'group-array': GroupArrayFieldDefault,
      },
    });
  });

  it('renders under a heading group, keeping its own name', () => {
    const { getValues } = renderFields(
      [
        {
          name: 'details',
          label: 'Details',
          type: 'fieldset-flat',
          isVisible: true,
          fields: [groupArray('members')],
        },
      ],
      { members: [{ name: 'Ana' }] },
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Ana');

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));

    expect(getValues().members).toEqual([{ name: 'Ana' }, { name: '' }]);
  });

  it('renders inside an object fieldset, under the fieldset name', () => {
    const { getValues } = renderFields(
      [
        {
          name: 'team',
          label: 'Team',
          type: 'fieldset',
          isVisible: true,
          fields: [groupArray('members')],
        },
      ],
      { team: { members: [{ name: 'Ana' }] } },
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Ana');

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));

    expect(getValues().team.members).toEqual([{ name: 'Ana' }, { name: '' }]);
  });
});
