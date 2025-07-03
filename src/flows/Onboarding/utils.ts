import { Employment } from '@/src/flows/Onboarding/types';
import { Step } from '@/src/flows/useStepState';
import { Fields } from '@remoteoss/json-schema-form';

type StepKeys =
  | 'select_country'
  | 'basic_information'
  | 'contract_details'
  | 'benefits'
  | 'review';

export const STEPS: Record<StepKeys, Step<StepKeys>> = {
  select_country: {
    index: 0,
    name: 'select_country',
  },
  basic_information: { index: 1, name: 'basic_information' },
  contract_details: { index: 2, name: 'contract_details' },
  benefits: { index: 3, name: 'benefits' },
  review: { index: 4, name: 'review' },
} as const;

export const STEPS_WITHOUT_SELECT_COUNTRY: Record<
  Exclude<StepKeys, 'select_country'>,
  Step<Exclude<StepKeys, 'select_country'>>
> = {
  basic_information: { index: 0, name: 'basic_information' },
  contract_details: { index: 1, name: 'contract_details' },
  benefits: { index: 2, name: 'benefits' },
  review: { index: 3, name: 'review' },
} as const;

/**
 * Function to prettify form values. Returns a pretty value and label for each field.
 * @param values - Form values to prettify
 * @param fields - Form fields
 * @returns Prettified form values
 */
// @ts-expect-error need to check function return type
export function prettifyFormValues(
  values: Record<string, unknown>,
  fields: Fields | undefined,
) {
  if (!fields) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(values)
      // @ts-expect-error need to check function return type
      .map(([key, value]) => {
        if (value === undefined) {
          return [key, undefined];
        }

        const field = fields.find((field) => field.name === key);

        if (field?.isVisible === false || field?.deprecated) {
          return [key, undefined];
        }

        if (field?.type === 'radio' || field?.type === 'select') {
          const option = (
            field.options as Array<{ value: string; label: string }>
          ).find((option) => option.value === value);

          if (option) {
            return [
              key,
              {
                prettyValue: option?.label,
                label: field?.label,
                inputType: field?.type,
              },
            ];
          }
          return;
        }

        if (field?.type === 'checkbox' && field?.const) {
          return [
            key,
            { prettyValue: true, label: field.label, inputType: field?.type },
          ];
        }

        if (field?.type === 'countries' && Array.isArray(value)) {
          return [
            key,
            {
              prettyValue: value.join(),
              label: field.label,
              inputType: field?.type,
            },
          ];
        }

        if (field?.type === 'fieldset') {
          // @ts-expect-error need to check function return type
          const prettiedFieldset = prettifyFormValues(
            value as Record<string, unknown>,
            field.fields as Fields,
          );

          // Handles benefits fieldset in specific
          if (!prettiedFieldset.label && prettiedFieldset.value) {
            const prettyValue: Record<string, unknown> = {
              ...prettiedFieldset.value,
              label: field.label,
              inputType: field?.type,
            };
            return [key, prettyValue];
          }

          return [key, prettiedFieldset];
        }

        if (field?.type === 'money') {
          return [
            key,
            {
              prettyValue: value,
              label: field.label,
              inputType: field?.type,
              currency: field?.currency,
            },
          ];
        }

        if (field) {
          return [
            key,
            { prettyValue: value, label: field.label, inputType: field?.type },
          ];
        }
      })
      .filter(Boolean),
  );
}

/**
 * Array of employment statuses that are allowed to proceed to the review step.
 * These statuses indicate that the employment is in a final state and the employment cannot be modified further.
 * @type {Employment['status'][]}
 * @constant
 */
export const reviewStepAllowedEmploymentStatus: Employment['status'][] = [
  'invited',
  'created_awaiting_reserve',
  'created_reserve_paid',
];
