import { useFormFields } from '@/src/context';
import { taxServicingCountriesOptionsV5 } from '@/src/flows/Onboarding/tests/fixtures/basicInformation';
import { CountryFieldDefault } from '@/src/components/form/fields/default/CountryFieldDefault';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

  it('lets Global replace everything and submits prefixed values', () => {
    render(<Harness />);
    pick('France');
    pick('Japan');
    expect(submitted()).toEqual(['France', 'Japan']);

    pick('Global');
    expect(submitted()).toEqual(['global-Global']);
  });

  it('lets a region drop its own subregions and countries', () => {
    render(<Harness />);
    pick('Japan');
    pick('France');
    pick('Europe - Western Europe');
    expect(submitted()).toEqual(['Japan', 'subregion-Western Europe']);

    pick('Europe');
    expect(submitted()).toEqual(['Japan', 'region-Europe']);
  });

  it('lets a subregion drop its own countries', () => {
    render(<Harness />);
    pick('France');
    pick('Japan');
    pick('Europe - Western Europe');
    expect(submitted()).toEqual(['Japan', 'subregion-Western Europe']);
  });

  it('drops a narrower option added while its region or Global is selected', () => {
    render(<Harness />);
    pick('Europe');
    pick('France');
    pick('Europe - Western Europe');
    expect(submitted()).toEqual(['region-Europe']);

    pick('Global');
    pick('Japan');
    expect(submitted()).toEqual(['global-Global']);
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

  it('gives a partner component matched values and a change handler that applies the rules', () => {
    const Custom = vi.fn().mockReturnValue(null);
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { countries: Custom },
    });
    render(
      <Harness
        defaultValues={{
          tax_servicing_countries: ['Europe - Western Europe', 'Japan'],
        }}
      />,
    );
    const lastField = () => Custom.mock.calls.at(-1)?.[0].field;
    expect(lastField().value).toEqual(['subregion-Western Europe', 'Japan']);

    act(() =>
      lastField().onChange([
        'subregion-Western Europe',
        'Japan',
        'global-Global',
      ]),
    );
    expect(submitted()).toEqual(['global-Global']);
  });

  it('applies the rules to every value added at once', () => {
    const Custom = vi.fn().mockReturnValue(null);
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { countries: Custom },
    });
    render(<Harness />);
    const lastField = () => Custom.mock.calls.at(-1)?.[0].field;

    act(() => lastField().onChange(['France', 'Japan', 'region-Europe']));
    expect(submitted()).toEqual(['Japan', 'region-Europe']);

    act(() =>
      lastField().onChange([
        'France',
        'Japan',
        'global-Global',
        'region-Europe',
      ]),
    );
    expect(submitted()).toEqual(['global-Global']);
  });

  it('keeps a saved value that matches no option and shows it as a removable chip', () => {
    render(
      <Harness
        defaultValues={{ tax_servicing_countries: ['Atlantis', 'Japan'] }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'remove Atlantis' }));
    expect(submitted()).toEqual(['Japan']);
  });

  it('keeps an unmatched saved value when another option is picked', () => {
    render(
      <Harness defaultValues={{ tax_servicing_countries: ['Atlantis'] }} />,
    );
    pick('France');
    expect(submitted()).toEqual(['Atlantis', 'France']);
  });

  it('works as a single select', () => {
    const SingleHarness = () => {
      const methods = useForm({ defaultValues: { country: 'France' } });
      return (
        <FormProvider {...methods}>
          <CountryField
            {...props}
            name='country'
            multiple={false}
            jsonType='string'
          />
          <output data-testid='value'>
            {JSON.stringify(methods.watch('country'))}
          </output>
        </FormProvider>
      );
    };
    render(<SingleHarness />);
    pick('Japan');
    expect(submitted()).toEqual('Japan');
  });

  it('passes value and onChange through unchanged for options without $meta.type', () => {
    const Custom = vi.fn().mockReturnValue(null);
    (useFormFields as $TSFixMe).mockReturnValue({
      components: { countries: Custom },
    });
    const plain = [
      { label: 'Europe - Western Europe', value: 'Europe - Western Europe' },
      { label: 'Japan', value: 'Japan' },
    ];
    const PlainHarness = () => {
      const methods = useForm({
        defaultValues: { tax_servicing_countries: ['Europe - Western Europe'] },
      });
      return (
        <FormProvider {...methods}>
          <CountryField {...props} options={plain} />
          <output data-testid='value'>
            {JSON.stringify(methods.watch('tax_servicing_countries'))}
          </output>
        </FormProvider>
      );
    };
    render(<PlainHarness />);
    const field = Custom.mock.calls.at(-1)?.[0].field;
    expect(field.value).toEqual(['Europe - Western Europe']);
    act(() => field.onChange(['Japan', 'Global']));
    expect(submitted()).toEqual(['Japan', 'Global']);
  });
});
