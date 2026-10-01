import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useJSONSchemaForm } from '@/src/flows/Onboarding/api';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

const findField = (fields: $TSFixMe[] = [], name: string): $TSFixMe =>
  fields.reduce<$TSFixMe>(
    (found, field) =>
      found ?? (field.name === name ? field : findField(field.fields, name)),
    undefined,
  );

describe('Onboarding useJSONSchemaForm money forced values', () => {
  beforeEach(() => {
    queryClient.clear();

    const { 'x-rmt-meta': _meta, ...schemaWithoutMeta } =
      contractDetailsSchemaV1Portugal.data;

    server.use(
      http.get('*/v1/countries/PRT/contract_details*', () => {
        return HttpResponse.json({ data: schemaWithoutMeta });
      }),
    );
  });

  it.each([
    { maximumWorkingHoursRegime: 'yes', allowanceInCents: 81257 },
    { maximumWorkingHoursRegime: 'no', allowanceInCents: 29548 },
  ])(
    'computes the allowance from the salary in cents (maximum_working_hours_regime: $maximumWorkingHoursRegime)',
    async ({ maximumWorkingHoursRegime, allowanceInCents }) => {
      const { result } = renderHook(
        () =>
          useJSONSchemaForm({
            countryCode: 'PRT',
            form: 'contract_details',
            fieldValues: {
              annual_gross_salary: 71703.77,
              work_hours_per_week: 40,
              working_hours_exemption: 'yes',
              maximum_working_hours_regime: maximumWorkingHoursRegime,
            },
            options: { queryOptions: { enabled: true } },
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const allowance = findField(
        result.current.data?.fields,
        'working_hours_exemption_allowance',
      );

      expect(allowance?.const).toBe(allowanceInCents);
    },
  );
});
