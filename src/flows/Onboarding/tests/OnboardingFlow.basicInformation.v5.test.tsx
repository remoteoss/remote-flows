import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV3Portugal,
  contractDetailsSchemaV1Portugal,
  employmentDefaultResponse,
  employmentUpdatedResponse,
  taxServicingCountriesOptionsV5,
} from '@/src/flows/Onboarding/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { generateUniqueEmploymentId } from '@/src/flows/Onboarding/tests/helpers';

const taxServicingCountriesV5 = {
  ...basicInformationSchemaV3Portugal.data.properties.tax_servicing_countries,
  items: { enum: taxServicingCountriesOptionsV5.map(({ value }) => value) },
  'x-jsf-presentation': {
    inputType: 'countries',
    options: taxServicingCountriesOptionsV5,
  },
};

const schemaV5 = {
  data: {
    ...basicInformationSchemaV3Portugal.data,
    properties: {
      ...basicInformationSchemaV3Portugal.data.properties,
      tax_servicing_countries: taxServicingCountriesV5,
    },
  },
};

const onSubmitSpy = vi.fn();
const onErrorSpy = vi.fn();

const savedEmployment = (id: string) => ({
  ...employmentDefaultResponse,
  data: {
    ...employmentDefaultResponse.data,
    employment: {
      ...employmentDefaultResponse.data.employment,
      id,
      basic_information: {
        ...employmentDefaultResponse.data.employment.basic_information,
        provisional_start_date: '2099-01-04',
        tax_servicing_countries: ['Europe - Western Europe', 'Japan'],
      },
    },
  },
});

describe('OnboardingFlow - Basic Information v5 tax servicing countries', () => {
  const render_ = ({ onboardingBag, components }: OnboardingRenderProps) => {
    const { BasicInformationStep, SubmitButton } = components;
    if (onboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }
    return (
      <>
        <h1>Step: {onboardingBag.stepState.currentStep.name}</h1>
        <BasicInformationStep onSubmit={onSubmitSpy} onError={onErrorSpy} />
        <SubmitButton>Next Step</SubmitButton>
      </>
    );
  };

  beforeEach(() => {
    queryClient.clear();
    server.use(
      http.get('*/v1/employments/:id', ({ params }) =>
        HttpResponse.json(savedEmployment(params.id as string)),
      ),
      http.get('*/v1/countries/PRT/employment_basic_information*', () =>
        HttpResponse.json(schemaV5),
      ),
      http.get('*/v1/countries/PRT/contract_details*', () =>
        HttpResponse.json(contractDetailsSchemaV1Portugal),
      ),
    );
  });

  it('submits prefixed values for an untouched saved record', async () => {
    const patchSpy = vi.fn();
    server.use(
      http.patch('*/v1/employments/*', async ({ request }) => {
        patchSpy(await request.json());
        return HttpResponse.json(employmentUpdatedResponse);
      }),
    );

    render(
      <OnboardingFlow
        companyId='1234'
        employmentId={generateUniqueEmploymentId()}
        countryCode='PRT'
        skipSteps={['select_country']}
        options={{ jsonSchemaVersion: { employment_basic_information: 3 } }}
        render={render_}
      />,
      { wrapper: TestProviders },
    );

    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByRole('button', {
      name: 'remove Europe - Western Europe',
    });

    screen.getByText(/Next Step/i).click();

    await waitFor(() => expect(onSubmitSpy).toHaveBeenCalledTimes(1));
    expect(onErrorSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(patchSpy).toHaveBeenCalledTimes(1));
    expect(
      patchSpy.mock.calls[0][0].basic_information.tax_servicing_countries,
    ).toEqual(['subregion-Western Europe', 'Japan']);
  });
});
