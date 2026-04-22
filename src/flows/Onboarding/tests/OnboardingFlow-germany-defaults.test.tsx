import { server } from '@/src/tests/server';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { OnboardingFlow } from '@/src/flows/Onboarding/OnboardingFlow';
import {
  engagementDetailsSchemaV1GermanySimplified,
  employmentGermanyResponse,
  employmentGermanyResponseWithExistingData,
} from '@/src/flows/Onboarding/tests/fixtures';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import {
  generateUniqueEmploymentId,
  fillHasSimilarRoles,
  assertWorkingDaysVisible,
  assertWorkingDaysValue,
  waitForFormToLoad,
  getDefaultWorkingDays,
} from '@/src/flows/Onboarding/tests/helpers';

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnError = vi.fn();

function DebugFormValues({ values }: { values: Record<string, unknown> }) {
  return <div data-testid='debug-form-values'>{JSON.stringify(values)}</div>;
}

describe('OnboardingFlow - Germany EOR working_days defaults', () => {
  const EngagementDetailsForm = ({ components, onboardingBag }: $TSFixMe) => {
    const { EngagementDetailsStep, SubmitButton } = components;

    if (onboardingBag.isLoading) {
      return <div data-testid='spinner'>Loading...</div>;
    }

    return (
      <>
        <EngagementDetailsStep
          onSubmit={mockOnSubmit}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
        <SubmitButton>Next Step</SubmitButton>
        <DebugFormValues
          values={onboardingBag.stepState.values?.engagement_details || {}}
        />
      </>
    );
  };

  function setupMocks(
    employmentId: string,
    employmentResponse = employmentGermanyResponse,
  ) {
    server.use(
      http.get(`*/employments/${employmentId}`, () => {
        return HttpResponse.json(employmentResponse);
      }),
      http.get(
        `*/employments/${employmentId}/json_schema_forms/engagement_details`,
        () => {
          return HttpResponse.json(engagementDetailsSchemaV1GermanySimplified);
        },
      ),
      http.patch(`*/employments/${employmentId}/engagement_details`, () => {
        return HttpResponse.json({ data: { status: 'ok' } });
      }),
    );
  }

  function renderOnboardingFlow(employmentId: string) {
    return render(
      <TestProviders>
        <OnboardingFlow
          employmentId={employmentId}
          render={EngagementDetailsForm}
          countryCode='DEU'
          companyId='test-company-id'
        />
      </TestProviders>,
    );
  }

  beforeEach(() => {
    queryClient.clear();
    mockOnSubmit.mockClear();
    mockOnSuccess.mockClear();
    mockOnError.mockClear();
  });

  describe('conditional field visibility', () => {
    it('should not show working_days when has_similar_roles is not set', async () => {
      const employmentId = generateUniqueEmploymentId();
      setupMocks(employmentId);

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await assertWorkingDaysVisible(false);
    });

    it('should not show working_days when has_similar_roles is no', async () => {
      const employmentId = generateUniqueEmploymentId();
      setupMocks(employmentId);

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await fillHasSimilarRoles('No');

      await assertWorkingDaysVisible(false);
    });

    it('should show working_days when has_similar_roles is yes', async () => {
      const employmentId = generateUniqueEmploymentId();
      setupMocks(employmentId);

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await fillHasSimilarRoles('Yes');

      await assertWorkingDaysVisible(true);
    });
  });

  describe('default value preloading', () => {
    it('should preload working_days default when has_similar_roles is set to yes', async () => {
      const employmentId = generateUniqueEmploymentId();
      setupMocks(employmentId);

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await assertWorkingDaysVisible(false);

      await fillHasSimilarRoles('Yes');

      await assertWorkingDaysVisible(true);

      await assertWorkingDaysValue(getDefaultWorkingDays());
    });

    it('should apply default only when field is empty', async () => {
      const employmentId = generateUniqueEmploymentId();
      const customWorkingDays = ['saturday'];

      setupMocks(
        employmentId,
        employmentGermanyResponseWithExistingData({
          has_similar_roles: 'yes',
          working_days: customWorkingDays,
        }),
      );

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await assertWorkingDaysVisible(true);

      await assertWorkingDaysValue(customWorkingDays);
    });

    it('should not apply default when field has null value', async () => {
      const employmentId = generateUniqueEmploymentId();

      setupMocks(
        employmentId,
        employmentGermanyResponseWithExistingData({
          has_similar_roles: 'yes',
          working_days: null,
        }),
      );

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await assertWorkingDaysVisible(true);

      await waitFor(() => {
        const formValuesElement = screen.getByTestId('debug-form-values');
        const values = JSON.parse(formValuesElement.textContent || '{}');
        expect(values.working_days).toBeNull();
      });
    });
  });

  describe('value persistence when toggling conditions', () => {
    it('should preserve default value when toggling has_similar_roles', async () => {
      const employmentId = generateUniqueEmploymentId();
      setupMocks(employmentId);

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();

      await fillHasSimilarRoles('Yes');
      await assertWorkingDaysValue(getDefaultWorkingDays());

      await fillHasSimilarRoles('No');
      await assertWorkingDaysVisible(false);

      await fillHasSimilarRoles('Yes');
      await assertWorkingDaysVisible(true);

      await assertWorkingDaysValue(getDefaultWorkingDays());
    });

    it('should preserve existing value when toggling conditions', async () => {
      const employmentId = generateUniqueEmploymentId();
      const existingValue = ['monday', 'wednesday', 'friday'];

      setupMocks(
        employmentId,
        employmentGermanyResponseWithExistingData({
          has_similar_roles: 'yes',
          working_days: existingValue,
        }),
      );

      renderOnboardingFlow(employmentId);

      await waitForFormToLoad();
      await assertWorkingDaysValue(existingValue);

      await fillHasSimilarRoles('No');
      await assertWorkingDaysVisible(false);

      await fillHasSimilarRoles('Yes');
      await assertWorkingDaysVisible(true);

      await assertWorkingDaysValue(existingValue);
    });
  });
});
