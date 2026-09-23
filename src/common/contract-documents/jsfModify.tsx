import { addYears, format } from 'date-fns';
import { FieldValues } from 'react-hook-form';
import { ChangeEvent } from 'react';

import { parseLocalDate } from '@/src/common/dates';
import { createStatementProperty } from '@/src/components/form/jsf-utils/createFields';
import {
  contractorStandardProductIdentifier,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE,
} from '@/src/common/contract-documents/constants';
import { ContractorContractDetailsFormPayload } from '@/src/common/contract-documents/types';
import { JSFModify } from '@/src/flows/types';

const isStandardPricingPlan = (pricingPlan: string | undefined) => {
  return pricingPlan === contractorStandardProductIdentifier;
};

const showBackDateWarning = (
  isStandardPricingPlanSelected: boolean,
  provisionalStartDate: string | undefined,
) => {
  const isStartDateBackdated =
    provisionalStartDate &&
    // Compare full days omitting time of the day
    provisionalStartDate < format(new Date(), 'yyyy-MM-dd');

  if (!isStandardPricingPlanSelected && isStartDateBackdated) {
    return createStatementProperty({
      severity: 'warning',
      description:
        'Backdating the service start date is not supported in the selected Contractor Management plan.',
    });
  }

  return undefined;
};

/**
 * Handles changes to the services_and_deliverables field to clear AI warning state
 */
function onServicesAndDeliverablesChange(
  _event: ChangeEvent<HTMLTextAreaElement>,
  values: ContractorContractDetailsFormPayload & {
    services_and_deliverables_ai_warning: string;
    services_and_deliverables_error_skippable: boolean;
  },
  setValues: (
    formValues: Partial<
      ContractorContractDetailsFormPayload & {
        services_and_deliverables_ai_warning: string;
        services_and_deliverables_error_skippable: boolean;
      }
    >,
  ) => void,
) {
  setValues({
    ...values,
    services_and_deliverables_ai_warning: '',
    services_and_deliverables_error_skippable: false,
  });
}

/**
 * Merges internal jsfModify modifications with user-provided options for contract_details step
 * This abstracts the logic of applying internal field modifications (like dynamic descriptions)
 * while preserving user customizations
 */
export const buildContractDetailsJsfModify = (
  userJsfModify: JSFModify | undefined,
  provisionalStartDateDescription: string | undefined,
  selectedPricingPlan: string | undefined,
  fieldValues: FieldValues,
  isContractorOfRecord: boolean,
): JSFModify => {
  const isStandardPricingPlanSelected =
    isStandardPricingPlan(selectedPricingPlan);
  const provisionalStartDate =
    fieldValues?.service_duration?.provisional_start_date;
  const statement = showBackDateWarning(
    isStandardPricingPlanSelected,
    provisionalStartDate,
  );
  const AiStatementWarning = createStatementProperty({
    severity: 'warning',
    title: 'Possible misclassification risk',
    description: isContractorOfRecord
      ? REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE
      : REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE,
  });
  return {
    ...userJsfModify,
    create: {
      ...userJsfModify?.create,
      services_and_deliverables_ai_warning: {
        type: 'string',
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
      services_and_deliverables_error_skippable: {
        type: 'boolean',
        'x-jsf-presentation': {
          inputType: 'hidden',
        },
      },
    },
    fields: {
      ...userJsfModify?.fields,
      ...{
        'service_duration.provisional_start_date': {
          description: provisionalStartDateDescription,
          'x-jsf-presentation': {
            minDate: !isStandardPricingPlanSelected
              ? format(new Date(), 'yyyy-MM-dd')
              : undefined,
            ...statement,
          },
        },
        'service_duration.expiration_date': {
          'x-jsf-presentation': {
            calculateDynamicProperties: (formValues: FieldValues) => {
              const maxDate =
                isContractorOfRecord &&
                formValues.service_duration?.provisional_start_date
                  ? addYears(
                      parseLocalDate(
                        formValues.service_duration.provisional_start_date,
                      ),
                      1,
                    )
                  : undefined;
              return {
                maxDate: maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined,
              };
            },
          },
        },
        services_and_deliverables: {
          onChange: onServicesAndDeliverablesChange,
          'x-jsf-presentation': {
            calculateDynamicProperties: (formValues: FieldValues) => ({
              statement: formValues.services_and_deliverables_ai_warning
                ? AiStatementWarning.statement
                : undefined,
            }),
          },
        },
      },
    },
  };
};
