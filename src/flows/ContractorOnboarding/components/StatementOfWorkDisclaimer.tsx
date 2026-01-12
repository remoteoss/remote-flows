import { Statement } from '@/src/components/form/Statement';
import {
  contractorPlusProductIdentifier,
  contractorStandardProductIdentifier,
} from '@/src/flows/ContractorOnboarding/constants';

const CSA_DISCLAIMER = {
  [contractorStandardProductIdentifier]:
    ' Remote provides its Contractor Services Agreement (CSA) “as is”; it does not constitute legal advice or create an attorney-client relationship with Remote. Remote is not liable for the content You enter herein and You are encouraged to seek independent legal advice tailored to the specific relationship between You and Your Contractor. By use of the CSA, You release Remote from liability for any claim for damages or losses which may arise related to Your use thereof.',
  [contractorPlusProductIdentifier]:
    'Remote provides its Contractor Services Agreement (CSA) “as is”; it does not constitute legal advice or create an attorney-client relationship with Remote. Remote is not liable for the content You enter herein and You are encouraged to seek independent legal advice tailored to the specific relationship between You and Your Contractor.',
};

export const StatementOfWorkDisclaimer = ({
  subscription,
}: {
  subscription: string;
}) => {
  return (
    <Statement
      title='Contractor Services Agreement'
      description={CSA_DISCLAIMER[subscription as keyof typeof CSA_DISCLAIMER]}
      severity='info'
    />
  );
};
