import { createStatementProperty } from '@/src/components/form/jsf-utils/createFields';
import { ContractPreviewHeader } from '@/src/flows/ContractorOnboarding/components/ContractPreviewHeader';
import { ContractPreviewStatement } from '@/src/flows/ContractorOnboarding/components/ContractPreviewStatement';
import { contractorStandardProductIdentifier } from '@/src/flows/ContractorOnboarding/constants';
import { ContractorOnboardingFlowProps } from '@/src/flows/ContractorOnboarding/types';
import { JSFModify } from '@/src/flows/types';
import { FILE_TYPES, MAX_FILE_SIZE } from '@/src/lib/uploadConfig';
import { JSFCustomComponentProps } from '@/src/types/remoteFlows';
import { format } from 'date-fns';
import { FieldValues } from 'react-hook-form';

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
 * Merges internal jsfModify modifications with user-provided options for contract_details step
 * This abstracts the logic of applying internal field modifications (like dynamic descriptions)
 * while preserving user customizations
 */
export const buildContractDetailsJsfModify = (
  userJsfModify: JSFModify | undefined,
  provisionalStartDateDescription: string | undefined,
  selectedPricingPlan: string | undefined,
  fieldValues: FieldValues,
): JSFModify => {
  const isStandardPricingPlanSelected =
    isStandardPricingPlan(selectedPricingPlan);
  const provisionalStartDate =
    fieldValues?.service_duration?.provisional_start_date;
  const statement = showBackDateWarning(
    isStandardPricingPlanSelected,
    provisionalStartDate,
  );
  return {
    ...userJsfModify,
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
      },
    },
  };
};

/**
 * Builds the basic information jsf modify for the contractor onboarding flow
 * @param countryCode - The country code to use for the onboarding.
 * @param options - The options to use for the onboarding.
 * @returns The basic information jsf modify for the contractor onboarding flow
 */
export const buildBasicInformationJsfModify = (
  countryCode: string,
  options: ContractorOnboardingFlowProps['options'] | undefined,
) => {
  const isSaudiArabia = countryCode === 'SAU';
  const isUk = countryCode === 'GBR';

  if (!isSaudiArabia && !isUk) {
    return options?.jsfModify?.basic_information;
  }

  if (isUk) {
    return {
      ...options?.jsfModify?.basic_information,
      create: {
        ...options?.jsfModify?.basic_information?.create,
        ir35: {
          title: 'IR35 Status',
          description:
            "What's your contractor's employment status? - Add Zendesk help link here",
          oneOf: [
            {
              const: 'inside',
              title: 'Inside IR35 (deemed employee)',
            },
            {
              const: 'outside',
              title: 'Outside IR35',
            },
            {
              const: 'exempt',
              title: 'Exempt from IR35',
            },
          ],
          'x-jsf-presentation': {
            inputType: 'select',
          },
        },
        ir35_sds_file: {
          title: 'Upload SDS',
          description: 'Status determination statement',
          type: 'string',
          'x-jsf-presentation': {
            inputType: 'file',
            accept: FILE_TYPES.document,
            multiple: false,
            maxSize: MAX_FILE_SIZE,
            calculateDynamicProperties: (
              fieldValues: Record<string, unknown>,
            ) => {
              const ir35Status = fieldValues.ir35;
              return {
                isVisible: ir35Status === 'inside' || ir35Status === 'outside',
              };
            },
          },
        },
      },
      allOf: [
        {
          if: {
            properties: {
              ir35: {
                enum: ['inside', 'outside'],
              },
            },
          },
          then: {
            required: ['ir35_sds_file'],
          },
          else: {
            properties: {
              ir35_sds_file: false,
            },
          },
        },
      ],
      required: ['ir35'],
      orderRoot: (originalOrder: string[]) => {
        return [...originalOrder, 'ir35', 'ir35_sds_file'];
      },
    };
  }

  return {
    ...options?.jsfModify?.basic_information,
    create: {
      ...options?.jsfModify?.basic_information?.create,
      saudi_nationality_status: {
        title:
          'Is your contractor a Saudi Arabia national, or a non-Saudi national contracting via a local business entity or under a Special Privilege Iqama visa?',
        description: '',
        type: 'string',
        oneOf: [
          {
            const: 'national',
            description: '',
            title: 'Yes',
          },
          {
            const: 'non-national',
            description:
              'Please be aware that contracting with non-Saudi Arabia nationals that are not operating as a company or under a Special Privilege Iqama visa can lead to fines for operating without proper work authorization. If you are concerned, please speak with the Contractor and/or local Saudi Arabia counsel to ensure compliance.',
            title: 'No',
          },
        ],
        'x-jsf-presentation': {
          inputType: 'radio',
        },
      },
    },
    required: ['saudi_nationality_status'],
    orderRoot: (originalOrder: string[]) => {
      return [...originalOrder, 'saudi_nationality_status'];
    },
  };
};

export const buildContractPreviewJsfModify = (
  options: ContractorOnboardingFlowProps['options'] | undefined,
  fieldValues: FieldValues,
) => {
  const userFields = options?.jsfModify?.contract_preview?.fields;

  return {
    fields: {
      contract_preview_header: {
        ...userFields?.contract_preview_header,
        'x-jsf-presentation': {
          Component: (props: JSFCustomComponentProps) => {
            const CustomComponent =
              userFields?.contract_preview_header?.['x-jsf-presentation']
                ?.Component || ContractPreviewHeader;
            return <CustomComponent {...props} />;
          },
        },
      },
      contract_preview_statement: {
        ...userFields?.contract_preview_statement,
        'x-jsf-presentation': {
          Component: (props: JSFCustomComponentProps) => {
            const CustomComponent =
              userFields?.contract_preview_statement?.['x-jsf-presentation']
                ?.Component || ContractPreviewStatement;

            return (
              <CustomComponent
                reviewCompleted={Boolean(fieldValues?.review_completed)}
                {...props}
              />
            );
          },
        },
      },
      signature: {
        ...userFields?.signature,
        'x-jsf-presentation': {
          calculateDynamicProperties: (
            fieldValuesDynamicProperties: Record<string, unknown>,
          ) => {
            return {
              isVisible: Boolean(fieldValuesDynamicProperties.review_completed),
            };
          },
          // Merge any user-provided signature customizations
          ...userFields?.signature?.['x-jsf-presentation'],
        },
      },
    },
  };
};
