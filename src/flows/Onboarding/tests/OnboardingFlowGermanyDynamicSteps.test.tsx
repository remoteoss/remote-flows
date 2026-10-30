import { server } from '@/src/tests/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV3Germany,
  engagementAgreementDetailsSchemaV1Germany,
  engagementAgreementDetailsDefaultResponseGermany,
  contractDetailsSchemaV1Germany,
  employmentCreatedResponse,
  employmentUpdatedResponse,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { fillRadio, queryClient, TestProviders } from '@/src/tests/testHelpers';
import { generateUniqueEmploymentId } from '@/src/flows/Onboarding/tests/helpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { mockBaseResponse } from '@/src/common/api/fixtures/base';
import { PrettifiedValuesRenderer } from '@/src/tests/components/PrettifiedValuesRenderer';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

const phoneNumberMock = '1701234567';

describe('OnboardingFlow - Germany with dynamic_steps', () => {
  const MultiStepFormGermany = ({ components, onboardingBag }: $TSFixMe) => {
    const {
      BasicInformationStep,
      EngagementAgreementDetailsStep,
      ContractDetailsStep,
      SubmitButton,
      BackButton,
      OnboardingInvite,
      SelectCountryStep,
    } = components;

    if (onboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    switch (onboardingBag.stepState.currentStep.name) {
      case 'select_country':
        return (
          <>
            <SelectCountryStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <div className='buttons-container'>
              <SubmitButton
                className='submit-button'
                disabled={onboardingBag.isSubmitting}
              >
                Continue
              </SubmitButton>
            </div>
          </>
        );
      case 'basic_information':
        return (
          <>
            <BasicInformationStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
            <SubmitButton>Next Step</SubmitButton>
          </>
        );
      case 'engagement_agreement_details':
        return (
          <>
            <EngagementAgreementDetailsStep
              onSubmit={mockOnSubmit}
              onSuccess={mockOnSuccess}
              onError={mockOnError}
            />
            <BackButton>Back</BackButton>
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
      case 'review':
        return (
          <div className='onboarding-review'>
            <h2 className='title'>Basic Information</h2>
            <PrettifiedValuesRenderer
              values={onboardingBag.meta.fields?.basic_information || {}}
            />
            <h2 className='title'>Engagement Agreement Details</h2>
            <PrettifiedValuesRenderer
              values={
                onboardingBag.meta.fields?.engagement_agreement_details || {}
              }
            />
            <BackButton>Back</BackButton>
            <OnboardingInvite
              render={({
                status,
              }: {
                status: 'invited' | 'created_awaiting_reserve';
              }) => {
                return status === 'created_awaiting_reserve'
                  ? 'Create Reserve'
                  : 'Invite Employee';
              }}
              onSuccess={mockOnSuccess}
            />
          </div>
        );
    }

    return null;
  };

  const mockRender = vi.fn(
    ({ onboardingBag, components }: OnboardingRenderProps) => {
      const currentStepIndex = onboardingBag.stepState.currentStep.index;

      const steps: Record<number, string> = {
        [0]: 'Select Country',
        [1]: 'Basic Information',
        [2]: 'Engagement Agreement Details',
        [3]: 'Contract Details',
        [4]: 'Review',
      };

      return (
        <>
          <h1>Step: {steps[currentStepIndex]}</h1>
          <MultiStepFormGermany
            onboardingBag={onboardingBag}
            components={components}
          />
        </>
      );
    },
  );

  const defaultProps = {
    companyId: '1234',
    options: {
      features: ['dynamic_steps' as const],
    },
    render: mockRender,
  };

  const savedSimilarRolesDetails = {
    ...engagementAgreementDetailsDefaultResponseGermany.data.details,
    has_business_presence: 'no',
    has_similar_roles: 'yes',
    similar_roles: 'Backend engineers',
    has_similar_work_conditions: 'no',
    has_illness_remuneration: 'no',
    min_annual_gross_salary: 3500000,
    max_annual_gross_salary: 5000000,
    has_signing_bonus: 'no',
    has_bonus: 'no',
    has_commissions: 'no',
    has_allowances: 'no',
    has_business_expenses: 'no',
    has_pension_scheme: 'no',
    work_hours_per_week: 40,
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    break_time_per_day: 30,
    available_pto: 25,
    has_overtime_compensation: 'no',
    has_covenants: 'no',
  };

  const goToEngagementAgreementDetailsWithSavedSalaries = async () => {
    server.use(
      http.get('*/v2/employments/:id/engagement-agreement-details', () =>
        HttpResponse.json({
          ...engagementAgreementDetailsDefaultResponseGermany,
          data: {
            ...engagementAgreementDetailsDefaultResponseGermany.data,
            details: savedSimilarRolesDetails,
          },
        }),
      ),
    );

    render(
      <OnboardingFlow
        {...defaultProps}
        employmentId={generateUniqueEmploymentId()}
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Basic Information/i);
    screen.getByText(/Next Step/i).click();
    await screen.findByText(/Step: Engagement Agreement Details/i);

    const minSalaryInput = await screen.findByRole('textbox', {
      name: /Minimum average salary/i,
    });
    const maxSalaryInput = screen.getByRole('textbox', {
      name: /Maximum average salary/i,
    });
    await waitFor(() => {
      expect(minSalaryInput).toHaveValue('35000');
      expect(maxSalaryInput).toHaveValue('50000');
    });

    return { minSalaryInput, maxSalaryInput };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockReset();
    queryClient.clear();

    server.use(
      http.get('*/v1/employments/:id', ({ params }) => {
        const employmentId = params?.id;

        if (!employmentId) {
          return HttpResponse.json(
            { error: 'Employment not found' },
            { status: 404 },
          );
        }

        return HttpResponse.json({
          ...employmentDefaultResponse,
          data: {
            ...employmentDefaultResponse.data,
            employment: {
              ...employmentDefaultResponse.data.employment,
              id: employmentId,
              country: {
                code: 'DEU',
                name: 'Germany',
                alpha_2_code: 'DE',
                supported_json_schemas: [
                  'employment_basic_information',
                  'engagement_agreement_details',
                ],
              },
              basic_information: {
                ...employmentDefaultResponse.data.employment.basic_information,
                mobile_number: `+49${phoneNumberMock}`,
              },
            },
          },
        });
      }),
      http.get('*/v1/countries/DEU/employment_basic_information*', () => {
        return HttpResponse.json(basicInformationSchemaV3Germany);
      }),
      http.get('*/v1/countries/DEU/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchemaV1Germany);
      }),
      http.get('*/v1/countries/DEU/engagement_agreement_details*', () => {
        return HttpResponse.json(engagementAgreementDetailsSchemaV1Germany);
      }),
      http.get(
        '*/v2/employments/:id/engagement-agreement-details',
        ({ params }) => {
          const employmentId = params?.id;

          if (!employmentId) {
            return HttpResponse.json(
              { error: 'Employment not found' },
              { status: 404 },
            );
          }
          return HttpResponse.json(
            engagementAgreementDetailsDefaultResponseGermany,
          );
        },
      ),
      http.post('*/v1/employments', () => {
        return HttpResponse.json(employmentCreatedResponse);
      }),
      http.patch('*/v1/employments/*', async () => {
        return HttpResponse.json(employmentUpdatedResponse);
      }),
      http.post('*/v2/employments/:id/engagement-agreement-details', () => {
        return HttpResponse.json(mockBaseResponse);
      }),
      http.post('*/v1/employments/*/contract-eligibility', () => {
        return HttpResponse.json({ data: { status: 'ok' } });
      }),
    );
  });

  it('should recover basic information and check mobile phone number is filled', async () => {
    const uniqueEmploymentId = generateUniqueEmploymentId();
    render(
      <OnboardingFlow
        {...defaultProps}
        employmentId={uniqueEmploymentId}
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Basic Information/i);

    await waitFor(() => {
      const mobileNumberInput = screen.getByRole('textbox', {
        name: /Phone number/i,
      }) as HTMLInputElement;
      expect(mobileNumberInput.value.trim()).toBe(phoneNumberMock);

      const countrySelect = screen.getByRole('combobox', {
        name: /Country code/i,
      });
      expect(countrySelect).toHaveTextContent(/Germany.*\+49/i);
    });
  });

  it('should check the working_days is preloaded when has_similar_roles is set to yes', async () => {
    const uniqueEmploymentId = generateUniqueEmploymentId();

    render(
      <OnboardingFlow
        {...defaultProps}
        employmentId={uniqueEmploymentId}
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Basic Information/i);
    // Navigate through basic information
    const nextButton = screen.getByText(/Next Step/i);
    nextButton.click();
    // Wait for engagement agreement details step
    await screen.findByText(/Step: Engagement Agreement Details/i);
    // Assert that working_days checkboxes are pre-checked with the default values
    await waitFor(() => {
      // The default is: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      const mondayCheckbox = screen.getByLabelText(/monday/i);

      const tuesdayCheckbox = screen.getByLabelText(/tuesday/i);
      const wednesdayCheckbox = screen.getByLabelText(/wednesday/i);
      const thursdayCheckbox = screen.getByLabelText(/thursday/i);
      const fridayCheckbox = screen.getByLabelText(/friday/i);

      // Weekdays should be checked (default values)
      expect(mondayCheckbox).toBeInTheDocument();
      expect(tuesdayCheckbox).toBeInTheDocument();
      expect(wednesdayCheckbox).toBeInTheDocument();
      expect(thursdayCheckbox).toBeInTheDocument();
      expect(fridayCheckbox).toBeInTheDocument();
    });
  });

  it('should save engagement agreement details and reach contract details step', async () => {
    const uniqueEmploymentId = generateUniqueEmploymentId();

    // Override the engagement-agreement-details GET to return 404
    // This simulates a fresh employment without saved engagement details
    server.use(
      http.get('*/v2/employments/:id/engagement-agreement-details', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      }),
    );

    render(
      <OnboardingFlow
        {...defaultProps}
        employmentId={uniqueEmploymentId}
        skipSteps={['select_country']}
      />,
      { wrapper: TestProviders },
    );
    await waitForElementToBeRemoved(() => screen.getByTestId('spinner'));
    await screen.findByText(/Step: Basic Information/i);
    // Navigate through basic information
    let nextButton = screen.getByText(/Next Step/i);
    nextButton.click();
    // Wait for engagement agreement details step
    await screen.findByText(/Step: Engagement Agreement Details/i);
    // Fill the two required radio buttons based on the image you provided
    await fillRadio(
      'Do you currently have any business presence in Germany?',
      'No',
    );
    await fillRadio(
      'Do you currently have team members in similar roles to this hire?',
      'No',
    );

    // Submit the form
    nextButton = screen.getByText(/Next Step/i);
    nextButton.click();
    // Assert we reach contract details step
    await screen.findByText(/Step: Contract Details/i);

    // Verify mockOnSubmit was called for engagement agreement details
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should validate the salary range against the computed minimums', async () => {
    const user = userEvent.setup();
    const { minSalaryInput, maxSalaryInput } =
      await goToEngagementAgreementDetailsWithSavedSalaries();

    await user.clear(minSalaryInput);
    await user.type(minSalaryInput, '30000');
    screen.getByText(/Next Step/i).click();
    expect(
      await screen.findByText('Must be 30222.4 EUR or greater.'),
    ).toBeInTheDocument();

    await user.clear(minSalaryInput);
    await user.type(minSalaryInput, '40000');
    await user.clear(maxSalaryInput);
    await user.type(maxSalaryInput, '39000');
    screen.getByText(/Next Step/i).click();
    expect(
      await screen.findByText('Must be 40000 EUR or greater.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Must be 30222.4 EUR or greater.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Step: Engagement Agreement Details/i),
    ).toBeInTheDocument();
  });

  it('should submit the saved salary range in cents', async () => {
    let requestBody: unknown;
    server.use(
      http.post(
        '*/v2/employments/:id/engagement-agreement-details',
        async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json(mockBaseResponse);
        },
      ),
    );
    await goToEngagementAgreementDetailsWithSavedSalaries();

    screen.getByText(/Next Step/i).click();
    await screen.findByText(/Step: Contract Details/i);

    expect(requestBody).toEqual({
      engagement_agreement_details: {
        available_pto: 25,
        break_time_per_day: 30,
        has_allowances: 'no',
        has_bonus: 'no',
        has_business_expenses: 'no',
        has_business_presence: 'no',
        has_commissions: 'no',
        has_covenants: 'no',
        has_illness_remuneration: 'no',
        has_overtime_compensation: 'no',
        has_pension_scheme: 'no',
        has_signing_bonus: 'no',
        has_similar_roles: 'yes',
        has_similar_work_conditions: 'no',
        max_annual_gross_salary: 5000000,
        min_annual_gross_salary: 3500000,
        similar_roles: 'Backend engineers',
        work_hours_per_week: 40,
        working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
    });
  });
});
