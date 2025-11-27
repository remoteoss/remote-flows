import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '@/src/tests/server';
import { http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { TestProviders } from '@/src/tests/testHelpers';

// Mock the API calls to track the query parameters
const mockGetShowFormCountry = vi.fn();
const mockGetShowSchema = vi.fn();
const mockPostCreateEmployment2 = vi.fn();
const mockPatchUpdateEmployment2 = vi.fn();
const mockPutUpdateBenefitOffer = vi.fn();

// Mock the client functions
vi.mock('@/src/client', () => ({
  getShowFormCountry: (...args: $TSFixMe[]) => mockGetShowFormCountry(...args),
  getShowSchema: (...args: $TSFixMe[]) => mockGetShowSchema(...args),
  postCreateEmployment2: (...args: $TSFixMe[]) =>
    mockPostCreateEmployment2(...args),
  patchUpdateEmployment2: (...args: $TSFixMe[]) =>
    mockPatchUpdateEmployment2(...args),
  putUpdateBenefitOffer: (...args: $TSFixMe[]) =>
    mockPutUpdateBenefitOffer(...args),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('useOnboarding jsonSchemaVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    // Mock successful responses
    mockGetShowFormCountry.mockResolvedValue({
      data: {
        data: {
          properties: {
            name: { type: 'string', title: 'Name' },
            email: { type: 'string', title: 'Email' },
          },
        },
      },
    });

    mockGetShowSchema.mockResolvedValue({
      data: {
        data: {
          schema: {
            properties: {
              benefit1: { type: 'string', title: 'Benefit 1' },
            },
          },
        },
      },
    });

    mockPostCreateEmployment2.mockResolvedValue({
      data: { data: { employment: { id: 'test-employment-id' } } },
    });

    mockPatchUpdateEmployment2.mockResolvedValue({
      data: { data: { employment: { id: 'test-employment-id' } } },
    });

    mockPutUpdateBenefitOffer.mockResolvedValue({
      data: { data: { success: true } },
    });

    // Mock server responses
    server.use(
      http.get('*/v1/countries', () => {
        return HttpResponse.json({
          data: [{ code: 'PRT', name: 'Portugal', eor_onboarding: true }],
        });
      }),
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json({
          data: { id: 'test-company-id', desired_currency: 'USD' },
        });
      }),
    );
  });

  describe('useJSONSchemaForm calls', () => {
    it('should pass jsonSchemaVersion to basic information form', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'PRT',
            skipSteps: ['select_country'],
            options: {
              jsonSchemaVersionByCountry: {
                PRT: {
                  employment_basic_information: 2,
                },
              },
            },
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(mockGetShowFormCountry).toHaveBeenCalled();
      });

      // Then check the specific call
      const call = mockGetShowFormCountry.mock.calls[0][0];

      // Verify the query part specifically
      expect(call.query).toEqual({
        skip_benefits: true,
        json_schema_version: 1,
      });
    });

    it('should pass jsonSchemaVersionByCountry to contract details form', async () => {
      const options = {
        jsonSchemaVersionByCountry: {
          PRT: {
            contract_details: 2,
          },
        },
      };

      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'PRT',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country'],
            options,
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Navigate to contract details step
      result.current.goTo('contract_details');

      const contractDetailsCall = mockGetShowFormCountry.mock.calls[1][0];

      await waitFor(() => {
        expect(contractDetailsCall).toHaveBeenCalledWith({
          client: expect.any(Object),
          headers: {
            Authorization: ``,
          },
          path: {
            country_code: 'PRT',
            form: 'contract_details',
          },
          query: {
            skip_benefits: true,
            employment_id: 'test-employment-id',
            json_schema_version: 1,
          },
        });
      });
    });
  });
});
