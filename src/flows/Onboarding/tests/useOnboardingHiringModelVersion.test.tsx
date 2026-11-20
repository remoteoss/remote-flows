import { renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  basicInformationSchemaV3France,
  contractDetailsSchemaV1France,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const employmentWithHiringModel = (
  employmentId: string,
  hiringModel: string | null,
) => ({
  ...employmentDefaultResponse,
  data: {
    ...employmentDefaultResponse.data,
    employment: {
      ...employmentDefaultResponse.data.employment,
      id: employmentId,
      eor_hiring_model: hiringModel,
      country: {
        ...employmentDefaultResponse.data.employment.country,
        code: 'CZE',
        name: 'Czech Republic',
      },
    },
  },
});

describe('useOnboarding contract details version per hiring model', () => {
  const options = {
    jsonSchemaVersion: { employment_basic_information: 3 },
    jsonSchemaVersionByCountry: {
      CZE: { contract_details: { cze_consulting: 7, cze_tea: 1 } },
    },
  };

  const contractDetailsRequests: URLSearchParams[] = [];

  beforeEach(() => {
    queryClient.clear();
    contractDetailsRequests.length = 0;

    server.use(
      http.get('*/v1/countries/CZE/employment_basic_information*', () =>
        HttpResponse.json(basicInformationSchemaV3France),
      ),
      http.get('*/v1/countries/CZE/contract_details*', ({ request }) => {
        contractDetailsRequests.push(new URL(request.url).searchParams);
        return HttpResponse.json(contractDetailsSchemaV1France);
      }),
    );
  });

  it.each([
    { hiringModel: 'cze_tea', version: '1' },
    { hiringModel: 'cze_consulting', version: '7' },
    { hiringModel: null, version: '7' },
  ])(
    'requests the contract details schema once, with version $version, for the $hiringModel employment',
    async ({ hiringModel, version }) => {
      server.use(
        http.get('*/v1/employments/:employmentId', async ({ params }) => {
          await delay(50);
          return HttpResponse.json(
            employmentWithHiringModel(String(params.employmentId), hiringModel),
          );
        }),
      );

      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'CZE',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country'],
            options,
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(contractDetailsRequests).toHaveLength(1);
      expect(contractDetailsRequests[0].get('json_schema_version')).toBe(
        version,
      );
      expect(contractDetailsRequests[0].get('employment_id')).toBe(
        'test-employment-id',
      );
    },
  );
});
