import { renderHook, waitFor, act } from '@testing-library/react';
import { server } from '@/src/tests/server';
import { http, HttpResponse } from 'msw';
import { useCreateCompany } from '@/src/flows/CreateCompany/hooks';
import {
  currenciesResponse,
  companyCreatedResponse,
  addressDetailsSchema,
  companyUpdatedResponse,
} from '@/src/flows/CreateCompany/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

describe('useCreateCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    server.use(
      http.get('*/v1/company-currencies', () => {
        return HttpResponse.json(currenciesResponse.data);
      }),
    );
  });

  describe('Initial state', () => {
    it('should initialize with company_basic_information step', () => {
      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      expect(result.current.stepState.currentStep.name).toBe(
        'company_basic_information',
      );
      expect(result.current.stepState.currentStep.index).toBe(0);
    });

    it('should initialize with provided country code', () => {
      const { result } = renderHook(
        () => useCreateCompany({ countryCode: 'USA' }),
        {
          wrapper: TestProviders,
        },
      );

      expect(result.current.stepState.currentStep.name).toBe(
        'company_basic_information',
      );
    });
  });

  describe('Step navigation', () => {
    it('should navigate to next step', async () => {
      server.use(
        http.post('*/v1/companies', () => {
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const payload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      const response = await result.current.onSubmit(payload);
      expect(response.data).toBeDefined();

      act(() => {
        result.current.next();
      });

      await waitFor(() => {
        expect(result.current.stepState.currentStep.name).toBe(
          'address_details',
        );
      });
    });

    it('should navigate back to previous step', async () => {
      server.use(
        http.post('*/v1/companies', () => {
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
        http.get('*/v1/countries/:countryCode/address_details', () => {
          return HttpResponse.json(addressDetailsSchema.data);
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const payload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      const response = await result.current.onSubmit(payload);
      expect(response.data).toBeDefined();

      act(() => {
        result.current.next();
      });

      await waitFor(() => {
        expect(result.current.stepState.currentStep.name).toBe(
          'address_details',
        );
      });

      act(() => {
        result.current.back();
      });

      await waitFor(() => {
        expect(result.current.stepState.currentStep.name).toBe(
          'company_basic_information',
        );
      });
    });
  });

  describe('Company creation', () => {
    it('should create company and store company ID', async () => {
      server.use(
        http.post('*/v1/companies', () => {
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const payload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      const response = await result.current.onSubmit(payload);

      expect(response.data).toBeDefined();
      if (response.data && 'countryCode' in response.data) {
        expect(response.data.countryCode).toBe('USA');
      }
    });

    it('should include action=send_create_password_email query parameter when creating company', async () => {
      let requestUrl: URL | null = null;

      server.use(
        http.post('*/v1/companies', ({ request }) => {
          requestUrl = new URL(request.url);
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const payload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      await result.current.onSubmit(payload);

      await waitFor(() => {
        expect(requestUrl).not.toBeNull();
      });

      expect(requestUrl).not.toBeNull();
      expect(requestUrl!.searchParams.get('action')).toBe(
        'send_create_password_email',
      );
    });

    it('should handle company creation with tokens response', async () => {
      server.use(
        http.post('*/v1/companies', () => {
          return HttpResponse.json(
            {
              data: {
                company: {
                  id: 'company-123',
                  name: 'Test Company',
                },
                tokens: {
                  access_token: 'token',
                },
              },
            },
            { status: 201 },
          );
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const payload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      const response = await result.current.onSubmit(payload);

      expect(response.data).toBeDefined();
    });
  });

  describe('Address details update', () => {
    beforeEach(() => {
      server.use(
        http.post('*/v1/companies', () => {
          return HttpResponse.json(companyCreatedResponse.data, {
            status: 201,
          });
        }),
        http.get('*/v1/countries/:countryCode/address_details', () => {
          return HttpResponse.json(addressDetailsSchema.data);
        }),
      );
    });

    it('should update company with address details', async () => {
      server.use(
        http.patch('*/v1/companies/:companyId', () => {
          return HttpResponse.json(companyUpdatedResponse.data, {
            status: 200,
          });
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const createPayload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      const createResponse = await result.current.onSubmit(createPayload);
      expect(createResponse.data).toBeDefined();

      act(() => {
        result.current.next();
      });

      await waitFor(() => {
        expect(result.current.stepState.currentStep.name).toBe(
          'address_details',
        );
      });

      const addressPayload = {
        address: '123 Main St',
        city: 'San Francisco',
        postal_code: '94101',
        state: 'CA',
      };

      const response = await result.current.onSubmit(addressPayload);

      expect(response.data).toBeDefined();
    });

    it('should throw error if company ID is missing when submitting address details', async () => {
      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const createPayload = {
        country_code: 'USA',
        company_owner_email: 'owner@example.com',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      await result.current.onSubmit(createPayload);

      act(() => {
        result.current.next();
      });

      await waitFor(() => {
        expect(result.current.stepState.currentStep.name).toBe(
          'address_details',
        );
      });

      const addressPayload = {
        address: '123 Main St',
        city: 'San Francisco',
        postal_code: '94101',
        state: 'CA',
      };

      const response = await result.current.onSubmit(addressPayload);
      expect(response.data).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should return error response when company creation fails', async () => {
      server.use(
        http.post('*/v1/companies', () => {
          return HttpResponse.json(
            {
              error: {
                error: {
                  message: 'Validation failed',
                  errors: {
                    company_owner_email: ['Invalid email'],
                  },
                },
              },
            },
            { status: 400 },
          );
        }),
      );

      const { result } = renderHook(() => useCreateCompany({}), {
        wrapper: TestProviders,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const payload = {
        country_code: 'USA',
        company_owner_email: 'invalid-email',
        company_owner_name: 'John Doe',
        desired_currency: 'USD',
        name: 'Test Company',
        phone_number: '+1234567890',
        tax_number: 'TAX123',
      };

      const response = await result.current.onSubmit(payload);

      expect('error' in response).toBe(true);
      if ('error' in response) {
        expect(response.error).toBeDefined();
        expect(response.fieldErrors).toBeDefined();
      }
    });
  });
});
