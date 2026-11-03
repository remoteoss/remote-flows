import { useFormFields } from '@/src/context';
import { taxServicingCountriesOptionsV5 } from '@/src/flows/Onboarding/tests/fixtures/basicInformation';
import { CountryFieldDefault } from '@/src/components/form/fields/default/CountryFieldDefault';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { array } from 'yup';
import { CountryField } from '../CountryField';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return { ...actual, useFormFields: vi.fn() };
});

const props = {
  name: 'tax_servicing_countries',
  label: 'Tax servicing countries',
  type: 'countries',
  computedAttributes: {},
  errorMessage: {},
  inputType: 'countries' as const,
  isVisible: true,
  jsonType: 'array',
  multiple: true,
  required: false,
  schema: array(),
  scopedJsonSchema: {},
  options: taxServicingCountriesOptionsV5,
  $meta: { regions: {}, subregions: {} },
} as $TSFixMe;

const Harness = ({ defaultValues }: { defaultValues?: $TSFixMe }) => {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <CountryField {...props} />
      <output data-testid='value'>
        {JSON.stringify(methods.watch('tax_servicing_countries') ?? [])}
      </output>
    </FormProvider>
  );
};

const pick = (label: string) => {
  const trigger = screen.getByRole('combobox');
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    fireEvent.click(trigger);
  }
  fireEvent.click(screen.getByRole('option', { name: label }));
};
const submitted = () =>
  JSON.parse(screen.getByTestId('value').textContent as string);

describe('CountryField with grouped options (basic information v5)', () => {
  beforeEach(() => {
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { countries: CountryFieldDefault },
    });
  });

  it('lists Global, regions, subregions and countries', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual([
      'Global',
      'Europe',
      'Europe - Western Europe',
      'France',
      'Japan',
    ]);
    ['Regions', 'Subregions', 'Countries'].forEach((heading) =>
      expect(screen.getByText(heading)).toBeInTheDocument(),
    );
  });

  it('follows the selection rules and submits prefixed values', () => {
    render(<Harness />);
    pick('France');
    pick('Japan');
    expect(submitted()).toEqual(['France', 'Japan']);

    pick('Europe');
    expect(submitted()).toEqual(['Japan', 'region-Europe']);

    pick('Global');
    expect(submitted()).toEqual(['global-Global']);

    pick('Japan');
    expect(submitted()).toEqual(['Japan']);
  });

  it('shows a saved display label as selected', () => {
    render(
      <Harness
        defaultValues={{
          tax_servicing_countries: ['Europe - Western Europe'],
        }}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'remove Europe - Western Europe' }),
    ).toBeInTheDocument();
  });

  it('hands a partner component the same props shape as before', () => {
    const Custom = vi.fn().mockReturnValue(null);
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { countries: Custom },
    });
    render(<Harness />);
    expect(Object.keys(Custom.mock.calls[0][0]).sort()).toEqual([
      'field',
      'fieldData',
      'fieldState',
    ]);
  });
});
