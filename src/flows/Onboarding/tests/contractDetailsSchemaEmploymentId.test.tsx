import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import {
  useContractDetailsSchema,
  useLegacyContractDetailsSchema,
} from '@/src/flows/Onboarding/api';
import { contractDetailsSchemaV1Portugal } from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe.each([
  {
    hook: 'useLegacyContractDetailsSchema',
    useSchema: useLegacyContractDetailsSchema,
  },
  { hook: 'useContractDetailsSchema', useSchema: useContractDetailsSchema },
])('$hook', ({ useSchema }) => {
  let requestedEmploymentIds: (string | null)[];

  beforeEach(() => {
    queryClient.clear();
    requestedEmploymentIds = [];
    server.use(
      http.get('*/v1/countries/PRT/contract_details*', ({ request }) => {
        requestedEmploymentIds.push(
          new URL(request.url).searchParams.get('employment_id'),
        );
        return HttpResponse.json(contractDetailsSchemaV1Portugal);
      }),
    );
  });

  it('fetches the schema again for a different employment', async () => {
    const { rerender } = renderHook(
      ({ employmentId }) =>
        useSchema({
          countryCode: 'PRT',
          fieldValues: {},
          query: { employment_id: employmentId },
          options: { queryOptions: { enabled: true } },
        }),
      {
        initialProps: { employmentId: 'employment-1' },
        wrapper: TestProviders,
      },
    );
    await waitFor(() => expect(requestedEmploymentIds).toHaveLength(1));

    rerender({ employmentId: 'employment-2' });

    await waitFor(() =>
      expect(requestedEmploymentIds).toEqual(['employment-1', 'employment-2']),
    );
  });
});
