import {
  REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE,
  REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE,
} from '@/src/flows/ContractorOnboarding/constants';

export const ServicesAndDeliverablesAiStatementDescription = ({
  isContractorOfRecord,
}: {
  isContractorOfRecord: boolean;
}) => {
  const message = isContractorOfRecord
    ? REMOTE_AI_SERVICES_AND_DELIVERABLES_COR_ERROR_MESSAGE
    : REMOTE_AI_SERVICES_AND_DELIVERABLES_ERROR_MESSAGE;

  return <>{message}</>;
};
