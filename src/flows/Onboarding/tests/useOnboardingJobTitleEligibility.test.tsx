import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  contractDetailsSchemaJobTitleEligibility,
  employmentDefaultResponse,
  employmentUpdatedResponse,
  jobTitleEligibilityCheckResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const roleDescription =
  'Leads product discovery, owns the roadmap, partners with design and engineering, and reports on product outcomes to leadership.';

const roleValues = {
  role_description: roleDescription,
  role_is_onsite: 'no',
  role_requires_license: 'no',
};

describe.each(['ESP', 'PRT'])(
  'useOnboarding job title eligibility (%s)',
  (countryCode) => {
    let eligibilityRequests: Record<string, unknown>[];
    let updateRequests: Record<string, unknown>[];
    let employmentContractDetails: Record<string, unknown> | null;

    const renderOnboarding = (features: 'job_title_eligibility'[] = []) =>
      renderHook(
        () =>
          useOnboarding({
            companyId: 'test-company-id',
            countryCode,
            employmentId: 'test-employment-id',
            skipSteps: ['select_country'],
            options: { features },
          }),
        { wrapper: TestProviders },
      );

    const goToContractDetails = async (
      result: ReturnType<typeof renderOnboarding>['result'],
    ) => {
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      act(() => {
        result.current.goTo('contract_details');
      });
      await waitFor(() => {
        expect(
          result.current.fields.some(
            (field) => field.name === 'role_description',
          ),
        ).toBe(true);
      });
    };

    beforeEach(() => {
      queryClient.clear();
      eligibilityRequests = [];
      updateRequests = [];
      employmentContractDetails = null;

      server.use(
        http.get('*/v1/employments/:id', ({ params }) =>
          HttpResponse.json({
            ...employmentDefaultResponse,
            data: {
              ...employmentDefaultResponse.data,
              employment: {
                ...employmentDefaultResponse.data.employment,
                id: params?.id,
                status: 'created',
                contract_details: employmentContractDetails,
                country: {
                  code: countryCode,
                  name: countryCode,
                  alpha_2_code: countryCode.slice(0, 2),
                  supported_json_schemas: ['employment_basic_information'],
                },
              },
            },
          }),
        ),
        http.get(
          `*/v1/countries/${countryCode}/employment_basic_information*`,
          () =>
            HttpResponse.json({
              data: {
                properties: {
                  name: { type: 'string', title: 'Name' },
                },
              },
            }),
        ),
        http.get(`*/v1/countries/${countryCode}/contract_details*`, () =>
          HttpResponse.json(contractDetailsSchemaJobTitleEligibility),
        ),
        http.post(
          '*/v2/employments/:id/job-title-eligibility-check',
          async ({ request }) => {
            eligibilityRequests.push(
              (await request.json()) as Record<string, unknown>,
            );
            return HttpResponse.json(jobTitleEligibilityCheckResponse);
          },
        ),
        http.patch('*/v1/employments/:id', async ({ request }) => {
          updateRequests.push(
            (await request.json()) as Record<string, unknown>,
          );
          return HttpResponse.json(employmentUpdatedResponse);
        }),
      );
    });

    it('checks eligibility when entering contract details with the role fields filled', async () => {
      employmentContractDetails = roleValues;
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      await waitFor(() => {
        expect(eligibilityRequests).toEqual([roleValues]);
      });
    });

    it('does not check eligibility until every role field is filled and valid', async () => {
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      await act(async () => {
        await result.current.checkJobTitleEligibility({
          role_description: roleDescription,
          role_is_onsite: 'no',
        });
      });
      await act(async () => {
        await result.current.checkJobTitleEligibility({
          ...roleValues,
          role_description: 'Too short',
        });
      });

      expect(eligibilityRequests).toEqual([]);
    });

    it('re-checks eligibility only when the role answers change', async () => {
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      await act(async () => {
        await result.current.checkJobTitleEligibility(roleValues);
      });
      await act(async () => {
        await result.current.checkJobTitleEligibility(roleValues);
      });
      await act(async () => {
        await result.current.checkJobTitleEligibility({
          ...roleValues,
          role_is_onsite: 'yes',
        });
      });

      expect(eligibilityRequests).toEqual([
        roleValues,
        { ...roleValues, role_is_onsite: 'yes' },
      ]);
    });

    it('reports isSubmitting while the check is in flight', async () => {
      let resolveCheck: () => void = () => {};
      server.use(
        http.post(
          '*/v2/employments/:id/job-title-eligibility-check',
          async () => {
            await new Promise<void>((resolve) => {
              resolveCheck = resolve;
            });
            return HttpResponse.json(jobTitleEligibilityCheckResponse);
          },
        ),
      );
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      act(() => {
        result.current.checkJobTitleEligibility(roleValues);
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      resolveCheck();

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('sends the check id as the slug when submitting contract details', async () => {
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      await act(async () => {
        await result.current.onSubmit(roleValues);
      });

      expect(eligibilityRequests).toEqual([roleValues]);
      expect(updateRequests).toHaveLength(1);
      expect(updateRequests[0].contract_details).toEqual({
        ...roleValues,
        additional_job_title_eligibility_check_slug: 'check-id-123',
      });
    });

    it('returns the check error instead of submitting contract details', async () => {
      server.use(
        http.post('*/v2/employments/:id/job-title-eligibility-check', () =>
          HttpResponse.json(
            { message: 'Job title is invalid' },
            { status: 422 },
          ),
        ),
      );
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      let response: Awaited<ReturnType<typeof result.current.onSubmit>>;
      await act(async () => {
        response = await result.current.onSubmit(roleValues);
      });

      expect(response!).toEqual({
        data: null,
        error: new Error('Job title is invalid'),
        rawError: { message: 'Job title is invalid' },
        fieldErrors: [],
      });
      expect(updateRequests).toEqual([]);
    });

    it('does nothing when the feature is disabled', async () => {
      employmentContractDetails = roleValues;
      const { result } = renderOnboarding();

      await goToContractDetails(result);

      await act(async () => {
        await result.current.checkJobTitleEligibility(roleValues);
        await result.current.onSubmit(roleValues);
      });

      expect(eligibilityRequests).toEqual([]);
      expect(updateRequests[0].contract_details).toEqual(roleValues);
    });
  },
);
