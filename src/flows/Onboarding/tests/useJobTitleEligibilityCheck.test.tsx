import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { JobTitleEligibilityCheckResponse } from '@/src/client';
import { useJobTitleEligibilityCheck } from '@/src/flows/Onboarding/hooks/useJobTitleEligibilityCheck';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { JSFFields } from '@/src/types/remoteFlows';

const contractDetailsFields = [
  { name: 'additional_job_title_eligibility_check_slug', isVisible: false },
  { name: 'role_description', isVisible: true },
] as unknown as JSFFields;

const values = { role_description: 'Builds things' };

const eligibilityCheckResponse: JobTitleEligibilityCheckResponse = {
  data: {
    job_title_eligibility_check: {
      check_id: 'check-id',
      verdict: 'eligible',
    },
  },
};

const renderCheck = () =>
  renderHook(
    () =>
      useJobTitleEligibilityCheck({
        enabled: true,
        employmentId: 'test-employment-id',
        currentStepName: 'contract_details',
        contractDetailsFields,
        fallbackJobTitle: 'Engineer',
        submittedJobTitle: undefined,
        parseFormValues: async (formValues) => formValues,
        handleValidation: async () => null,
      }),
    { wrapper: TestProviders },
  );

describe('useJobTitleEligibilityCheck', () => {
  let requestCount: number;

  beforeEach(() => {
    queryClient.clear();
    requestCount = 0;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retries the check on the next blur after a failed request with unchanged params', async () => {
    let failing = true;
    let successCount = 0;
    server.use(
      http.post(
        '*/v2/employments/:employmentId/job-title-eligibility-check',
        () => {
          if (failing) {
            return HttpResponse.json(
              { message: 'Internal error' },
              { status: 500 },
            );
          }
          successCount += 1;
          return HttpResponse.json(eligibilityCheckResponse);
        },
      ),
    );

    const { result } = renderCheck();

    await act(() => result.current.check(values));
    expect(successCount).toBe(0);

    failing = false;
    await act(() => result.current.check(values));
    expect(successCount).toBe(1);
  });

  it('does not re-request a successful check when params are unchanged', async () => {
    server.use(
      http.post(
        '*/v2/employments/:employmentId/job-title-eligibility-check',
        () => {
          requestCount += 1;
          return HttpResponse.json(eligibilityCheckResponse);
        },
      ),
    );

    const { result } = renderCheck();

    await act(() => result.current.check(values));
    await act(() => result.current.check(values));

    expect(requestCount).toBe(1);
  });
});
