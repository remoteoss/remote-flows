import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  contractDetailsSchemaJobTitleEligibility,
  contractDetailsSchemaJobTitleEligibilityWithResult,
  employmentDefaultResponse,
  employmentUpdatedResponse,
  jobTitleEligibilityCheckResponse,
  jobTitleEligibilityCheckResponses,
  jobTitleEligibilityCheckRiskyResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const roleDescription =
  'Leads product discovery, owns the roadmap, partners with design and engineering, and reports on product outcomes to leadership.';

const findField = (fields: Record<string, unknown>[], name: string) =>
  fields.find((field) => field.name === name);

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

    const respondToEligibilityCheck = (
      respond: (body: Record<string, unknown>) => Response | Promise<Response>,
    ) =>
      http.post(
        '*/v2/employments/:id/job-title-eligibility-check',
        async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          eligibilityRequests.push(body);
          return respond(body);
        },
      );

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
        respondToEligibilityCheck(() =>
          HttpResponse.json(jobTitleEligibilityCheckResponse),
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
        respondToEligibilityCheck(async () => {
          await new Promise<void>((resolve) => {
            resolveCheck = resolve;
          });
          return HttpResponse.json(jobTitleEligibilityCheckResponse);
        }),
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

    it('submits with its own check id when a newer check starts while it waits', async () => {
      const pendingChecks: (() => void)[] = [];
      server.use(
        respondToEligibilityCheck(async (body) => {
          await new Promise<void>((resolve) => {
            pendingChecks.push(resolve);
          });
          return HttpResponse.json({
            data: {
              job_title_eligibility_check: {
                check_id: `check-onsite-${body.role_is_onsite}`,
                verdict: 'needs_review',
              },
            },
          });
        }),
      );
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      let submission: ReturnType<typeof result.current.onSubmit>;
      act(() => {
        submission = result.current.onSubmit(roleValues);
      });
      await waitFor(() => {
        expect(pendingChecks).toHaveLength(1);
      });

      act(() => {
        result.current.checkJobTitleEligibility({
          ...roleValues,
          role_is_onsite: 'yes',
        });
      });

      pendingChecks[0]();
      await waitFor(() => {
        expect(pendingChecks).toHaveLength(2);
      });
      pendingChecks[1]();

      await act(async () => {
        await submission;
      });

      expect(updateRequests).toHaveLength(1);
      expect(updateRequests[0].contract_details).toEqual({
        ...roleValues,
        additional_job_title_eligibility_check_slug: 'check-onsite-no',
      });
    });

    it('returns the check error instead of submitting contract details', async () => {
      server.use(
        respondToEligibilityCheck(() =>
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

    it('does not add the check result when the schema does not declare it', async () => {
      server.use(
        respondToEligibilityCheck(() =>
          HttpResponse.json(jobTitleEligibilityCheckRiskyResponse),
        ),
      );
      const { result } = renderOnboarding(['job_title_eligibility']);

      await goToContractDetails(result);

      await act(async () => {
        await result.current.checkJobTitleEligibility(roleValues);
      });

      expect(
        findField(result.current.fields, 'employer_acknowledges_risk')
          ?.isVisible,
      ).toBe(false);

      await act(async () => {
        await result.current.onSubmit(roleValues);
      });

      expect(updateRequests[0].contract_details).toEqual({
        ...roleValues,
        additional_job_title_eligibility_check_slug: 'check-id-risky',
      });
    });

    describe('when the schema declares the check result', () => {
      beforeEach(() => {
        server.use(
          http.get(`*/v1/countries/${countryCode}/contract_details*`, () =>
            HttpResponse.json(
              contractDetailsSchemaJobTitleEligibilityWithResult,
            ),
          ),
          respondToEligibilityCheck(() =>
            HttpResponse.json(jobTitleEligibilityCheckRiskyResponse),
          ),
        );
      });

      it.each([
        {
          name: 'eligible from the job title alone',
          response: jobTitleEligibilityCheckResponses.eligibleByJobTitle,
          slug: null,
          result: 'yes',
          asksForAcknowledgement: false,
        },
        {
          name: 'eligible from the role answers',
          response: jobTitleEligibilityCheckResponses.eligibleByRoleAnswers,
          slug: 'check-id-eligible',
          result: 'yes',
          asksForAcknowledgement: false,
        },
        {
          name: 'not eligible',
          response: jobTitleEligibilityCheckResponses.notEligible,
          slug: null,
          result: 'no',
          asksForAcknowledgement: false,
        },
        {
          name: 'needs review',
          response: jobTitleEligibilityCheckResponses.needsReview,
          slug: 'check-id-review',
          result: 'maybe',
          asksForAcknowledgement: false,
        },
        {
          name: 'eligible with risk acknowledgement',
          response:
            jobTitleEligibilityCheckResponses.eligibleWithRiskAcknowledgement,
          slug: 'check-id-risky',
          result: 'yes_with_ack',
          asksForAcknowledgement: true,
        },
        {
          name: 'not assessed',
          response: jobTitleEligibilityCheckResponses.notAssessed,
          slug: null,
          result: null,
          asksForAcknowledgement: false,
        },
      ])(
        'reacts to a $name verdict',
        async ({
          response,
          slug,
          result: checkResult,
          asksForAcknowledgement,
        }) => {
          server.use(
            respondToEligibilityCheck(() => HttpResponse.json(response)),
          );
          const { result } = renderOnboarding(['job_title_eligibility']);

          await goToContractDetails(result);

          await act(async () => {
            await result.current.checkJobTitleEligibility(roleValues);
          });

          expect(
            findField(result.current.fields, 'employer_acknowledges_risk')
              ?.isVisible,
          ).toBe(asksForAcknowledgement);

          const acknowledgement = asksForAcknowledgement
            ? { employer_acknowledges_risk: 'acknowledged' }
            : {};

          await act(async () => {
            await result.current.onSubmit({
              ...roleValues,
              ...acknowledgement,
            });
          });

          expect(updateRequests[0].contract_details).toEqual({
            ...roleValues,
            ...acknowledgement,
            additional_job_title_eligibility_check_slug: slug,
            additional_job_title_eligibility_check_result: checkResult,
          });
        },
      );

      it('requires the risk acknowledgement once the check flags the role as risky', async () => {
        const { result } = renderOnboarding(['job_title_eligibility']);

        await goToContractDetails(result);

        expect(
          findField(result.current.fields, 'employer_acknowledges_risk')
            ?.isVisible,
        ).toBe(false);

        await act(async () => {
          await result.current.checkJobTitleEligibility(roleValues);
        });

        expect(
          findField(result.current.fields, 'employer_acknowledges_risk'),
        ).toMatchObject({ isVisible: true, required: true });

        let validation: Awaited<
          ReturnType<typeof result.current.handleValidation>
        >;
        await act(async () => {
          validation = await result.current.handleValidation(roleValues);
        });
        expect(Object.keys(validation!?.formErrors ?? {})).toEqual([
          'employer_acknowledges_risk',
        ]);

        await act(async () => {
          await result.current.onSubmit({
            ...roleValues,
            employer_acknowledges_risk: 'acknowledged',
          });
        });

        expect(updateRequests[0].contract_details).toEqual({
          ...roleValues,
          employer_acknowledges_risk: 'acknowledged',
          additional_job_title_eligibility_check_slug: 'check-id-risky',
          additional_job_title_eligibility_check_result: 'yes_with_ack',
        });
      });

      it('asks for the risk acknowledgement instead of submitting when the submit check is the first to flag it', async () => {
        const { result } = renderOnboarding(['job_title_eligibility']);

        await goToContractDetails(result);

        let response: Awaited<ReturnType<typeof result.current.onSubmit>>;
        await act(async () => {
          response = await result.current.onSubmit(roleValues);
        });

        expect(updateRequests).toEqual([]);
        expect(response!).toEqual({
          data: null,
          error: new Error(
            'The job title eligibility check requires changes to the contract details',
          ),
          rawError: {
            employer_acknowledges_risk: 'Please acknowledge this field',
          },
          fieldErrors: [
            {
              field: 'employer_acknowledges_risk',
              messages: ['Please acknowledge this field'],
            },
          ],
        });
        expect(
          findField(result.current.fields, 'employer_acknowledges_risk'),
        ).toMatchObject({ isVisible: true, required: true });

        await act(async () => {
          await result.current.onSubmit({
            ...roleValues,
            employer_acknowledges_risk: 'acknowledged',
          });
        });

        expect(eligibilityRequests).toEqual([roleValues]);
        expect(updateRequests[0].contract_details).toEqual({
          ...roleValues,
          employer_acknowledges_risk: 'acknowledged',
          additional_job_title_eligibility_check_slug: 'check-id-risky',
          additional_job_title_eligibility_check_result: 'yes_with_ack',
        });
      });

      it('does not submit without the acknowledgement when an earlier check already flagged the role', async () => {
        const { result } = renderOnboarding(['job_title_eligibility']);

        await goToContractDetails(result);

        await act(async () => {
          await result.current.checkJobTitleEligibility(roleValues);
        });

        let response: Awaited<ReturnType<typeof result.current.onSubmit>>;
        await act(async () => {
          response = await result.current.onSubmit(roleValues);
        });

        expect(updateRequests).toEqual([]);
        expect(response!).toEqual({
          data: null,
          error: new Error(
            'The job title eligibility check requires changes to the contract details',
          ),
          rawError: {
            employer_acknowledges_risk: 'Please acknowledge this field',
          },
          fieldErrors: [
            {
              field: 'employer_acknowledges_risk',
              messages: ['Please acknowledge this field'],
            },
          ],
        });
        expect(eligibilityRequests).toEqual([roleValues]);
      });

      it('drops the check from an earlier visit when contract details is left and entered again', async () => {
        employmentContractDetails = roleValues;
        let releaseFirstCheck: () => void = () => {};
        let firstCheckAborted = false;
        server.use(
          http.post(
            '*/v2/employments/:id/job-title-eligibility-check',
            async ({ request }) => {
              eligibilityRequests.push(
                (await request.json()) as Record<string, unknown>,
              );
              if (eligibilityRequests.length > 1) {
                return HttpResponse.json(jobTitleEligibilityCheckRiskyResponse);
              }
              request.signal.addEventListener('abort', () => {
                firstCheckAborted = true;
              });
              await new Promise<void>((resolve) => {
                releaseFirstCheck = resolve;
              });
              return HttpResponse.json(
                jobTitleEligibilityCheckResponses.eligibleByRoleAnswers,
              );
            },
          ),
        );
        const { result } = renderOnboarding(['job_title_eligibility']);

        await goToContractDetails(result);
        await waitFor(() => {
          expect(eligibilityRequests).toHaveLength(1);
        });

        act(() => {
          result.current.goTo('basic_information');
        });
        await waitFor(() => {
          expect(firstCheckAborted).toBe(true);
        });

        await goToContractDetails(result);
        await waitFor(() => {
          expect(
            findField(result.current.fields, 'employer_acknowledges_risk')
              ?.isVisible,
          ).toBe(true);
        });

        releaseFirstCheck();

        await act(async () => {
          await result.current.onSubmit({
            ...roleValues,
            employer_acknowledges_risk: 'acknowledged',
          });
        });

        expect(eligibilityRequests).toEqual([roleValues, roleValues]);
        expect(
          findField(result.current.fields, 'employer_acknowledges_risk')
            ?.isVisible,
        ).toBe(true);
        expect(updateRequests[0].contract_details).toEqual({
          ...roleValues,
          employer_acknowledges_risk: 'acknowledged',
          additional_job_title_eligibility_check_slug: 'check-id-risky',
          additional_job_title_eligibility_check_result: 'yes_with_ack',
        });
      });

      it('hides the risk acknowledgement again when the role answers are no longer complete', async () => {
        const { result } = renderOnboarding(['job_title_eligibility']);

        await goToContractDetails(result);

        await act(async () => {
          await result.current.checkJobTitleEligibility(roleValues);
        });
        expect(
          findField(result.current.fields, 'employer_acknowledges_risk')
            ?.isVisible,
        ).toBe(true);

        await act(async () => {
          await result.current.checkJobTitleEligibility({
            ...roleValues,
            role_description: '',
          });
        });

        expect(
          findField(result.current.fields, 'employer_acknowledges_risk')
            ?.isVisible,
        ).toBe(false);
      });
    });
  },
);
