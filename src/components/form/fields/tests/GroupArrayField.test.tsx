import { fireEvent, render, screen } from '@testing-library/react';
import {
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { GroupArrayField } from '@/src/components/form/fields/GroupArrayField';
import { useJsonSchemasValidationFormResolver } from '@/src/components/form/validationResolver';
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

const rowFields = [
  { name: 'description', label: 'Description', type: 'text' },
  { name: 'amount', label: 'Amount', type: 'text' },
];

function FormItems() {
  const { control } = useFormContext();
  const items = useWatch({ control, name: 'items' });

  return <output data-testid='items'>{JSON.stringify(items)}</output>;
}

function renderGroup({
  rows = [{ description: 'Design work', amount: '2500' }],
  fields = rowFields,
  ...props
}: Partial<React.ComponentProps<typeof GroupArrayField>> & {
  rows?: Record<string, string>[];
} = {}) {
  function Harness() {
    const methods = useForm<FieldValues>({ defaultValues: { items: rows } });
    return (
      <FormProvider {...methods}>
        <GroupArrayField
          name='items'
          label='Items'
          fields={fields}
          {...props}
        />
        <FormItems />
      </FormProvider>
    );
  }

  render(<Harness />);
  return {
    getItems: () => JSON.parse(screen.getByTestId('items').textContent ?? ''),
  };
}

describe('GroupArrayField', () => {
  beforeEach(() => {
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { text: TextFieldDefault },
    });
  });

  it('renders a row of inputs for each saved item', () => {
    renderGroup({
      rows: [
        { description: 'Design work', amount: '2500' },
        { description: 'Hosting', amount: '75' },
      ],
    });

    expect(screen.getByRole('group', { name: 'Items' })).toBeVisible();
    expect(screen.getAllByLabelText('Description')[1]).toHaveValue('Hosting');
    expect(screen.getAllByLabelText('Amount')[0]).toHaveValue('2500');
  });

  it('appends a blank row from the add button', () => {
    const { getItems } = renderGroup({ addFieldText: 'Add line' });

    fireEvent.click(screen.getByRole('button', { name: 'Add line' }));

    expect(getItems()).toEqual([
      { description: 'Design work', amount: '2500' },
      { description: '', amount: '' },
    ]);
  });

  it('removes the row whose remove button is pressed', () => {
    const { getItems } = renderGroup({
      rows: [
        { description: 'First', amount: '1' },
        { description: 'Second', amount: '2' },
        { description: 'Third', amount: '3' },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Items 2' }));

    expect(getItems()).toEqual([
      { description: 'First', amount: '1' },
      { description: 'Third', amount: '3' },
    ]);
  });

  it('keeps the last row when the minimum is one', () => {
    renderGroup({ minItems: 1 });

    expect(
      screen.queryByRole('button', { name: /Remove Items/ }),
    ).not.toBeInTheDocument();
  });

  it('offers no add button once the maximum is reached', () => {
    renderGroup({ maxItems: 1 });

    expect(
      screen.queryByRole('button', { name: 'Add item' }),
    ).not.toBeInTheDocument();
  });

  it('does not render a field that is not visible', () => {
    renderGroup({
      fields: [
        ...rowFields,
        { name: 'hidden', label: 'Hidden', type: 'text', isVisible: false },
      ],
    });

    expect(screen.queryByLabelText('Hidden')).not.toBeInTheDocument();
  });

  it('renders a multiple select in a row as a multi-select', () => {
    const MultiSpy = vi.fn((_props: $TSFixMe) => null);
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { text: TextFieldDefault, 'multi-select': MultiSpy },
    });

    renderGroup({
      fields: [
        {
          name: 'tags',
          label: 'Tags',
          type: 'select',
          multiple: true,
          options: [],
        },
      ],
    });

    expect(MultiSpy.mock.calls[0][0].fieldData.name).toBe('items.0.tags');
  });

  it('hands the step-level component overrides to the row inputs', () => {
    const TextSpy = vi.fn((_props: $TSFixMe) => null);

    function Harness() {
      const methods = useForm<FieldValues>({
        defaultValues: { items: [{ description: 'Design work' }] },
      });
      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields
            fields={[
              {
                name: 'items',
                type: 'group-array',
                label: 'Items',
                isVisible: true,
                fields: [
                  { name: 'description', label: 'Description', type: 'text' },
                ],
              },
            ]}
            components={{ text: TextSpy }}
          />
        </FormProvider>
      );
    }

    render(<Harness />);

    expect(TextSpy.mock.calls[0][0].fieldData.name).toBe('items.0.description');
  });

  it('shows an error that belongs to the whole group', async () => {
    function Harness() {
      const resolver = useJsonSchemasValidationFormResolver(
        async (values: FieldValues) =>
          values.items?.length
            ? {}
            : { formErrors: { items: 'Must have at least 1 item' } },
      );
      const methods = useForm<FieldValues>({
        defaultValues: { items: [{ description: 'Design work', amount: '1' }] },
        resolver,
      });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => undefined)}>
            <GroupArrayField name='items' label='Items' fields={rowFields} />
            <button type='submit'>Send</button>
          </form>
        </FormProvider>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Items 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Must have at least 1 item',
    );
    expect(
      screen.getByRole('group', { name: 'Items' }),
    ).toHaveAccessibleDescription('Must have at least 1 item');
  });
});
