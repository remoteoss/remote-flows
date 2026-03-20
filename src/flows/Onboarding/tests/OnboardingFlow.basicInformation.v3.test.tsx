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
  basicInformationSchemaV3Korea,
  companyResponse,
  employmentDefaultResponse,
  employmentUpdatedResponse,
  benefitOffersSchema,
  contractDetailsSchemaV1Portugal,
  benefitOffersResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import {
  fillDatePickerByTestId,
  fillRadio,
  queryClient,
  TestProviders,
} from '@/src/tests/testHelpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { generateUniqueEmploymentId } from '@/src/flows/Onboarding/tests/helpers';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

describe('OnboardingFlow - Basic Information v3', () => {
  const MultiStepFormWithoutCountry = ({
    components,
    onboardingBag,
  }: $TSFixMe) => {
    const {
      BasicInformationStep,
      ContractDetailsStep,
      SubmitButton,
      BackButton,
    } = components;

    if (onboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    switch (onboardingBag.stepState.currentStep.name) {
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'contract_details':
        return (
          <>
            <ContractDetailsStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
    }

    return null;
  };
  const mockRender = vi.fn(
    ({ onboardingBag, components }: OnboardingRenderProps) => {
      const currentStepIndex = onboardingBag.stepState.currentStep.index;

      const steps: Record<number, string> = {
        [0]: 'Basic Information',
        [1]: 'Contract Details',
      };

      return (
        <>
          <h1>Step: {steps[currentStepIndex]}</h1>
          <MultiStepFormWithoutCountry
            onboardingBag={onboardingBag}
            components={components}
          />
        </>
      );
    },
  );
  const defaultProps = {
    companyId: '1234',
    options: {},
    render: mockRender,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    server.use(
      http.get('*/v1/companies/:companyId', () => {
        return HttpResponse.json(companyResponse);
      }),
      http.get('*/v1/employments/:id', ({ params }) => {
        const employmentId = params?.id;
        return HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: employmentId,
            },
          },
        });
      }),
      http.get('*/v1/employments/*/benefit-offers/schema', () => {
        return HttpResponse.json(benefitOffersSchema);
      }),
      http.get('*/v1/employments/*/benefit-offers', () => {
        return HttpResponse.json(benefitOffersResponse);
      }),
    );
  });

  describe('Portugal v3 basic information EOR', () => {
    beforeEach(() => {
      server.use(
        http.get('*/v1/countries/PRT/employment_basic_information*', () => {
          return HttpResponse.json(basicInformationSchemaV3Portugal);
        }),
        http.get('*/v1/countries/PRT/contract_details*', () => {
          return HttpResponse.json(contractDetailsSchemaV1Portugal);
        }),
      );
    });

    it('should render the basic information form correctly', async () => {
      render(
        <OnboardingFlow
          {...defaultProps}
          countryCode='PRT'
          skipSteps={['select_country']}
          options={{
            jsonSchemaVersion: {
              employment_basic_information: 3,
            },
          }}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText(/Does the employee have a seniority date?/i),
        ).toBeInTheDocument();
      });
    });

    it('should submit correct payload structure with v3 fieldsets', async () => {
      const patchSpy = vi.fn();

      server.use(
        http.patch('*/v1/employments/*', async ({ request }) => {
          const body = await request.json();
          patchSpy(body);
          return HttpResponse.json(employmentUpdatedResponse); // ← Use updated response
        }),
      );

      render(
        <OnboardingFlow
          {...defaultProps}
          employmentId={generateUniqueEmploymentId()} // ← This triggers PATCH
          countryCode='PRT'
          skipSteps={['select_country']}
          options={{
            jsonSchemaVersion: {
              employment_basic_information: 3,
            },
          }}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      // Form will be pre-filled from employmentDefaultResponse
      // Just modify one field to trigger the update
      await waitFor(() => {
        expect(screen.getByLabelText(/Personal email/i)).toBeInTheDocument();
      });

      await fillRadio('Does the employee have a seniority date?', 'Yes');

      await waitFor(() => {
        expect(
          screen.getByRole('radiogroup', {
            name: /Does the employee have a seniority date?/i,
          }),
        ).toBeInTheDocument();
      });

      await fillDatePickerByTestId('2026-12-31', 'provisional_start_date');
      await fillDatePickerByTestId('2026-02-11', 'seniority_date');

      // Submit the form
      const nextButton = screen.getByText(/Next Step/i);
      nextButton.click();

      // Wait for PATCH to be called
      await waitFor(() => {
        expect(patchSpy).toHaveBeenCalledTimes(1);
      });

      // Assert payload structure
      const payload = patchSpy.mock.calls[0][0];

      expect(payload).toMatchObject({
        basic_information: {
          name: expect.any(String),
          email: expect.any(String),
          work_email: expect.any(String),
          job_title: expect.any(String),
          has_seniority_date: 'yes',
          seniority_date: '2026-02-11',
          tax_servicing_countries: expect.any(Array),
          tax_job_category: expect.any(String),
        },
        pricing_plan_details: {
          frequency: 'monthly',
        },
      });
    });
  });

  describe('Korea (no seniority field)', async () => {
    beforeEach(() => {
      server.use(
        http.get('*/v1/countries/KOR/employment_basic_information*', () => {
          return HttpResponse.json(basicInformationSchemaV3Korea);
        }),
      );
    });

    it('should render the basic information form correctly', async () => {
      render(
        <OnboardingFlow
          {...defaultProps}
          countryCode='KOR'
          skipSteps={['select_country']}
          options={{
            jsonSchemaVersion: {
              employment_basic_information: 3,
            },
          }}
        />,
        { wrapper: TestProviders },
      );

      await screen.findByText(/Step: Basic Information/i);
      await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
      });

      expect(
        screen.queryByLabelText(/Seniority date/i),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(
          'Previous seniority cannot be recognized in South Korea',
        ),
      ).toBeInTheDocument();
    });
  });
});
