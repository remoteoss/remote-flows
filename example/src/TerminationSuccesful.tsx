import { useMagicLink } from '@remoteoss/remote-flows';
import type { Employment } from '@remoteoss/remote-flows';

export const TerminationSuccessful = ({
  employmentId,
  employment,
}: {
  employmentId: string;
  employment?: Employment;
}) => {
  const magicLink = useMagicLink();
  const handleAddMissingInformation = async () => {
    // TODO: if you're using the assertion method, it's better to create a proxy method in the backend to dynamically set the user_id
    const response = await magicLink.mutateAsync({
      user_id: import.meta.env.VITE_USER_ID,
      path: `/dashboard/people/${employmentId}?selectedTab=profile`,
    });
    // When using localhost:3000 with partners env, the redirect url didn't work due to cookies
    // if that happens, clear them or open the url in incognito mode
    window.open(response?.data?.data?.url, '_blank', 'noopener,noreferrer');
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
