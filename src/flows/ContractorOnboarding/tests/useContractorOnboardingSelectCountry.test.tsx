import { renderHook, waitFor } from '@testing-library/react';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('useContractorOnboarding select country step', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  const renderSelectCountryStep = async () => {
    const { result } = renderHook(
      () => useContractorOnboarding({ options: {} }),
      { wrapper: TestProviders },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    return result;
  };

  it('offers the countries as options and keeps them after a validation round', async () => {
    const result = await renderSelectCountryStep();

    const expectedOptions = [
      { value: 'PRT', label: 'Portugal' },
      { value: 'ESP', label: 'Spain' },
      { value: 'DEU', label: 'Germany' },
      { value: 'FRA', label: 'France' },
    ];

    expect(result.current.fields).toHaveLength(1);
    expect(result.current.fields[0].options).toEqual(expectedOptions);

    await result.current.handleValidation({ country: '' });

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
