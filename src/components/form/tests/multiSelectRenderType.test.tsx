import { render } from '@testing-library/react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { TextFieldDefault } from '@/src/components/form/fields/default/TextFieldDefault';
import { getFieldRenderType } from '@/src/components/form/utils';
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

const tagsField = {
  name: 'tags',
  label: 'Tags',
  type: 'select',
  multiple: true,
  options: [],
  isVisible: true,
};

function renderFields(fields: $TSFixMe[]) {
  function Harness() {
    const methods = useForm<FieldValues>();
    return (
      <FormProvider {...methods}>
        <JSONSchemaFormFields fields={fields} />
      </FormProvider>
    );
  }

  render(<Harness />);
}

describe('getFieldRenderType', () => {
  it('renders a select that allows several values as a multi-select', () => {
    expect(getFieldRenderType({ type: 'select', multiple: true })).toBe(
      'multi-select',
    );
  });

  it('keeps a single select and every other field as its own type', () => {
    expect(getFieldRenderType({ type: 'select' })).toBe('select');
    expect(getFieldRenderType({ type: 'text', multiple: true })).toBe('text');
    expect(getFieldRenderType({ type: 'fieldset' })).toBe('fieldset');
  });
});

describe('a multiple select', () => {
  const MultiSpy = vi.fn((_props: $TSFixMe) => null);

  beforeEach(() => {
    MultiSpy.mockClear();
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { text: TextFieldDefault, 'multi-select': MultiSpy },
    });
  });

  it('renders as a multi-select at the top level of a form', () => {
    renderFields([tagsField]);

    expect(MultiSpy.mock.calls[0][0].fieldData.name).toBe('tags');
  });

  it('renders as a multi-select inside a fieldset', () => {
    renderFields([
      {
        name: 'team',
        label: 'Team',
        type: 'fieldset',
        isVisible: true,
        fields: [tagsField],
      },
    ]);

    expect(MultiSpy.mock.calls[0][0].fieldData.name).toBe('team.tags');
  });
});
