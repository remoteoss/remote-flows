import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { GroupArrayField } from '@/src/components/form/fields/GroupArrayField';
import { GroupArrayFieldDefault } from '@/src/components/form/fields/default/GroupArrayFieldDefault';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';
import { useFormFields } from '@/src/context';
import { $TSFixMe, GroupArrayComponentProps } from '@/src/types/remoteFlows';

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

function renderGroup({
  rows = [{ description: 'Design work', amount: '2500' }],
  errors,
  ...props
}: Partial<React.ComponentProps<typeof GroupArrayField>> & {
  rows?: Record<string, string>[];
  errors?: Record<string, { type: string; message: string }>;
} = {}) {
  function Harness() {
    const methods = useForm({ defaultValues: { items: rows } });
    return (
      <FormProvider
        {...methods}
        formState={{ ...methods.formState, errors: (errors ?? {}) as $TSFixMe }}
      >
        <GroupArrayField
          name='items'
          label='Invoice items'
          fields={rowFields}
          {...props}
        />
      </FormProvider>
    );
  }

  return render(<Harness />);
}

describe('GroupArrayField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useFormFields as $TSFixMe).mockReturnValue({
      components: {
        text: TextFieldDefault,
        'group-array': GroupArrayFieldDefault,
      },
    });
  });

  it('renders a row of inputs for each saved item under the group label', () => {
    renderGroup({
      rows: [
        { description: 'Design work', amount: '2500' },
        { description: 'Hosting', amount: '75' },
      ],
    });

    expect(screen.getByRole('group', { name: 'Invoice items' })).toBeVisible();
    expect(screen.getAllByLabelText('Description')).toHaveLength(2);
    expect(screen.getAllByLabelText('Description')[1]).toHaveValue('Hosting');
    expect(screen.getAllByLabelText('Amount')[0]).toHaveValue('2500');
  });

  it('appends a blank row from the add button, labelled with addFieldText', () => {
    renderGroup({ addFieldText: 'Add line' });

    fireEvent.click(screen.getByRole('button', { name: 'Add line' }));

    expect(screen.getAllByLabelText('Description')).toHaveLength(2);
    expect(screen.getAllByLabelText('Description')[1]).toHaveValue('');
  });

  it('removes the row whose remove button is pressed', () => {
    renderGroup({
      rows: [
        { description: 'Design work', amount: '2500' },
        { description: 'Hosting', amount: '75' },
      ],
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Invoice items 1' }),
    );

    expect(screen.getAllByLabelText('Description')).toHaveLength(1);
    expect(screen.getByLabelText('Description')).toHaveValue('Hosting');
  });

  it('keeps the last row when the minimum is one', () => {
    renderGroup({ minItems: 1 });

    expect(
      screen.queryByRole('button', { name: /Remove Invoice items/ }),
    ).not.toBeInTheDocument();
  });

  it('offers no add button once the maximum is reached', () => {
    renderGroup({
      maxItems: 2,
      rows: [
        { description: 'Design work', amount: '2500' },
        { description: 'Hosting', amount: '75' },
      ],
    });

    expect(
      screen.queryByRole('button', { name: 'Add item' }),
    ).not.toBeInTheDocument();
  });

  it('hides the visible label when hideLabel is set', () => {
    renderGroup({ hideLabel: true });

    expect(screen.queryByText('Invoice items')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Invoice items' })).toBeVisible();
  });

  it('shows an error that belongs to the whole group', () => {
    renderGroup({
      errors: { items: { type: 'validation', message: 'Add at least 1 item' } },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Add at least 1 item');
  });

  it('hands the group additionalProps to every row field', () => {
    const TextSpy = vi.fn(() => null);
    renderGroup({
      additionalProps: { currency: 'EUR' },
      components: { text: TextSpy } as $TSFixMe,
    });

    expect(TextSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldData: expect.objectContaining({
          name: 'items.0.description',
          metadata: { currency: 'EUR' },
        }),
      }),
      expect.anything(),
    );
  });

  it('renders through a custom group-array component with the rows prepared', () => {
    const Custom = vi.fn(
      ({ label, rows, canAdd }: GroupArrayComponentProps) => (
        <p>
          {label}: {rows.length} row(s), add {canAdd ? 'on' : 'off'}
        </p>
      ),
    );
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { text: TextFieldDefault, 'group-array': Custom },
    });

    renderGroup({ maxItems: 1 });

    expect(screen.getByText('Invoice items: 1 row(s), add off')).toBeVisible();
    expect(Custom).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'items',
        addFieldText: 'Add item',
        canAdd: false,
      }),
      expect.anything(),
    );
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
});
