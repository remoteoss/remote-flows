import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  contractDetailsSchemaV1JobTitleEligibility,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { fillRadio, queryClient, TestProviders } from '@/src/tests/testHelpers';
import { server } from '@/src/tests/server';
import { $TSFixMe } from '@/src/types/remoteFlows';

describe('OnboardingFlow - job title eligibility check on blur', () => {
  let latestOnboardingBag: $TSFixMe;

  const mockRender = vi.fn(
    ({ onboardingBag, components }: OnboardingRenderProps) => {
      latestOnboardingBag = onboardingBag;
      const { ContractDetailsStep } = components;

      if (onboardingBag.stepState.currentStep.name !== 'contract_details') {
        return null;
      }

      return <ContractDetailsStep />;
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
                code: 'ITA',
                name: 'Italy',
                alpha_2_code: 'IT',
                supported_json_schemas: ['employment_basic_information'],
              },
            },
          },
        });
      }),
      http.get('*/v1/countries/ITA/employment_basic_information*', () => {
        return HttpResponse.json({
          data: { properties: { name: { type: 'string', title: 'Name' } } },
        });
      }),
      http.get('*/v1/countries/ITA/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchemaV1JobTitleEligibility);
      }),
      http.post(
        '*/v2/employments/:id/job-title-eligibility-check',
        async ({ request }) => {
          jobTitleEligibilityCheckSpy(await request.json());
          return HttpResponse.json({
            data: {
              job_title_eligibility_check: {
                slug: 'job-title-eligibility-check-slug',
                result: 'yes',
              },
            },
          });
        },
      ),
    );
  });

  const renderContractDetailsStep = async () => {
    render(
      <OnboardingFlow
        companyId='test-company-id'
        employmentId='test-employment-id'
        skipSteps={['select_country']}
        options={{ features: ['job_title_eligibility'] }}
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

    expect(jobTitleEligibilityCheckSpy).toHaveBeenCalledTimes(1);
  });
});
