import { render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { createHeadlessForm } from '@/src/common/createHeadlessForm';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { CountryFieldDefault } from '@/src/components/form/fields/default/CountryFieldDefault';

vi.mock('@/src/context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/context')>();
  return {
    ...actual,
    useFormFields: vi.fn(() => ({
      components: {
        countries: CountryFieldDefault,
      },
    })),
  };
});

const countryOptions = [
  { label: 'France', value: 'France' },
  { label: 'Germany', value: 'Germany' },
];

const schema = {
  type: 'object',
  properties: {
    country_of_birth: {
      title: 'Country of birth',
      type: 'string',
      enum: ['France', 'Germany'],
      'x-jsf-presentation': {
        inputType: 'countries',
        options: countryOptions,
      },
    },
    nationality: {
      title: 'Nationality',
      type: 'array',
      items: { enum: ['France', 'Germany'] },
      'x-jsf-presentation': {
        inputType: 'countries',
        options: countryOptions,
      },
    },
  },
  required: ['country_of_birth', 'nationality'],
  'x-jsf-order': ['country_of_birth', 'nationality'],
  'x-rmt-meta': { jsfOldVersion: true },
};

describe('JSONSchemaForm - countries input', () => {
  it('submits a single-valued country as a string that passes the schema validation', async () => {
    const user = userEvent.setup();
    const form = createHeadlessForm(schema, {});
    let latestValues = { country_of_birth: '', nationality: [] as string[] };

    const TestComponent = () => {
      const methods = useForm({ defaultValues: latestValues });
      latestValues = methods.watch();

      return (
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={form.fields} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    const [countryOfBirth, nationality] = screen.getAllByRole('combobox');

    await user.click(countryOfBirth);
    await user.click(await screen.findByRole('option', { name: 'Germany' }));

    await user.click(nationality);
    await user.click(await screen.findByRole('option', { name: 'Germany' }));
    await user.click(await screen.findByRole('option', { name: 'France' }));

    await waitFor(() => {
      expect(latestValues).toEqual({
        country_of_birth: 'Germany',
        nationality: ['Germany', 'France'],
      });
    });

    expect(form.handleValidation(latestValues).formErrors).toBeUndefined();
  });
});
