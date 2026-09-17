import {
  contractorPlusProductIdentifier,
  contractorStandardProductIdentifier,
  REMOTE_AI_ERROR_SOURCE,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE,
} from '@/src/common/contract-documents/constants';
import { AiValidationError } from '@/src/common/contract-documents/types';
import { isMutationError } from '@/src/lib/mutations';

export const calculateProvisionalStartDateDescription = (
  employmentProvisionalStartDate: string | undefined,
  fieldProvisionalStartDate: string | undefined,
  currentDateLabel = 'the date you provided in the Basic Information step',
): string | undefined => {
  const datesNotMatching =
    employmentProvisionalStartDate &&
    fieldProvisionalStartDate &&
    employmentProvisionalStartDate !== fieldProvisionalStartDate;

  if (datesNotMatching) {
    const datesDontMatchWarning = `This date does not match ${currentDateLabel} - ${
      employmentProvisionalStartDate
    } - and will override it only when both parties have signed the contract.`;
    return `When the contractor will start providing service to your company. ${datesDontMatchWarning}`;
  }
  return undefined;
};

/**
 * Checks if the selected pricing plan is CM (standard) or CM+ (plus)
 */
export const isCMOrCMPlus = (subscription: string | undefined): boolean => {
  return (
    subscription === contractorStandardProductIdentifier ||
    subscription === contractorPlusProductIdentifier
  );
};

export function transformAiErrorResponse(
  isContractorOfRecord: boolean,
): string {
  const remoteAiErrorMessage = isContractorOfRecord
    ? REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE
    : REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE;
  return remoteAiErrorMessage;
}

/**
 * Extracts the AI validation error from a failed contract-document creation, if that is
 * what the failure was.
 */
export const extractAiValidationError = (
  error: unknown,
): AiValidationError | null => {
  if (!isMutationError(error)) {
    return null;
  }

  const rawError = error.normalizedErrors.services_and_deliverables;

  // The backend's normalize_errors wraps non-list values in an array,
  // so the AI validation error object arrives as a single-element array.
  const servicesAndDeliverablesError = (
    Array.isArray(rawError) ? rawError[0] : rawError
  ) as
    | {
        error: string[];
        source: string;
        skippable: boolean;
      }
    | undefined;

  if (servicesAndDeliverablesError?.source === REMOTE_AI_ERROR_SOURCE) {
    return {
      error: servicesAndDeliverablesError.error,
      source: servicesAndDeliverablesError.source,
      skippable: servicesAndDeliverablesError.skippable,
    };
  }
  return null;
};
