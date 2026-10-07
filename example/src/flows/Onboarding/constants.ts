import { JSFModifyField } from '@remoteoss/remote-flows';
import { CustomDailySchedule } from './CustomDailyScheduleExample';
import {
  ONBOARDING_JSON_SCHEMA_VERSION,
  ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY,
} from './jsonSchemaVersions';

export const ONBOARDING_OPTIONS = {
  features: [
    'onboarding_reserves',
    'dynamic_steps',
    'ea_preview',
    'pre_onboarding_requirements',
    'daily_schedule',
    'job_title_eligibility',
  ] as const,
  jsonSchemaVersion: ONBOARDING_JSON_SCHEMA_VERSION,
  jsonSchemaVersionByCountry: ONBOARDING_JSON_SCHEMA_VERSION_BY_COUNTRY,
  jsfModify: {
    basic_information: {
      fields: {
        // Use a function to modify a single option in place instead of
        // hardcoding the full options list (labels/values you don't own).
        login_email: (field: JSFModifyField) => ({
          'x-jsf-presentation': {
            options: field['x-jsf-presentation']?.options?.map(
              (option: { value: string }) =>
                option.value === 'work'
                  ? { ...option, description: 'Select...' }
                  : option,
            ),
          },
        }),
      },
    },
    contract_details: {
      fields: {
        daily_schedule: {
          presentation: {
            Component: CustomDailySchedule,
          },
        },
      },
    },
  },
};
