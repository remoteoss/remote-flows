import { Step } from '@/src/flows/useStepState';
import { Fields } from '@remoteoss/json-schema-form';

type StepKeys =
  | 'basic_information'
  | 'contract_details'
  | 'benefits'
  | 'review';

export const STEPS: Record<StepKeys, Step> = {
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

        if (field?.type === 'radio' || field?.type === 'select') {
          const option = (
            field.options as Array<{ value: string; label: string }>
          ).find((option) => option.value === value);

          if (option) {
            return [key, { prettyValue: option?.label, label: field?.label }];
          }
          return;
        }

        if (field?.type === 'countries') {
          return [
            key,
            { prettyValue: (value as string[])?.join(), label: field.label },
          ];
        }

        if (field?.type === 'fieldset') {
          return [
            key,
            prettifyFormValues(
              value as Record<string, unknown>,
              field.fields as Fields,
            ),
          ];
        }

        if (field) {
          return [key, { prettyValue: value, label: field.label }];
        }
      })
      .filter(Boolean),
  );
}
