import { useMagicLink, useUserId } from '@remoteoss/remote-flows';
import type { Employment } from '@remoteoss/remote-flows';

export const TerminationSuccessful = ({
  employmentId,
  employment,
}: {
  employmentId: string;
  employment?: Employment;
}) => {
  const userId = useUserId();
  const magicLink = useMagicLink();
  const handleAddMissingInformation = async () => {
    if (userId) {
      const response = await magicLink.mutateAsync({
        user_id: userId,
        path: `/dashboard/people/${employmentId}?selectedTab=profile`,
      });
      window.open(response?.data?.data?.url, '_blank');
    }
  };
  return (
    <div>
      <h1>Termination request successfully submitted</h1>
      <p className='text-sm mb-3'>
        We’re reviewing your request and will get back to you in 1 to 2 days. If
        there is any missing information from{' '}
        {employment?.basic_information?.name as string} profile (for example,
        expenses or commissions), please add that information now.
      </p>
      <div className='flex gap-2'>
        <button>Return to Requests</button>
        <button onClick={handleAddMissingInformation}>
          Add missing information
        </button>
      </div>
    </div>
  );
};
