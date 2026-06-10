import { useQuery } from '@tanstack/react-query';
import { usePayrollAdminOnboardingContext } from '@/src/flows/PayrollAdminOnboarding/context';
import { PayrollAdminForm } from '@/src/flows/PayrollAdminOnboarding/components/PayrollAdminForm';
import type { GPStepCallbacks } from '@/src/flows/types';
import { useClient } from '@/src/context';
import { Client } from '@/src/client/client';
import { countriesOptions } from '@/src/common/api/countries';
import { isMutationError } from '@/src/lib/mutations';

export function SelectCountryStep({
  onSubmit,
  onSuccess,
  onError,
}: GPStepCallbacks) {
  const { adminBag } = usePayrollAdminOnboardingContext();
  const { client } = useClient();

  const { data: countriesResponse, isLoading: isLoadingCountries } = useQuery(
    countriesOptions(client as Client, 'gp-admin'),
  );

  const countryList = countriesResponse?.data?.data ?? [];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    adminBag.setInternalCountryCode(e.target.value || undefined);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await onSubmit?.(values);
      const data = await adminBag.onSubmit(values);
      await onSuccess?.(data);
      adminBag.goToNextStep();
    } catch (error: unknown) {
      if (isMutationError(error)) {
        onError?.({
          error: error.error,
          rawError: error.rawError,
          fieldErrors: error.fieldErrors,
        });
      } else {
        onError?.({
          error: error as Error,
          rawError: error as Record<string, unknown>,
          fieldErrors: [],
        });
      }
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <label
          htmlFor='gp-country'
          className='block text-sm font-medium text-gray-700'
        >
          Country
        </label>
        <select
          id='gp-country'
          className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm RemoteFlows__GPCountrySelect'
          value={adminBag.countryCode ?? ''}
          onChange={handleCountryChange}
          disabled={isLoadingCountries}
        >
          <option value=''>Select a country…</option>
          {countryList.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {adminBag.countryCode &&
        !adminBag.isLoading &&
        adminBag.fields.length > 0 && (
          <PayrollAdminForm
            onSubmit={handleSubmit}
            defaultValues={
              adminBag.initialValues?.basic_information as Record<
                string,
                unknown
              >
            }
          />
        )}
    </div>
  );
}
