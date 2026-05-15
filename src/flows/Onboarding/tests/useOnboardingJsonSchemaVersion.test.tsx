import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { TestProviders } from '@/src/tests/testHelpers';

// Mock the API calls to track the query parameters
const mockGetV1CountriesCountryCodeForm = vi.fn();
const mockGetV1EmploymentsEmploymentIdBenefitOffersSchema = vi.fn();
const mockPostV1Employments = vi.fn();
const mockPatchV1EmploymentsEmploymentId2 = vi.fn();
const mockPutV1EmploymentsEmploymentIdBenefitOffers = vi.fn();
const mockPostV1EmploymentsEmploymentIdContractEligibility = vi.fn();

// Mock the client functions
vi.mock('@/src/client', () => ({
  getV1CountriesCountryCodeForm: (...args: $TSFixMe[]) =>
    mockGetV1CountriesCountryCodeForm(...args),
  getV1EmploymentsEmploymentIdBenefitOffersSchema: (...args: $TSFixMe[]) =>
    mockGetV1EmploymentsEmploymentIdBenefitOffersSchema(...args),
  postV1Employments: (...args: $TSFixMe[]) => mockPostV1Employments(...args),
  patchV1EmploymentsEmploymentId2: (...args: $TSFixMe[]) =>
    mockPatchV1EmploymentsEmploymentId2(...args),
  putV1EmploymentsEmploymentIdBenefitOffers: (...args: $TSFixMe[]) =>
    mockPutV1EmploymentsEmploymentIdBenefitOffers(...args),
  postV1EmploymentsEmploymentIdContractEligibility: (...args: $TSFixMe[]) =>
    mockPostV1EmploymentsEmploymentIdContractEligibility(...args),
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
    mockGetV1CountriesCountryCodeForm.mockResolvedValue({
      data: {
        data: {
          properties: {
            name: { type: 'string', title: 'Name' },
            email: { type: 'string', title: 'Email' },
          },
        },
      },
    });

    mockGetV1EmploymentsEmploymentIdBenefitOffersSchema.mockResolvedValue({
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

    mockPostV1Employments.mockResolvedValue({
      data: { data: { employment: { id: 'test-employment-id' } } },
    });

    mockPatchV1EmploymentsEmploymentId2.mockResolvedValue({
      data: { data: { employment: { id: 'test-employment-id' } } },
    });

    mockPutV1EmploymentsEmploymentIdBenefitOffers.mockResolvedValue({
      data: { data: { success: true } },
    });

    mockPostV1EmploymentsEmploymentIdContractEligibility.mockResolvedValue({
      data: { data: { status: 'ok' } },
    });
  });

  describe('useJSONSchemaForm calls', () => {
    it('should pass jsonSchemaVersion 1 to basic information form as default', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'PRT',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country'],
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(mockGetV1CountriesCountryCodeForm).toHaveBeenCalled();
      });

      const call = mockGetV1CountriesCountryCodeForm.mock.calls[0][0];

      expect(call.path).toEqual({
        country_code: 'PRT',
        form: 'employment_basic_information',
      });

      expect(call.query).toEqual({
        skip_benefits: true,
        json_schema_version: 1,
      });
    });

    it('should pass jsonSchemaVersion 1 to contract details form as default', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'PRT',
            employmentId: 'test-employment-id',
            skipSteps: ['select_country'],
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(mockGetV1CountriesCountryCodeForm).toHaveBeenCalled();
      });

      const call = mockGetV1CountriesCountryCodeForm.mock.calls[1][0];

      expect(call.path).toEqual({
        country_code: 'PRT',
        form: 'contract_details',
      });

      expect(call.query).toEqual({
        skip_benefits: true,
        employment_id: 'test-employment-id',
        json_schema_version: 1,
      });
    });

    it('should pass jsonSchemaVersionByCountry to contract details form', async () => {
      const options = {
        jsonSchemaVersionByCountry: {
          DEU: {
            contract_details: 2,
          },
        },
      };

      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'DEU',
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

      const contractDetailsCall =
        mockGetV1CountriesCountryCodeForm.mock.calls[1][0];

      await waitFor(() => {
        expect(contractDetailsCall).toEqual({
          client: expect.any(Object),
          headers: {
            Authorization: ``,
          },
          path: {
            country_code: 'DEU',
            form: 'contract_details',
          },
          query: {
            skip_benefits: true,
            employment_id: 'test-employment-id',
            json_schema_version: 2,
          },
        });
      });
    });

    it('should pass custom jsonSchemaVersion to basic information form', async () => {
      const options = {
        jsonSchemaVersion: {
          employment_basic_information: 2,
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
      await waitFor(() => {
        expect(mockGetV1CountriesCountryCodeForm).toHaveBeenCalled();
      });
      const call = mockGetV1CountriesCountryCodeForm.mock.calls[0][0];
      expect(call.path).toEqual({
        country_code: 'PRT',
        form: 'employment_basic_information',
      });
      expect(call.query).toEqual({
        skip_benefits: true,
        json_schema_version: 2,
      });
    });

    it('should pass custom benefit_offers_form_schema version to getShowSchema', async () => {
      const options = {
        jsonSchemaVersion: {
          benefit_offers_form_schema: 2,
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
      // Navigate to benefits step
      act(() => {
        result.current.goTo('benefits');
      });
      await waitFor(() => {
        expect(
          mockGetV1EmploymentsEmploymentIdBenefitOffersSchema,
        ).toHaveBeenCalled();
      });
      const call =
        mockGetV1EmploymentsEmploymentIdBenefitOffersSchema.mock.calls[0][0];
      expect(call.query).toEqual({
        json_schema_version: 2,
      });
    });
  });

  describe('useUpdateEmployment calls', () => {
    it('should call patchUpdateEmployment2 with default contract_details_json_schema_version when submitting contract_details', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            employmentId: 'existing-employment-id',
            companyId: 'test-company-id',
            countryCode: 'DEU',
            skipSteps: ['select_country'],
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Navigate to contract_details step
      act(() => {
        result.current.goTo('contract_details');
      });

      // Submit contract_details form
      await act(async () => {
        await result.current.onSubmit({
          // minimal contract details data
          job_title: 'Engineer',
          start_date: '2024-01-01',
        });
      });

      await waitFor(() => {
        expect(mockPatchV1EmploymentsEmploymentId2).toHaveBeenCalled();
      });

      const call = mockPatchV1EmploymentsEmploymentId2.mock.calls[0][0];

      expect(call.query).toEqual({
        skip_benefits: true,
        employment_basic_information_json_schema_version: 1,
        contract_details_json_schema_version: 1,
      });
    });

    it('should call patchUpdateEmployment2 with custom contract_details_json_schema_version when submitting contract_details', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            employmentId: 'existing-employment-id',
            companyId: 'test-company-id',
            countryCode: 'DEU',
            skipSteps: ['select_country'],
            options: {
              jsonSchemaVersionByCountry: {
                DEU: {
                  contract_details: 2,
                },
              },
            },
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Navigate to contract_details step
      act(() => {
        result.current.goTo('contract_details');
      });

      // Submit contract_details form
      await act(async () => {
        await result.current.onSubmit({
          // minimal contract details data
          job_title: 'Engineer',
          start_date: '2024-01-01',
        });
      });

      await waitFor(() => {
        expect(mockPatchV1EmploymentsEmploymentId2).toHaveBeenCalled();
      });

      const call = mockPatchV1EmploymentsEmploymentId2.mock.calls[0][0];

      expect(call.query).toEqual({
        skip_benefits: true,
        employment_basic_information_json_schema_version: 1,
        contract_details_json_schema_version: 2,
      });
    });

    it('should call patchUpdateEmployment2 with custom employment_basic_information_json_schema_version when submitting basic_information', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            employmentId: 'existing-employment-id',
            companyId: 'test-company-id',
            countryCode: 'ARG',
            skipSteps: ['select_country'],
            options: {
              jsonSchemaVersion: {
                employment_basic_information: 3, // ← Test this!
              },
            },
          }),
        { wrapper: TestProviders },
      );
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      // Submit basic_information form (first step)
      await act(async () => {
        await result.current.onSubmit({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });
      await waitFor(() => {
        expect(mockPatchV1EmploymentsEmploymentId2).toHaveBeenCalled();
      });
      const call = mockPatchV1EmploymentsEmploymentId2.mock.calls[0][0];
      expect(call.query).toEqual({
        skip_benefits: true,
        employment_basic_information_json_schema_version: 3, // ← Assert this
        contract_details_json_schema_version: 1, // default
      });
    });
  });

  describe('useCreateEmployment calls', () => {
    it('should call postCreateEmployment2 with default json_schema_version when creating new employment', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            // No employmentId = create new
            companyId: 'test-company-id',
            countryCode: 'PRT',
            skipSteps: ['select_country'],
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Submit basic_information to create employment
      await act(async () => {
        await result.current.onSubmit({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      await waitFor(() => {
        expect(mockPostV1Employments).toHaveBeenCalled();
      });

      const call = mockPostV1Employments.mock.calls[0][0];

      expect(call.query).toEqual({
        json_schema_version: 1,
      });
    });

    it('should call postCreateEmployment2 with custom employment_basic_information_json_schema_version', async () => {
      const { result } = renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode: 'ARG',
            skipSteps: ['select_country'],
            options: {
              jsonSchemaVersion: {
                employment_basic_information: 3,
              },
            },
          }),
        { wrapper: TestProviders },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.onSubmit({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      await waitFor(() => {
        expect(mockPostV1Employments).toHaveBeenCalled();
      });

      const call = mockPostV1Employments.mock.calls[0][0];

      expect(call.query).toEqual({
        json_schema_version: 3,
      });
    });
  });
});
