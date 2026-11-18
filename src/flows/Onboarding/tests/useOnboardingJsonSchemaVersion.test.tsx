import { act, renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { mockBenefitOffersSchema } from '@/src/common/api/fixtures/employments';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  employmentCreatedResponse,
  employmentDefaultResponse,
  employmentUpdatedResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { OnboardingFlowProps } from '@/src/flows/Onboarding/types';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const countrySchema = {
  data: {
    properties: {
      name: {
        type: 'string',
        title: 'Name',
        'x-jsf-presentation': { inputType: 'text' },
      },
      email: {
        type: 'string',
        title: 'Email',
        'x-jsf-presentation': { inputType: 'email' },
      },
    },
  },
};

const recorded = {
  schema: [] as URL[],
  benefitsSchema: [] as URL[],
  update: [] as URL[],
  create: [] as URL[],
};

const queryOf = (url: URL) => Object.fromEntries(url.searchParams);

const schemaRequests = (form: string) =>
  recorded.schema.filter((url) => url.pathname.endsWith(`/${form}`));

const renderOnboarding = (
  props: Partial<Parameters<typeof useOnboarding>[0]> & {
    options?: OnboardingFlowProps['options'];
  },
) =>
  renderHook(
    () =>
      useOnboarding({
        companyId: 'test-company-id',
        skipSteps: ['select_country'],
        ...props,
      }),
    { wrapper: TestProviders },
  );

describe('useOnboarding jsonSchemaVersion', () => {
  beforeEach(() => {
    queryClient.clear();
    recorded.schema.length = 0;
    recorded.benefitsSchema.length = 0;
    recorded.update.length = 0;
    recorded.create.length = 0;

    server.use(
      http.get('*/v1/countries/:countryCode/:form', ({ request }) => {
        recorded.schema.push(new URL(request.url));
        return HttpResponse.json(countrySchema);
      }),
      http.get(
        '*/v1/employments/:employmentId/benefit-offers/schema',
        ({ request }) => {
          recorded.benefitsSchema.push(new URL(request.url));
          return HttpResponse.json(mockBenefitOffersSchema);
        },
      ),
      http.patch('*/v1/employments/:employmentId', ({ request }) => {
        recorded.update.push(new URL(request.url));
        return HttpResponse.json(employmentUpdatedResponse);
      }),
      http.post('*/v1/employments', ({ request }) => {
        recorded.create.push(new URL(request.url));
        return HttpResponse.json(employmentCreatedResponse);
      }),
    );
  });

  describe('schema requests', () => {
    it('should pass jsonSchemaVersion 1 to basic information form as default', async () => {
      const { result } = renderOnboarding({
        countryCode: 'PRT',
        employmentId: 'test-employment-id',
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(schemaRequests('employment_basic_information')).toHaveLength(1);
      });

      const [request] = schemaRequests('employment_basic_information');

      expect(request.pathname).toBe(
        '/v1/countries/PRT/employment_basic_information',
      );
      expect(queryOf(request)).toEqual({
        skip_benefits: 'true',
        json_schema_version: '1',
      });
    });

    it('should pass jsonSchemaVersion 1 to contract details form as default', async () => {
      const { result } = renderOnboarding({
        countryCode: 'PRT',
        employmentId: 'test-employment-id',
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(schemaRequests('contract_details')).toHaveLength(1);
      });

      const [request] = schemaRequests('contract_details');

      expect(request.pathname).toBe('/v1/countries/PRT/contract_details');
      expect(queryOf(request)).toEqual({
        skip_benefits: 'true',
        employment_id: 'test-employment-id',
        json_schema_version: '1',
      });
    });

    it('should pass jsonSchemaVersionByCountry to contract details form', async () => {
      const { result } = renderOnboarding({
        countryCode: 'DEU',
        employmentId: 'test-employment-id',
        options: {
          jsonSchemaVersionByCountry: { DEU: { contract_details: 2 } },
        },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.goTo('contract_details');
      });

      await waitFor(() => {
        expect(schemaRequests('contract_details')).toHaveLength(1);
      });

      const [request] = schemaRequests('contract_details');

      expect(request.pathname).toBe('/v1/countries/DEU/contract_details');
      expect(queryOf(request)).toEqual({
        skip_benefits: 'true',
        employment_id: 'test-employment-id',
        json_schema_version: '2',
      });
    });

    it('should pass custom jsonSchemaVersion to basic information form', async () => {
      const { result } = renderOnboarding({
        countryCode: 'PRT',
        employmentId: 'test-employment-id',
        options: { jsonSchemaVersion: { employment_basic_information: 2 } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(schemaRequests('employment_basic_information')).toHaveLength(1);
      });

      const [request] = schemaRequests('employment_basic_information');

      expect(request.pathname).toBe(
        '/v1/countries/PRT/employment_basic_information',
      );
      expect(queryOf(request)).toEqual({
        skip_benefits: 'true',
        json_schema_version: '2',
      });
    });

    it('should pass custom benefit_offers_form_schema version to the benefit offers schema', async () => {
      const { result } = renderOnboarding({
        countryCode: 'PRT',
        employmentId: 'test-employment-id',
        options: { jsonSchemaVersion: { benefit_offers_form_schema: 2 } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.goTo('benefits');
      });

      await waitFor(() => {
        expect(recorded.benefitsSchema).toHaveLength(1);
      });

      expect(queryOf(recorded.benefitsSchema[0])).toEqual({
        json_schema_version: '2',
      });
    });
  });

  describe('contract details version per hiring model', () => {
    const options = {
      jsonSchemaVersionByCountry: {
        CZE: { contract_details: { cze_consulting: 7, cze_tea: 1 } },
      },
    };

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
            return HttpResponse.json({
              ...employmentDefaultResponse,
              data: {
                ...employmentDefaultResponse.data,
                employment: {
                  ...employmentDefaultResponse.data.employment,
                  id: String(params.employmentId),
                  eor_hiring_model: hiringModel,
                  country: {
                    ...employmentDefaultResponse.data.employment.country,
                    code: 'CZE',
                    name: 'Czech Republic',
                  },
                },
              },
            });
          }),
        );

        const { result } = renderOnboarding({
          countryCode: 'CZE',
          employmentId: 'test-employment-id',
          options,
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        await waitFor(() => {
          expect(schemaRequests('contract_details')).toHaveLength(1);
        });

        expect(queryOf(schemaRequests('contract_details')[0])).toEqual({
          skip_benefits: 'true',
          employment_id: 'test-employment-id',
          json_schema_version: version,
        });
      },
    );
  });

  describe('update employment request', () => {
    it('should send the default contract_details_json_schema_version when submitting contract_details', async () => {
      const { result } = renderOnboarding({
        employmentId: 'existing-employment-id',
        countryCode: 'DEU',
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.goTo('contract_details');
      });

      await act(async () => {
        await result.current.onSubmit({
          job_title: 'Engineer',
          start_date: '2024-01-01',
        });
      });

      await waitFor(() => {
        expect(recorded.update).toHaveLength(1);
      });

      expect(queryOf(recorded.update[0])).toEqual({
        skip_benefits: 'true',
        employment_basic_information_json_schema_version: '1',
        contract_details_json_schema_version: '1',
      });
    });

    it('should send the custom contract_details_json_schema_version when submitting contract_details', async () => {
      const { result } = renderOnboarding({
        employmentId: 'existing-employment-id',
        countryCode: 'DEU',
        options: {
          jsonSchemaVersionByCountry: { DEU: { contract_details: 2 } },
        },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.goTo('contract_details');
      });

      await act(async () => {
        await result.current.onSubmit({
          job_title: 'Engineer',
          start_date: '2024-01-01',
        });
      });

      await waitFor(() => {
        expect(recorded.update).toHaveLength(1);
      });

      expect(queryOf(recorded.update[0])).toEqual({
        skip_benefits: 'true',
        employment_basic_information_json_schema_version: '1',
        contract_details_json_schema_version: '2',
      });
    });

    it('should send the custom employment_basic_information_json_schema_version when submitting basic_information', async () => {
      const { result } = renderOnboarding({
        employmentId: 'existing-employment-id',
        countryCode: 'PRT',
        options: { jsonSchemaVersion: { employment_basic_information: 3 } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.goTo('basic_information');
      });

      await act(async () => {
        await result.current.onSubmit({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      await waitFor(() => {
        expect(recorded.update).toHaveLength(1);
      });

      expect(queryOf(recorded.update[0])).toEqual({
        skip_benefits: 'true',
        employment_basic_information_json_schema_version: '3',
        contract_details_json_schema_version: '1',
      });
    });
  });

  describe('create employment request', () => {
    it('should send the default json_schema_version when creating a new employment', async () => {
      const { result } = renderOnboarding({ countryCode: 'PRT' });

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
        expect(recorded.create).toHaveLength(1);
      });

      expect(queryOf(recorded.create[0])).toEqual({ json_schema_version: '1' });
    });

    it('should send the custom employment_basic_information_json_schema_version when creating a new employment', async () => {
      const { result } = renderOnboarding({
        countryCode: 'ARG',
        options: { jsonSchemaVersion: { employment_basic_information: 3 } },
      });

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
        expect(recorded.create).toHaveLength(1);
      });

      expect(queryOf(recorded.create[0])).toEqual({ json_schema_version: '3' });
    });
  });
});
