import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { http, HttpResponse } from 'msw';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import {
  contractDetailsSchemaV1DailySchedule,
  contractDetailsSchemaV1Germany,
  employmentDefaultResponse,
} from '@/src/flows/Onboarding/tests/fixtures';
import { server } from '@/src/tests/server';
import { queryClient, TestProviders } from '@/src/tests/testHelpers';
import { $TSFixMe } from '@/src/types/remoteFlows';

/**
 * Verifies the `daily_schedule` feature-flagged `jsfModify` wiring
 * (PAY-2868 Phase 4, `Onboarding/hooks.tsx`): the field only gets the
 * `DailyScheduleContainer` `Component` override when the `daily_schedule`
 * feature flag is on, a consumer-supplied override still receives the
 * enriched render props instead of being bypassed, and schemas without
 * `daily_schedule` are unaffected either way.
 */

const findField = (fields: $TSFixMe[] = [], name: string) =>
  fields.find((field) => field.name === name);

const mockCountry = (countryCode: string, schema: $TSFixMe) => {
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
              code: countryCode,
              name: 'Germany',
              alpha_2_code: 'DE',
              supported_json_schemas: ['employment_basic_information'],
            },
          },
        },
      });
    }),
    http.get(
      `*/v1/countries/${countryCode}/employment_basic_information*`,
      () => {
        return HttpResponse.json({
          data: { properties: { name: { type: 'string', title: 'Name' } } },
        });
      },
    ),
    http.get(`*/v1/countries/${countryCode}/contract_details*`, () => {
      return HttpResponse.json(schema);
    }),
  );
};

function renderDailyScheduleField(field: $TSFixMe) {
  const Component = field.Component;

  function Harness() {
    const methods = useForm({ defaultValues: { daily_schedule: undefined } });
    return (
      <FormProvider {...methods}>
        <Component
          {...field}
          value={methods.watch('daily_schedule')}
          setValue={(value: $TSFixMe) =>
            methods.setValue('daily_schedule', value)
          }
        />
      </FormProvider>
    );
  }

  return render(<Harness />, { wrapper: TestProviders });
}

describe('useOnboarding daily_schedule wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('injects the Component override when the daily_schedule flag is on', async () => {
    mockCountry('DEU', contractDetailsSchemaV1DailySchedule);

    const { result } = renderHook(
      () =>
        useOnboarding({
          companyId: 'test-company-id',
          countryCode: 'DEU',
          employmentId: 'test-employment-id',
          skipSteps: ['select_country'],
          options: { features: ['daily_schedule'] },
        }),
      { wrapper: TestProviders },
    );

    act(() => {
      result.current.goTo('contract_details');
    });

    await waitFor(() => {
      expect(findField(result.current.fields, 'daily_schedule')).toBeDefined();
    });

    const dailyScheduleField = findField(
      result.current.fields,
      'daily_schedule',
    );
    expect(dailyScheduleField.Component).toBeInstanceOf(Function);

    renderDailyScheduleField(dailyScheduleField);

    expect(
      await screen.findByRole('button', { name: 'Edit schedule' }),
    ).toBeInTheDocument();
  });

  it('leaves the field untouched when the daily_schedule flag is off', async () => {
    mockCountry('DEU', contractDetailsSchemaV1DailySchedule);

    const { result } = renderHook(
      () =>
        useOnboarding({
          companyId: 'test-company-id',
          countryCode: 'DEU',
          employmentId: 'test-employment-id',
          skipSteps: ['select_country'],
        }),
      { wrapper: TestProviders },
    );

    act(() => {
      result.current.goTo('contract_details');
    });

    await waitFor(() => {
      expect(findField(result.current.fields, 'daily_schedule')).toBeDefined();
    });

    expect(
      findField(result.current.fields, 'daily_schedule').Component,
    ).toBeUndefined();
  });

  it('still lets a consumer-supplied Component render, with the enriched props', async () => {
    mockCountry('DEU', contractDetailsSchemaV1DailySchedule);

    const ConsumerComponent = (props: $TSFixMe) => (
      <div data-testid='consumer-daily-schedule'>
        {props.countryName} · {props.availableWorkDays?.join(',')}
      </div>
    );

    const { result } = renderHook(
      () =>
        useOnboarding({
          companyId: 'test-company-id',
          countryCode: 'DEU',
          employmentId: 'test-employment-id',
          skipSteps: ['select_country'],
          options: {
            features: ['daily_schedule'],
            jsfModify: {
              contract_details: {
                fields: {
                  daily_schedule: {
                    'x-jsf-presentation': { Component: ConsumerComponent },
                  },
                },
              },
            },
          },
        }),
      { wrapper: TestProviders },
    );

    act(() => {
      result.current.goTo('contract_details');
    });

    await waitFor(() => {
      expect(findField(result.current.fields, 'daily_schedule')).toBeDefined();
    });

    renderDailyScheduleField(
      findField(result.current.fields, 'daily_schedule'),
    );

    expect(
      await screen.findByTestId('consumer-daily-schedule'),
    ).toHaveTextContent('Germany · monday,tuesday');
    expect(
      screen.queryByRole('button', { name: 'Edit schedule' }),
    ).not.toBeInTheDocument();
  });

  it('is a no-op for schemas without a daily_schedule field', async () => {
    mockCountry('DEU', contractDetailsSchemaV1Germany);

    const { result } = renderHook(
      () =>
        useOnboarding({
          companyId: 'test-company-id',
          countryCode: 'DEU',
          employmentId: 'test-employment-id',
          skipSteps: ['select_country'],
          options: { features: ['daily_schedule'] },
        }),
      { wrapper: TestProviders },
    );

    act(() => {
      result.current.goTo('contract_details');
    });

    await waitFor(() => {
      expect(result.current.fields.length).toBeGreaterThan(0);
    });

    expect(findField(result.current.fields, 'daily_schedule')).toBeUndefined();
  });
});
