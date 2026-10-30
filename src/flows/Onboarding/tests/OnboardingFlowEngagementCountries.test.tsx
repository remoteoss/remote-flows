import { server } from '@/src/tests/server';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV3Germany,
  contractDetailsSchemaV1Germany,
  employmentDefaultResponse,
  engagementAgreementDetailsSchemaV1Germany,
} from '@/src/flows/Onboarding/tests/fixtures';
import { generateUniqueEmploymentId } from '@/src/flows/Onboarding/tests/helpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';

const mockRender = ({ onboardingBag }: OnboardingRenderProps) => {
  if (onboardingBag.isLoading) {
    return <div data-testid='spinner'>Loading...</div>;
  }
  return (
    <ul data-testid='steps'>
      {onboardingBag.steps
        .filter((step) => step.visible)
        .map((step) => (
          <li key={step.name}>{step.name}</li>
        ))}
    </ul>
  );
};

describe('OnboardingFlow - engagement agreement details countries', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('does not request or show the engagement step outside DEU', async () => {
    const engagementSchemaRequest = vi.fn();

    server.use(
      http.get('*/v1/employments/:id', ({ params }) =>
        HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: params.id,
              country: {
                code: 'CZE',
                name: 'Czech Republic',
                alpha_2_code: 'CZ',
                supported_json_schemas: [
                  'employment_basic_information',
                  'engagement_agreement_details',
                ],
              },
            },
          },
        }),
      ),
      http.get('*/v1/countries/CZE/employment_basic_information*', () =>
        HttpResponse.json(basicInformationSchemaV3Germany),
      ),
      http.get('*/v1/countries/CZE/contract_details*', () =>
        HttpResponse.json(contractDetailsSchemaV1Germany),
      ),
      http.get('*/v1/countries/CZE/engagement_agreement_details*', () => {
        engagementSchemaRequest();
        return HttpResponse.json(engagementAgreementDetailsSchemaV1Germany);
      }),
    );

    render(
      <OnboardingFlow
        companyId='1234'
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
        options={{ features: ['dynamic_steps'] }}
        render={mockRender}
      />,
      { wrapper: TestProviders },
    );

    const steps = await screen.findByTestId('steps');

    expect(steps).not.toHaveTextContent('engagement_agreement_details');
    expect(engagementSchemaRequest).not.toHaveBeenCalled();
  });
});
