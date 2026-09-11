import { renderHook, waitFor } from '@testing-library/react';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

const expectedOptions = [
  { value: 'PRT', label: 'Portugal' },
  { value: 'ESP', label: 'Spain' },
  { value: 'DEU', label: 'Germany' },
  { value: 'FRA', label: 'France' },
];

describe('useOnboarding select country step', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  const renderSelectCountryStep = async (
    options?: OnboardingFlowProps['options'],
  ) => {
    const { result } = renderHook(
      () => useOnboarding({ companyId: '1234', options }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    return result;
  };

  it('offers the eor countries as options and keeps them after a validation round', async () => {
    const result = await renderSelectCountryStep();

    expect(result.current.fields).toHaveLength(1);
    expect(result.current.fields[0].options).toEqual(expectedOptions);

    await result.current.handleValidation({ country: '' });

    expect(result.current.fields[0].options).toEqual(expectedOptions);
  });

  it('applies the consumer jsfModify on top of the country options', async () => {
    const result = await renderSelectCountryStep({
      jsfModify: {
        select_country: {
          fields: { country: { title: 'Where does the employee live?' } },
        },
      },
    });

    expect(result.current.fields[0].label).toBe(
      'Where does the employee live?',
    );
    expect(result.current.fields[0].options).toEqual(expectedOptions);
  });

  it('resolves a consumer jsfModify given as a function', async () => {
    const result = await renderSelectCountryStep({
      jsfModify: {
        select_country: {
          fields: {
            country: (attrs: $TSFixMe) => ({
              title: `${attrs.title} of residence`,
            }),
          },
        },
      },
    });

    expect(result.current.fields[0].label).toBe('Country of residence');
    expect(result.current.fields[0].options).toEqual(expectedOptions);
  });

  it('requires a country and rejects one outside the offered list', async () => {
    const result = await renderSelectCountryStep();

    await expect(
      result.current.handleValidation({ country: '' }),
    ).resolves.toMatchObject({
      formErrors: { country: 'Required field' },
    });
    await expect(
      result.current.handleValidation({ country: 'XXX' }),
    ).resolves.toMatchObject({
      formErrors: { country: 'The option "XXX" is not valid.' },
    });
    await expect(
      result.current.handleValidation({ country: 'PRT' }),
    ).resolves.toEqual({});
  });

  it('only keeps the country in the step payload', async () => {
    const result = await renderSelectCountryStep();

    await expect(
      result.current.parseFormValues({ country: 'PRT', region: 'lisbon' }),
    ).resolves.toEqual({ country: 'PRT' });
    await expect(
      result.current.parseFormValues({ country: '' }),
    ).resolves.toEqual({});
  });
});
