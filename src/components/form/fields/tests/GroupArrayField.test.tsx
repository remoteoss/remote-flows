import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { GroupArrayField } from '@/src/components/form/fields/GroupArrayField';
import { GroupArrayFieldDefault } from '@/src/components/form/fields/default/GroupArrayFieldDefault';
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
      components: {
        text: TextFieldDefault,
        'group-array': GroupArrayFieldDefault,
      },
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
    expect(
      within(screen.getByRole('group', { name: 'Items 2' })).getByLabelText(
        'Description',
      ),
    ).toHaveValue('Hosting');
    expect(screen.getAllByLabelText('Amount')[0]).toHaveValue('2500');
  });

  it('leaves the visible label out when the label is hidden, keeping the group name', () => {
    renderGroup({ hideLabel: true });

    expect(screen.queryByText('Items')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Items' })).toBeVisible();
  });

  it('hands the group additional props to every row input', () => {
    renderGroup({
      rows: [
        { description: 'Design work', amount: '2500' },
        { description: 'Hosting', amount: '75' },
      ],
      additionalProps: { currency: 'EUR' },
      components: {
        text: ({ fieldData }: $TSFixMe) => (
          <output data-testid='row-currency'>
            {fieldData.metadata.currency}
          </output>
        ),
      },
    });

    // The form kit only applies computed attributes to the group itself, never to the
    // fields inside its rows, so the group hands its extra props to every input in every
    // row. Two rows with two inputs each means all four receive the currency, including the
    // description inputs that have no use for it.
    expect(
      screen.getAllByTestId('row-currency').map((node) => node.textContent),
    ).toEqual(['EUR', 'EUR', 'EUR', 'EUR']);
  });

  it("keeps a row input's own additional props over the group's", () => {
    renderGroup({
      additionalProps: { currency: 'EUR' },
      fields: [
        {
          name: 'amount',
          label: 'Amount',
          type: 'text',
          additionalProps: { currency: 'USD' },
        },
      ],
      components: {
        text: ({ fieldData }: $TSFixMe) => (
          <output data-testid='row-currency'>
            {fieldData.metadata.currency}
          </output>
        ),
      },
    });

    expect(screen.getByTestId('row-currency')).toHaveTextContent('USD');
  });

  it('shows the description', () => {
    renderGroup({ description: 'Everything you are billing for' });

    expect(screen.getByText('Everything you are billing for')).toBeVisible();
  });

  it('announces the description with the group', () => {
    renderGroup({ description: 'Everything you are billing for' });

    expect(
      screen.getByRole('group', { name: 'Items' }),
    ).toHaveAccessibleDescription('Everything you are billing for');
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
      components: {
        text: TextFieldDefault,
        'multi-select': MultiSpy,
        'group-array': GroupArrayFieldDefault,
      },
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

  it('renders through a custom group-array component', () => {
    const Custom = vi.fn((_props: $TSFixMe) => null);
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { text: TextFieldDefault, 'group-array': Custom },
    });

    renderGroup({ maxItems: 1 });

    const props = Custom.mock.calls[0][0];
    expect(props.name).toBe('items');
    expect(props.addFieldText).toBe('Add item');
    expect(props.canAdd).toBe(false);
    expect(props.rows).toHaveLength(1);
  });

  it('throws when there is no group-array component to render with', () => {
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { text: TextFieldDefault },
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderGroup()).toThrow(
      'Group array component not found for field items',
    );
  });

  it('uses a step-level group-array component over the default one', () => {
    const StepCustom = vi.fn((_props: $TSFixMe) => null);

    function Harness() {
      const methods = useForm<FieldValues>({ defaultValues: { items: [] } });
      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields
            fields={[
              {
                name: 'items',
                type: 'group-array',
                label: 'Items',
                isVisible: true,
                fields: rowFields,
              },
            ]}
            components={{ 'group-array': StepCustom }}
          />
        </FormProvider>
      );
    }

    render(<Harness />);

    expect(StepCustom.mock.calls[0][0].name).toBe('items');
  });
});
