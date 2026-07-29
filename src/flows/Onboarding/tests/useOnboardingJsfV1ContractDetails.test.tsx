import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  contractDetailsSchemaV1Italy,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

const findField = (fields: $TSFixMe[] = [], name: string) =>
  fields.find((field) => field.name === name);

const findMondayField = (fields: $TSFixMe[] = []) => {
  const dailySchedule = findField(fields, 'daily_schedule');
  const schedule = findField(dailySchedule?.fields, 'schedule');
  return findField(schedule?.fields, 'monday');
};

describe('useOnboarding jsf v1 contract details', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
          data: {
            properties: {
              name: { type: 'string', title: 'Name' },
            },
          },
        });
      }),
      http.get('*/v1/countries/ITA/contract_details*', () => {
        return HttpResponse.json(contractDetailsSchemaV1Italy);
      }),
    );
  });

  it('should show the hours of a schedule that was hidden by a previous choice', async () => {
    const { result } = renderHook(
      () =>
        useOnboarding({
          companyId: 'test-company-id',
          countryCode: 'ITA',
          employmentId: 'test-employment-id',
          skipSteps: ['select_country'],
        }),
      { wrapper: TestProviders },
    );

    act(() => {
      result.current.goTo('contract_details');
    });

    await waitFor(() => {
      expect(findField(result.current.fields, 'schedule_type')).toBeDefined();
    });

    const values = {
      daily_schedule: {
        selected_days: ['monday'],
        schedule: { monday: { start_time: '09:00' } },
      },
    };

    await act(async () => {
      await result.current.checkFieldUpdates({
        ...values,
        schedule_type: 'flexible',
      });
    });

    expect(findField(result.current.fields, 'daily_schedule').isVisible).toBe(
      false,
    );

    await act(async () => {
      await result.current.checkFieldUpdates({
        ...values,
        schedule_type: 'core_business_hours',
      });
    });

    expect(findField(result.current.fields, 'daily_schedule').isVisible).toBe(
      true,
    );
    expect(findMondayField(result.current.fields).isVisible).toBe(true);
  });
});
