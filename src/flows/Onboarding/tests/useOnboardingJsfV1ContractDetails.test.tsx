import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOnboarding } from '@/src/flows/Onboarding/hooks';
import { $TSFixMe } from '@/src/types/remoteFlows';
import { TestProviders } from '@/src/tests/testHelpers';

const mockGetV1CountriesCountryCodeForm = vi.fn();
const mockGetV1EmploymentsEmploymentIdBenefitOffersSchema = vi.fn();
const mockPostV1Employments = vi.fn();
const mockPatchV1EmploymentsEmploymentId2 = vi.fn();
const mockPutV1EmploymentsEmploymentIdBenefitOffers = vi.fn();
const mockPostV1EmploymentsEmploymentIdContractEligibility = vi.fn();

vi.mock('@/src/client', () => ({
  getV1CountriesCountryCodeForm: (...args: $TSFixMe[]) =>
    mockGetV1CountriesCountryCodeForm(...args),
  getV1EmploymentsEmploymentIdBenefitOffersSchema: (...args: $TSFixMe[]) =>
    mockGetV1EmploymentsEmploymentIdBenefitOffersSchema(...args),
  postV1Employments: (...args: $TSFixMe[]) => mockPostV1Employments(...args),
  patchV1EmploymentsEmploymentId2: (...args: $TSFixMe[]) =>
    mockPatchV1EmploymentsEmploymentId2(...args),
  putV1EmploymentsEmploymentIdBenefitOffers: (...args: $TSFixMe[]) =>
    mockPutV1EmploymentsEmploymentIdBenefitOffers(...args),
  postV1EmploymentsEmploymentIdContractEligibility: (...args: $TSFixMe[]) =>
    mockPostV1EmploymentsEmploymentIdContractEligibility(...args),
}));

/**
 * Trimmed down version of the Italy APL contract details schema: daily_schedule
 * is hidden unless schedule_type is core_business_hours, and it holds the
 * selected_days that decide which day of its own schedule is shown.
 */
const contractDetailsSchemaJsfV1 = {
  additionalProperties: false,
  allOf: [
    {
      else: {
        properties: {
          daily_schedule: false,
        },
      },
      if: {
        properties: {
          schedule_type: {
            const: 'core_business_hours',
          },
        },
        required: ['schedule_type'],
      },
      then: {
        required: ['daily_schedule'],
      },
    },
  ],
  properties: {
    daily_schedule: {
      allOf: [
        {
          else: {
            properties: {
              schedule: {
                properties: {
                  monday: false,
                },
              },
            },
          },
          if: {
            properties: {
              selected_days: {
                contains: {
                  pattern: 'monday',
                },
              },
            },
            required: ['selected_days'],
          },
          then: {
            properties: {
              schedule: {
                required: ['monday'],
              },
            },
          },
        },
      ],
      properties: {
        schedule: {
          properties: {
            monday: {
              properties: {
                start_time: {
                  title: 'Start time',
                  type: 'string',
                  'x-jsf-presentation': {
                    inputType: 'time',
                  },
                },
              },
              title: 'Monday',
              type: 'object',
              'x-jsf-presentation': {
                inputType: 'fieldset',
              },
            },
          },
          title: 'Core working hours',
          type: 'object',
          'x-jsf-presentation': {
            inputType: 'fieldset',
          },
        },
        selected_days: {
          items: {
            anyOf: [
              {
                const: 'monday',
                title: 'Monday',
              },
            ],
          },
          title: 'Working days',
          type: 'array',
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
      },
      title: 'Daily schedule',
      type: 'object',
      'x-jsf-presentation': {
        inputType: 'fieldset',
      },
    },
    schedule_type: {
      oneOf: [
        {
          const: 'flexible',
          title: 'Flexible',
        },
        {
          const: 'core_business_hours',
          title: 'Flexible within core hours',
        },
      ],
      title: 'Employee work schedule',
      type: 'string',
      'x-jsf-presentation': {
        inputType: 'select',
      },
    },
  },
  required: ['schedule_type'],
  type: 'object',
  'x-rmt-meta': {
    jsfVersion: '1',
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

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

    mockGetV1CountriesCountryCodeForm.mockImplementation(
      ({ path }: { path: { form: string } }) =>
        Promise.resolve({
          data: {
            data:
              path.form === 'contract_details'
                ? contractDetailsSchemaJsfV1
                : {
                    properties: {
                      name: { type: 'string', title: 'Name' },
                    },
                  },
          },
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
