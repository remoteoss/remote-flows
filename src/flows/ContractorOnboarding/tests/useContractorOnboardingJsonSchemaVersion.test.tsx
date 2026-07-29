import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useContractorOnboarding } from '@/src/flows/ContractorOnboarding/hooks';
import { TestProviders, queryClient } from '@/src/tests/testHelpers';
import { server } from '@/src/tests/server';
import { mockContractorBasicInformationSchema } from '@/src/common/api/fixtures/contractors';

describe('useContractorOnboarding jsonSchemaVersion', () => {
  afterEach(() => {
    queryClient.clear();
  });

  describe('basic information form', () => {
    it('should pass jsonSchemaVersion 1 by default', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get(
          '*/v1/countries/*/contractor_basic_information*',
          ({ request }) => {
            capturedRequest = request;
            return HttpResponse.json(mockContractorBasicInformationSchema);
          },
        ),
      );

      renderHook(
        () =>
          useContractorOnboarding({
            countryCode: 'PRT',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country', 'contract_origin'],
            options: {},
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('json_schema_version')).toBe('1');
    });

    it('should pass custom jsonSchemaVersion when provided', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get(
          '*/v1/countries/*/contractor_basic_information*',
          ({ request }) => {
            capturedRequest = request;
            return HttpResponse.json(mockContractorBasicInformationSchema);
          },
        ),
      );

      renderHook(
        () =>
          useContractorOnboarding({
            countryCode: 'DEU',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country', 'contract_origin'],
            options: {
              jsonSchemaVersion: {
                employment_basic_information: 2,
              },
            },
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('json_schema_version')).toBe('2');
    });

    it('should pass "latest" when specified', async () => {
      let capturedRequest: Request | null = null;
      server.use(
        http.get(
          '*/v1/countries/*/contractor_basic_information*',
          ({ request }) => {
            capturedRequest = request;
            return HttpResponse.json(mockContractorBasicInformationSchema);
          },
        ),
      );

      renderHook(
        () =>
          useContractorOnboarding({
            countryCode: 'USA',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country', 'contract_origin'],
            options: {
              jsonSchemaVersion: {
                employment_basic_information: 'latest',
              },
            },
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      const url = new URL(capturedRequest!.url);
      expect(url.searchParams.get('json_schema_version')).toBe('latest');
    });
  });
});
