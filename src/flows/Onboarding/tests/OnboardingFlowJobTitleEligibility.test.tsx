import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV1Portugal,
  contractDetailsSchemaV0JobTitleEligibility,
  contractDetailsSchemaV1JobTitleEligibility,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import {
  OnboardingFlowProps,
  OnboardingRenderProps,
} from '@/src/flows/Onboarding/types';
import { fillRadio, queryClient, TestProviders } from '@/src/tests/testHelpers';
import { server } from '@/src/tests/server';
import { $TSFixMe } from '@/src/types/remoteFlows';

const schemaPaths = [
  {
    jsfVersion: 'v1',
    countryCode: 'ITA',
    countryName: 'Italy',
    schema: contractDetailsSchemaV1JobTitleEligibility,
  },
  {
    jsfVersion: 'v0',
    countryCode: 'VNM',
    countryName: 'Vietnam',
    schema: contractDetailsSchemaV0JobTitleEligibility,
  },
];

describe.each(schemaPaths)(
  'OnboardingFlow - job title eligibility check on blur (jsf $jsfVersion)',
  ({ countryCode, countryName, schema }) => {
    let latestOnboardingBag: $TSFixMe;

    const mockRender = vi.fn(
      ({ onboardingBag, components }: OnboardingRenderProps) => {
        latestOnboardingBag = onboardingBag;
        const { ContractDetailsStep, SubmitButton } = components;

        if (onboardingBag.stepState.currentStep.name !== 'contract_details') {
          return null;
        }

        return (
          <>
            <ContractDetailsStep />
            <SubmitButton>Continue</SubmitButton>
          </>
        );
      },
    );

    const jobTitleEligibilityCheckSpy = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      mockRender.mockReset();
      queryClient.clear();

      server.use(
        http.get('*/v1/employments/:id', ({ params }) => {
          return HttpResponse.json({
            ...employmentDefaultResponse,
            data: {
              ...employmentDefaultResponse.data,
              employment: {
                ...employmentDefaultResponse.data.employment,
                id: params?.id,
                country: {
                  code: countryCode,
                  name: countryName,
                  alpha_2_code: countryCode.slice(0, 2),
                  supported_json_schemas: ['employment_basic_information'],
                },
              },
            },
          });
        }),
        http.get(
          `*/v1/countries/${countryCode}/employment_basic_information*`,
          () => {
            return HttpResponse.json({
              data: { properties: { name: { type: 'string', title: 'Name' } } },
            });
          },
        ),
        http.get(`*/v1/countries/${countryCode}/contract_details*`, () => {
          return HttpResponse.json(schema);
        }),
        http.post(
          '*/v2/employments/:id/job-title-eligibility-check',
          async ({ request }) => {
            jobTitleEligibilityCheckSpy(await request.json());
            return HttpResponse.json({
              data: {
                job_title_eligibility_check: {
                  check_id: 'job-title-eligibility-check-id',
                  verdict: 'eligible',
                },
              },
            });
          },
        ),
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const renderContractDetailsStep = async ({
      features = ['job_title_eligibility'],
    }: {
      features?: NonNullable<OnboardingFlowProps['options']>['features'];
    } = {}) => {
      render(
        <OnboardingFlow
          companyId='test-company-id'
          employmentId='test-employment-id'
          skipSteps={['select_country']}
          options={{ features }}
          render={mockRender}
        />,
        { wrapper: TestProviders },
      );

      await waitFor(() => expect(latestOnboardingBag.isLoading).toBe(false));

      act(() => {
        latestOnboardingBag.goTo('contract_details');
      });

      await screen.findByLabelText(/Role description/i);
    };

    const fillRoleFields = async () => {
      const user = userEvent.setup();
      const roleDescription = screen.getByLabelText(/Role description/i);

      await user.clear(roleDescription);
      await user.type(roleDescription, 'Backend engineer responsibilities');
      await fillRadio('Will this role require working onsite', 'no');
      await fillRadio('Does this role require a professional license', 'no');
      // Blur the last field touched so the values captured on blur include
      // all three role fields already committed.
      await user.tab();
    };

    it('keeps the risk acknowledgement hidden when the check is not enabled', async () => {
      await renderContractDetailsStep({ features: [] });

      await fillRoleFields();

      expect(jobTitleEligibilityCheckSpy).not.toHaveBeenCalled();
      expect(
        screen.queryByLabelText(/I acknowledge the risks/i),
      ).not.toBeInTheDocument();
    });

    it('calls the job title eligibility check once the role fields are filled and blurred', async () => {
      await renderContractDetailsStep();

      await fillRoleFields();

      await waitFor(() =>
        expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1),
      );
      expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledWith({
        job_title: 'pm',
        role_description: 'Backend engineer responsibilities',
        role_is_onsite: 'no',
        role_requires_license: 'no',
      });
    });

    it('checks with the job title the user saved earlier in the same session', async () => {
      let savedJobTitle = 'Software Engineer';
      let releaseRefetch: () => void = () => {};
      const refetchReleased = new Promise<void>((resolve) => {
        releaseRefetch = resolve;
      });
      server.use(
        http.get(
          `*/v1/countries/${countryCode}/employment_basic_information*`,
          () => HttpResponse.json(basicInformationSchemaV1Portugal),
        ),
        http.get('*/v1/employments/:id', async ({ params }) => {
          const { employment } = employmentDefaultResponse.data;
          if (savedJobTitle === 'Surgeon') {
            await refetchReleased;
          }
          return HttpResponse.json({
            ...employmentDefaultResponse,
            data: {
              ...employmentDefaultResponse.data,
              employment: {
                ...employment,
                id: params?.id,
                country: {
                  code: countryCode,
                  name: countryName,
                  alpha_2_code: countryCode.slice(0, 2),
                  supported_json_schemas: ['employment_basic_information'],
                },
                basic_information: {
                  ...employment.basic_information,
                  job_title: savedJobTitle,
                },
              },
            },
          });
        }),
        http.patch('*/v1/employments/:id', async ({ request }) => {
          const body = (await request.json()) as {
            basic_information: { job_title: string };
          };
          savedJobTitle = body.basic_information.job_title;
          return HttpResponse.json(employmentDefaultResponse);
        }),
      );

      render(
        <OnboardingFlow
          companyId='test-company-id'
          employmentId='test-employment-id'
          skipSteps={['select_country']}
          options={{ features: ['job_title_eligibility'] }}
          render={({ onboardingBag, components }) => {
            const { BasicInformationStep, ContractDetailsStep, SubmitButton } =
              components;
            if (onboardingBag.isLoading) {
              return null;
            }
            return (
              <>
                {onboardingBag.stepState.currentStep.name ===
                'basic_information' ? (
                  <BasicInformationStep />
                ) : (
                  <ContractDetailsStep />
                )}
                <SubmitButton>Continue</SubmitButton>
              </>
            );
          }}
        />,
        { wrapper: TestProviders },
      );

      const user = userEvent.setup();
      const jobTitle = await screen.findByLabelText(/Job title/i);
      await user.clear(jobTitle);
      await user.type(jobTitle, 'Surgeon');
      screen.getByRole('button', { name: 'Continue' }).click();

      await waitFor(() => expect(savedJobTitle).toBe('Surgeon'));
      expect(screen.getByLabelText(/Job title/i)).toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Role description/i),
      ).not.toBeInTheDocument();

      releaseRefetch();
      await screen.findByLabelText(/Role description/i);
      await fillRoleFields();

      await waitFor(() =>
        expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1),
      );
      expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledWith({
        job_title: 'Surgeon',
        role_description: 'Backend engineer responsibilities',
        role_is_onsite: 'no',
        role_requires_license: 'no',
      });
    });

    it('does not call the check again when a later blur carries the same values', async () => {
      await renderContractDetailsStep();

      await fillRoleFields();
      await waitFor(() =>
        expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1),
      );

      const user = userEvent.setup();
      const roleDescription = screen.getByLabelText(/Role description/i);
      await user.click(roleDescription);
      await user.tab();

      // user.tab() doesn't wait for checkJobTitleEligibility - the onBlur handler
      // doesn't await it, so a duplicate request (if the dedup were ever broken)
      // could still be in flight right now. We wait up to 200ms to give it a
      // chance to show up before checking that it didn't. waitFor normally throws
      // if its condition never comes true, but here that's the outcome we want,
      // so we swallow it with .catch and let the assertion below do the real check.
      await waitFor(
        () => {
          expect(jobTitleEligibilityCheckSpy.mock.calls.length).toBeGreaterThan(
            1,
          );
        },
        { timeout: 200 },
      ).catch(() => undefined);

      expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1);
    });

    it('retries the check on a later blur when the previous request failed', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      let failing = true;
      const successSpy = vi.fn();
      server.use(
        http.post('*/v2/employments/:id/job-title-eligibility-check', () => {
          if (failing) {
            return HttpResponse.json(
              { message: 'Internal error' },
              { status: 500 },
            );
          }
          successSpy();
          return HttpResponse.json({
            data: {
              job_title_eligibility_check: {
                check_id: 'job-title-eligibility-check-id',
                verdict: 'eligible',
              },
            },
          });
        }),
      );

      await renderContractDetailsStep();

      await fillRoleFields();
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith(
          'Failed to fetch job title eligibility check',
        ),
      );
      expect(successSpy).not.toHaveBeenCalled();

      failing = false;
      const user = userEvent.setup();
      await user.click(screen.getByLabelText(/Role description/i));
      await user.tab();

      await waitFor(() => expect(successSpy).toHaveBeenCalledTimes(1));
    });

    it('disables the submit button while the check is running and re-enables it once it settles', async () => {
      let resolveCheck: () => void = () => {};
      const checkReleased = new Promise<void>((resolve) => {
        resolveCheck = resolve;
      });
      server.use(
        http.post(
          '*/v2/employments/:id/job-title-eligibility-check',
          async () => {
            await checkReleased;
            return HttpResponse.json({
              data: {
                job_title_eligibility_check: {
                  check_id: 'job-title-eligibility-check-id',
                  verdict: 'eligible',
                },
              },
            });
          },
        ),
      );

      await renderContractDetailsStep();
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeEnabled();

      await fillRoleFields();

      await waitFor(() => expect(submitButton).toBeDisabled());
      expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(true);

      resolveCheck();

      await waitFor(() => expect(submitButton).toBeEnabled());
      expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(false);
    });

    it('aborts the in-flight check when the values change, without logging an error for it', async () => {
      const errorSpy = vi.spyOn(console, 'error');
      const fetchSignals: AbortSignal[] = [];
      const originalFetch = globalThis.fetch;
      vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
        if (
          input instanceof Request &&
          input.url.includes('job-title-eligibility-check')
        ) {
          fetchSignals.push(input.signal);
        }
        return originalFetch(input, init);
      });
      const requests: {
        roleDescription: string;
        release: () => void;
      }[] = [];
      server.use(
        http.post(
          '*/v2/employments/:id/job-title-eligibility-check',
          async ({ request }) => {
            const body = (await request.json()) as { role_description: string };
            let release: () => void = () => {};
            const released = new Promise<void>((resolve) => {
              release = resolve;
            });
            requests.push({
              roleDescription: body.role_description,
              release,
            });
            await released;
            return HttpResponse.json({
              data: {
                job_title_eligibility_check: {
                  check_id: 'job-title-eligibility-check-id',
                  verdict: 'eligible',
                },
              },
            });
          },
        ),
      );

      await renderContractDetailsStep();
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      await fillRoleFields();
      await waitFor(() => expect(requests).toHaveLength(1));

      const user = userEvent.setup();
      const roleDescription = screen.getByLabelText(/Role description/i);
      await user.clear(roleDescription);
      await user.type(roleDescription, 'Frontend engineer responsibilities');
      await user.tab();

      await waitFor(() => expect(requests).toHaveLength(2));
      expect(fetchSignals[0].aborted).toBe(true);
      expect(requests[1].roleDescription).toBe(
        'Frontend engineer responsibilities',
      );
      expect(submitButton).toBeDisabled();

      requests[1].release();

      await waitFor(() => expect(submitButton).toBeEnabled());
      expect(errorSpy).not.toHaveBeenCalledWith(
        'Failed to fetch job title eligibility check',
      );
    });

    it('stops reporting the check as running once the user leaves contract details', async () => {
      server.use(
        http.post(
          '*/v2/employments/:id/job-title-eligibility-check',
          () => new Promise<never>(() => {}),
        ),
      );

      await renderContractDetailsStep();
      await fillRoleFields();

      await waitFor(() =>
        expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(true),
      );

      act(() => {
        latestOnboardingBag.goTo('basic_information');
      });

      await waitFor(() =>
        expect(latestOnboardingBag.stepState.currentStep.name).toBe(
          'basic_information',
        ),
      );
      expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(false);
    });

    it('re-enables the submit button when the check fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      server.use(
        http.post('*/v2/employments/:id/job-title-eligibility-check', () =>
          HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
        ),
      );

      await renderContractDetailsStep();
      const submitButton = screen.getByRole('button', { name: 'Continue' });

      await fillRoleFields();

      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith(
          'Failed to fetch job title eligibility check',
        ),
      );
      await waitFor(() => expect(submitButton).toBeEnabled());
      expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(false);
    });

    describe('on mount with saved contract details', () => {
      const savedRoleAnswers = {
        role_description: 'Licensed onsite surgeon responsibilities',
        role_is_onsite: 'yes',
        role_requires_license: 'yes',
      };
      let mountVerdict: string;
      let checkReleased: Promise<void>;

      beforeEach(() => {
        mountVerdict = 'not_eligible';
        checkReleased = Promise.resolve();
        server.use(
          http.get('*/v1/employments/:id', ({ params }) => {
            const { employment } = employmentDefaultResponse.data;
            return HttpResponse.json({
              ...employmentDefaultResponse,
              data: {
                ...employmentDefaultResponse.data,
                employment: {
                  ...employment,
                  id: params?.id,
                  country: {
                    code: countryCode,
                    name: countryName,
                    alpha_2_code: countryCode.slice(0, 2),
                    supported_json_schemas: ['employment_basic_information'],
                  },
                  basic_information: {
                    ...employment.basic_information,
                    job_title: 'Surgeon',
                  },
                  contract_details: {
                    ...employment.contract_details,
                    ...savedRoleAnswers,
                    additional_job_title_eligibility_check_slug:
                      'saved-check-id',
                    additional_job_title_eligibility_check_result: 'maybe',
                  },
                },
              },
            });
          }),
          http.post(
            '*/v2/employments/:id/job-title-eligibility-check',
            async ({ request }) => {
              jobTitleEligibilityCheckSpy(await request.json());
              await checkReleased;
              return HttpResponse.json({
                data: {
                  job_title_eligibility_check: {
                    check_id: 'new-check-id',
                    verdict: mountVerdict,
                  },
                },
              });
            },
          ),
        );
      });

      it('replaces the saved verdict with a check against the current job title, without a blur', async () => {
        await renderContractDetailsStep();

        expect(
          await screen.findByText(
            `AI determined we can't hire this role in ${countryName}`,
          ),
        ).toBeInTheDocument();
        expect(
          screen.queryByText(
            `AI isn't sure if we can hire this role in ${countryName}`,
          ),
        ).not.toBeInTheDocument();
        expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1);
        expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledWith({
          job_title: 'Surgeon',
          ...savedRoleAnswers,
        });
      });

      it('asks for the risk acknowledgement on mount when the new verdict requires it', async () => {
        mountVerdict = 'eligible_with_risk_acknowledgement';

        await renderContractDetailsStep();

        expect(
          await screen.findByLabelText(/I acknowledge the risks/i),
        ).toBeInTheDocument();
      });

      it('disables the submit button while the mount check is running', async () => {
        let releaseCheck: () => void = () => {};
        checkReleased = new Promise<void>((resolve) => {
          releaseCheck = resolve;
        });

        await renderContractDetailsStep();
        const submitButton = screen.getByRole('button', { name: 'Continue' });

        await waitFor(() => expect(submitButton).toBeDisabled());

        releaseCheck();

        await waitFor(() => expect(submitButton).toBeEnabled());
      });

      it('does not call the check again when the step mounts again with nothing changed', async () => {
        await renderContractDetailsStep();
        await waitFor(() =>
          expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1),
        );

        act(() => {
          latestOnboardingBag.goTo('basic_information');
        });
        await waitFor(() =>
          expect(latestOnboardingBag.stepState.currentStep.name).toBe(
            'basic_information',
          ),
        );
        act(() => {
          latestOnboardingBag.goTo('contract_details');
        });
        await screen.findByLabelText(/Role description/i);

        expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(false);
        expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1);
      });

      it('does not call the check on mount when the feature is not enabled', async () => {
        await renderContractDetailsStep({ features: [] });

        expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(false);
        expect(jobTitleEligibilityCheckSpy).not.toHaveBeenCalled();
      });
    });

    it('does not call the check on mount when the saved role answers are incomplete', async () => {
      await renderContractDetailsStep();

      expect(latestOnboardingBag.isCheckingJobTitleEligibility).toBe(false);
      expect(jobTitleEligibilityCheckSpy).not.toHaveBeenCalled();
    });

    describe('feeding the check result into the contract details schema', () => {
      const updateEmploymentSpy = vi.fn();
      const checkResponsesSent = vi.fn();

      const mockCheckResponse = (
        checks: { check_id: string | null; verdict: string }[],
      ) => {
        let call = 0;
        server.use(
          http.post('*/v2/employments/:id/job-title-eligibility-check', () => {
            const check = checks[Math.min(call, checks.length - 1)];
            call += 1;
            checkResponsesSent(call);
            return HttpResponse.json({
              data: { job_title_eligibility_check: check },
            });
          }),
        );
      };

      beforeEach(() => {
        server.use(
          http.patch('*/v1/employments/:id', async ({ request }) => {
            updateEmploymentSpy(await request.json());
            return HttpResponse.json(employmentDefaultResponse);
          }),
        );
      });

      const submitAfterCheck = async (checks = 1) => {
        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await waitFor(() =>
          expect(checkResponsesSent).toHaveBeenCalledTimes(checks),
        );
        await waitFor(() => expect(submitButton).toBeEnabled());
        submitButton.click();
      };

      it('reveals the risk acknowledgement on yes_with_ack and submits it with the check slug and result', async () => {
        mockCheckResponse([
          {
            check_id: 'check-id',
            verdict: 'eligible_with_risk_acknowledgement',
          },
        ]);

        await renderContractDetailsStep();
        expect(
          screen.queryByLabelText(/I acknowledge the risks/i),
        ).not.toBeInTheDocument();

        await fillRoleFields();

        const acknowledgement = await screen.findByLabelText(
          /I acknowledge the risks/i,
        );
        await userEvent.setup().click(acknowledgement);
        await submitAfterCheck();

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Backend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
            employer_acknowledges_risk: 'acknowledged',
            additional_job_title_eligibility_check_slug: 'check-id',
            additional_job_title_eligibility_check_result: 'yes_with_ack',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });

      it('submits the check slug and result without asking for an acknowledgement when eligible', async () => {
        mockCheckResponse([{ check_id: 'check-id', verdict: 'eligible' }]);

        await renderContractDetailsStep();
        await fillRoleFields();
        await submitAfterCheck();

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(
          screen.queryByLabelText(/I acknowledge the risks/i),
        ).not.toBeInTheDocument();
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Backend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
            additional_job_title_eligibility_check_slug: 'check-id',
            additional_job_title_eligibility_check_result: 'yes',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });

      it('submits without a slug or result when the check was not assessed', async () => {
        mockCheckResponse([{ check_id: null, verdict: 'not_assessed' }]);

        await renderContractDetailsStep();
        await fillRoleFields();
        await submitAfterCheck();

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Backend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });

      const fillRoleFieldsWithoutBlur = async () => {
        await fillRadio('Will this role require working onsite', 'no');
        await fillRadio('Does this role require a professional license', 'no');
        const roleDescription = screen.getByLabelText(/Role description/i);
        const user = userEvent.setup();
        await user.clear(roleDescription);
        await user.type(roleDescription, 'Backend engineer responsibilities');
      };

      const submitWithoutBlur = () => {
        fireEvent.submit(
          document.querySelector('.RemoteFlows__OnboardingForm') as Element,
        );
      };

      it('runs the check on a submit that happens without a blur and submits its slug and result', async () => {
        mockCheckResponse([
          { check_id: 'stale-check-id', verdict: 'eligible' },
          { check_id: 'check-id', verdict: 'eligible' },
        ]);

        await renderContractDetailsStep();
        await fillRoleFieldsWithoutBlur();
        await waitFor(() =>
          expect(checkResponsesSent).toHaveBeenCalledTimes(1),
        );

        submitWithoutBlur();

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(checkResponsesSent).toHaveBeenCalledTimes(2);
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Backend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
            additional_job_title_eligibility_check_slug: 'check-id',
            additional_job_title_eligibility_check_result: 'yes',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });

      it('submits without a blur when the verdict changes to one that requires nothing new', async () => {
        mockCheckResponse([
          { check_id: 'stale-check-id', verdict: 'eligible' },
          { check_id: 'check-id', verdict: 'needs_review' },
        ]);

        await renderContractDetailsStep();
        await fillRoleFieldsWithoutBlur();
        await waitFor(() =>
          expect(checkResponsesSent).toHaveBeenCalledTimes(1),
        );

        submitWithoutBlur();

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Backend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
            additional_job_title_eligibility_check_slug: 'check-id',
            additional_job_title_eligibility_check_result: 'maybe',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });

      it('holds a submit without a blur when the check now requires a risk acknowledgement', async () => {
        mockCheckResponse([
          { check_id: 'stale-check-id', verdict: 'eligible' },
          {
            check_id: 'check-id',
            verdict: 'eligible_with_risk_acknowledgement',
          },
        ]);

        await renderContractDetailsStep();
        await fillRoleFieldsWithoutBlur();
        await waitFor(() =>
          expect(checkResponsesSent).toHaveBeenCalledTimes(1),
        );

        submitWithoutBlur();

        const acknowledgement = await screen.findByLabelText(
          /I acknowledge the risks/i,
        );
        expect(updateEmploymentSpy).not.toHaveBeenCalled();

        await userEvent.setup().click(acknowledgement);
        await submitAfterCheck(2);

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Backend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
            employer_acknowledges_risk: 'acknowledged',
            additional_job_title_eligibility_check_slug: 'check-id',
            additional_job_title_eligibility_check_result: 'yes_with_ack',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });

      it('shows an info statement when the check needs review', async () => {
        mockCheckResponse([{ check_id: 'check-id', verdict: 'needs_review' }]);

        await renderContractDetailsStep();
        await fillRoleFields();

        expect(
          await screen.findByText(
            `AI isn't sure if we can hire this role in ${countryName}`,
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            "Complete the add employee process and we'll let you know as soon as we can if we can hire this role.",
          ),
        ).toBeInTheDocument();
      });

      it('shows an error statement when the role is not eligible', async () => {
        mockCheckResponse([{ check_id: 'check-id', verdict: 'not_eligible' }]);

        await renderContractDetailsStep();
        await fillRoleFields();

        expect(
          await screen.findByText(
            `AI determined we can't hire this role in ${countryName}`,
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            "Based on the job title and role description entered, we can't hire this role. Update the role details to check again.",
          ),
        ).toBeInTheDocument();
      });

      it('does not show a statement when the role is eligible', async () => {
        mockCheckResponse([{ check_id: 'check-id', verdict: 'eligible' }]);

        await renderContractDetailsStep();
        await fillRoleFields();
        await waitFor(() =>
          expect(checkResponsesSent).toHaveBeenCalledTimes(1),
        );

        expect(screen.queryByText(/^AI /)).not.toBeInTheDocument();
      });

      it('switches the statement when a new check changes the verdict and removes it once eligible', async () => {
        mockCheckResponse([
          { check_id: 'not-eligible-check-id', verdict: 'not_eligible' },
          { check_id: 'needs-review-check-id', verdict: 'needs_review' },
          { check_id: 'eligible-check-id', verdict: 'eligible' },
        ]);

        await renderContractDetailsStep();
        await fillRoleFields();
        await screen.findByText(
          `AI determined we can't hire this role in ${countryName}`,
        );

        const user = userEvent.setup();
        const changeRoleDescription = async (text: string) => {
          const roleDescription = screen.getByLabelText(/Role description/i);
          await user.clear(roleDescription);
          await user.type(roleDescription, text);
          await user.tab();
        };

        await changeRoleDescription('Frontend engineer responsibilities');
        await screen.findByText(
          `AI isn't sure if we can hire this role in ${countryName}`,
        );
        expect(
          screen.queryByText(
            `AI determined we can't hire this role in ${countryName}`,
          ),
        ).not.toBeInTheDocument();

        await changeRoleDescription('Product engineer responsibilities');
        await waitFor(() =>
          expect(screen.queryByText(/^AI /)).not.toBeInTheDocument(),
        );
      });

      it('hides the risk acknowledgement again once the role changes and the new check is eligible', async () => {
        mockCheckResponse([
          {
            check_id: 'risky-check-id',
            verdict: 'eligible_with_risk_acknowledgement',
          },
          { check_id: 'eligible-check-id', verdict: 'eligible' },
        ]);

        await renderContractDetailsStep();
        await fillRoleFields();
        await screen.findByLabelText(/I acknowledge the risks/i);

        const user = userEvent.setup();
        const roleDescription = screen.getByLabelText(/Role description/i);
        await user.clear(roleDescription);
        await user.type(roleDescription, 'Frontend engineer responsibilities');
        await user.tab();

        await waitFor(() =>
          expect(
            screen.queryByLabelText(/I acknowledge the risks/i),
          ).not.toBeInTheDocument(),
        );
        await submitAfterCheck(2);

        await waitFor(() =>
          expect(updateEmploymentSpy).toHaveBeenCalledTimes(1),
        );
        expect(updateEmploymentSpy).toHaveBeenCalledWith({
          contract_details: {
            role_description: 'Frontend engineer responsibilities',
            role_is_onsite: 'no',
            role_requires_license: 'no',
            additional_job_title_eligibility_check_slug: 'eligible-check-id',
            additional_job_title_eligibility_check_result: 'yes',
          },
          pricing_plan_details: { frequency: 'monthly' },
        });
      });
    });
  },
);
