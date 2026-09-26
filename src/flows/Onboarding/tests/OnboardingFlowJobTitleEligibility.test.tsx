import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  contractDetailsSchemaJobTitleEligibility,
  contractDetailsSchemaJobTitleEligibilityWithResult,
  employmentDefaultResponse,
  employmentUpdatedResponse,
  jobTitleEligibilityCheckResponse,
  jobTitleEligibilityCheckRiskyResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { server } from '@/src/tests/server';
import { fillRadio, queryClient, TestProviders } from '@/src/tests/testHelpers';

const roleDescription =
  'Leads product discovery, owns the roadmap, partners with design and engineering, and reports on product outcomes to leadership.';

const renderFlow = ({ onboardingBag, components }: OnboardingRenderProps) => {
  const { ContractDetailsStep, SubmitButton } = components;

  if (onboardingBag.isLoading) {
    return <div>Loading...</div>;
  }

  if (onboardingBag.stepState.currentStep.name !== 'contract_details') {
    return (
      <button onClick={() => onboardingBag.goTo('contract_details')}>
        Go to contract details
      </button>
    );
  }

  return (
    <>
      <ContractDetailsStep />
      <SubmitButton>Next Step</SubmitButton>
    </>
  );
};

describe('OnboardingFlow job title eligibility', () => {
  let eligibilityRequests: Record<string, unknown>[];
  let updateRequests: Record<string, unknown>[];
  let resolveCheck: () => void;

  beforeEach(() => {
    queryClient.clear();
    eligibilityRequests = [];
    updateRequests = [];
    resolveCheck = () => {};

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
              contract_details: null,
              country: {
                code: 'ESP',
                name: 'Spain',
                alpha_2_code: 'ES',
                supported_json_schemas: ['employment_basic_information'],
              },
            },
          },
        }),
      ),
      http.get('*/v1/countries/ESP/employment_basic_information*', () =>
        HttpResponse.json({
          data: {
            properties: {
              name: { type: 'string', title: 'Name' },
            },
          },
        }),
      ),
      http.get('*/v1/countries/ESP/contract_details*', () =>
        HttpResponse.json(contractDetailsSchemaJobTitleEligibility),
      ),
      http.post(
        '*/v2/employments/:id/job-title-eligibility-check',
        async ({ request }) => {
          eligibilityRequests.push(
            (await request.json()) as Record<string, unknown>,
          );
          await new Promise<void>((resolve) => {
            resolveCheck = resolve;
          });
          return HttpResponse.json(jobTitleEligibilityCheckResponse);
        },
      ),
      http.patch('*/v1/employments/:id', async ({ request }) => {
        updateRequests.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(employmentUpdatedResponse);
      }),
    );
  });

  it('checks eligibility on blur, disables submit while in flight and submits the slug', async () => {
    const user = userEvent.setup();

    render(
      <OnboardingFlow
        companyId='test-company-id'
        countryCode='ESP'
        employmentId='test-employment-id'
        skipSteps={['select_country']}
        options={{ features: ['job_title_eligibility'] }}
        render={renderFlow}
      />,
      { wrapper: TestProviders },
    );

    await user.click(await screen.findByText('Go to contract details'));

    await user.click(await screen.findByLabelText(/Role description/i));
    await user.paste(roleDescription);
    await fillRadio('Will this role require working onsite?', 'No');
    await fillRadio('Does this role require a professional license?', 'No');

    expect(eligibilityRequests).toEqual([]);

    await user.click(document.body);

    await waitFor(() => {
      expect(eligibilityRequests).toEqual([
        {
          role_description: roleDescription,
          role_is_onsite: 'no',
          role_requires_license: 'no',
        },
      ]);
    });

    const submitButton = screen.getByRole('button', { name: 'Next Step' });
    expect(submitButton).toBeDisabled();

    resolveCheck();

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    submitButton.click();

    await waitFor(() => {
      expect(updateRequests).toHaveLength(1);
    });
    expect(updateRequests[0].contract_details).toEqual({
      role_description: roleDescription,
      role_is_onsite: 'no',
      role_requires_license: 'no',
      additional_job_title_eligibility_check_slug: 'check-id-123',
    });
    expect(eligibilityRequests).toHaveLength(1);
  });

  it('asks for the risk acknowledgement when the check flags the role as risky', async () => {
    server.use(
      http.get('*/v1/countries/ESP/contract_details*', () =>
        HttpResponse.json(contractDetailsSchemaJobTitleEligibilityWithResult),
      ),
      http.post('*/v2/employments/:id/job-title-eligibility-check', () =>
        HttpResponse.json(jobTitleEligibilityCheckRiskyResponse),
      ),
    );
    const user = userEvent.setup();

    render(
      <OnboardingFlow
        companyId='test-company-id'
        countryCode='ESP'
        employmentId='test-employment-id'
        skipSteps={['select_country']}
        options={{ features: ['job_title_eligibility'] }}
        render={renderFlow}
      />,
      { wrapper: TestProviders },
    );

    await user.click(await screen.findByText('Go to contract details'));

    await user.click(await screen.findByLabelText(/Role description/i));
    await user.paste(roleDescription);
    await fillRadio('Will this role require working onsite?', 'Yes');
    await fillRadio('Does this role require a professional license?', 'Yes');

    expect(
      screen.queryByLabelText(/I acknowledge the risks/i),
    ).not.toBeInTheDocument();

    await user.click(document.body);

    await user.click(await screen.findByLabelText(/I acknowledge the risks/i));

    const submitButton = screen.getByRole('button', { name: 'Next Step' });
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
    submitButton.click();

    await waitFor(() => {
      expect(updateRequests).toHaveLength(1);
    });
    expect(updateRequests[0].contract_details).toEqual({
      role_description: roleDescription,
      role_is_onsite: 'yes',
      role_requires_license: 'yes',
      employer_acknowledges_risk: 'acknowledged',
      additional_job_title_eligibility_check_slug: 'check-id-risky',
      additional_job_title_eligibility_check_result: 'yes_with_ack',
    });
  });
});
