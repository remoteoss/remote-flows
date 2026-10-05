import { useState } from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  basicInformationSchemaV1Portugal,
  contractDetailsSchemaV1Portugal,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { generateUniqueEmploymentId } from '@/src/flows/Onboarding/tests/helpers';
import { OnboardingRenderProps } from '@/src/flows/Onboarding/types';
import { PrettifiedValuesRenderer } from '@/src/tests/components/PrettifiedValuesRenderer';
import { server } from '@/src/tests/server';
import { fillRadio, queryClient, TestProviders } from '@/src/tests/testHelpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

const findField = (fields: $TSFixMe[] = [], name: string) =>
  fields.find((field) => field.name === name);

const mockEmployment = (
  employmentId: string,
  overrides: Record<string, unknown> = {},
) =>
  server.use(
    http.get(`*/v1/employments/${employmentId}`, () =>
      HttpResponse.json({
        ...employmentDefaultResponse,
        data: {
          ...employmentDefaultResponse.data,
          employment: {
            ...employmentDefaultResponse.data.employment,
            id: employmentId,
            basic_information: {
              ...employmentDefaultResponse.data.employment.basic_information,
              has_seniority_date: 'yes',
              seniority_date: '2020-01-15',
            },
            ...overrides,
          },
        },
      }),
    ),
  );

const renderStep = ({ onboardingBag, components }: OnboardingRenderProps) => {
  if (onboardingBag.isLoading) {
    return <div data-testid='spinner'>Loading...</div>;
  }
  const { BasicInformationStep, SubmitButton } = components;
  switch (onboardingBag.stepState.currentStep.name) {
    case 'basic_information':
      return (
        <>
          <BasicInformationStep
            onSubmit={vi.fn()}
            onSuccess={vi.fn()}
            onError={vi.fn()}
          />
          <SubmitButton>Next Step</SubmitButton>
        </>
      );
    case 'review':
      return (
        <PrettifiedValuesRenderer
          values={onboardingBag.meta.fields.basic_information || {}}
        />
      );
    default:
      return <h1>Step: {onboardingBag.stepState.currentStep.name}</h1>;
  }
};

describe('Onboarding basic information built once', () => {
  beforeEach(() => {
    queryClient.clear();
    server.use(
      http.get('*/v1/countries/*/employment_basic_information*', () =>
        HttpResponse.json(basicInformationSchemaV1Portugal),
      ),
      http.get('*/v1/countries/PRT/contract_details*', () =>
        HttpResponse.json(contractDetailsSchemaV1Portugal),
      ),
    );
  });

  it('shows a conditional field revealed by the saved employment on first paint', async () => {
    const employmentId = generateUniqueEmploymentId();
    mockEmployment(employmentId);

    render(
      <OnboardingFlow
        companyId='1234'
        employmentId={employmentId}
        skipSteps={['select_country']}
        render={renderStep}
      />,
      { wrapper: TestProviders },
    );

    await screen.findByLabelText(/Personal email/i);
    expect(screen.getByTestId('seniority_date')).toBeInTheDocument();
  });

  it('shows a conditional field revealed by the partner initialValues on first paint', async () => {
    render(
      <OnboardingFlow
        companyId='1234'
        countryCode='PRT'
        skipSteps={['select_country']}
        initialValues={{ has_seniority_date: 'yes' }}
        render={renderStep}
      />,
      { wrapper: TestProviders },
    );

    expect(await screen.findByTestId('seniority_date')).toBeInTheDocument();
  });

  it('keeps a conditional field in the review of a read-only employment that never mounts the step', async () => {
    const employmentId = generateUniqueEmploymentId();
    mockEmployment(employmentId, { status: 'invited' });

    render(
      <OnboardingFlow
        companyId='1234'
        employmentId={employmentId}
        skipSteps={['select_country']}
        render={renderStep}
      />,
      { wrapper: TestProviders },
    );

    expect(await screen.findByText(/^seniority_date:/)).toBeInTheDocument();
  });

  it('keeps a revealed field when the partner passes options inline and re-renders', async () => {
    const user = userEvent.setup();
    function Partner() {
      const [, setRenders] = useState(0);
      return (
        <>
          <button type='button' onClick={() => setRenders((n) => n + 1)}>
            Re-render partner
          </button>
          <OnboardingFlow
            companyId='1234'
            countryCode='PRT'
            skipSteps={['select_country']}
            options={{
              jsfModify: {
                basic_information: {
                  fields: { name: { title: 'Employee name' } },
                },
              },
            }}
            render={renderStep}
          />
        </>
      );
    }

    render(<Partner />, { wrapper: TestProviders });
    await screen.findByLabelText('Employee name');
    await fillRadio('Does the employee have a seniority date?', 'Yes');
    await screen.findByTestId('seniority_date');

    await user.click(screen.getByText('Re-render partner'));

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId('seniority_date')).toBeInTheDocument();
  });

  it('resolves conditional fields for headless consumers without mounting a step', async () => {
    const employmentId = generateUniqueEmploymentId();
    mockEmployment(employmentId);

    const { result } = renderHook(
      () =>
        useOnboarding({
          companyId: '1234',
          countryCode: 'PRT',
          employmentId,
          skipSteps: ['select_country'],
        }),
      { wrapper: TestProviders },
    );

    await waitFor(() =>
      expect(findField(result.current.fields, 'seniority_date')).toBeDefined(),
    );
    expect(findField(result.current.fields, 'seniority_date').isVisible).toBe(
      true,
    );
  });
});
