import { zendeskArticles } from '@/src/components/shared/zendesk-drawer/utils';
import { ZendeskTriggerButton } from '@/src/components/shared/zendesk-drawer/ZendeskTriggerButton';
import { cn } from '@/src/internals';

const terminationSteps = [
  'You submit your termination request.',
  'Remote reviews your request along with the employment agreement, local labor laws, and any collective bargaining agreements in place.',
  'A lifecycle specialist contacts you if they need additional details. Sometimes they will request a call.',
  'Depending on the country-specific laws and the terms of the employment agreement, Remote may need to seek additional legal advice. We’ll let you know if there are additional charges before proceeding.',
  'Terms and conditions for the termination are finalized.',
  'You verbally communicate the termination to the employee.',
  'Remote shares termination documents with the employee.',
  'The employee signs the termination documents if required.',
  'Remote processes the final salary and offboards the employee.',
];

export const TerminationDialogInfoContent = () => {
  return (
    <>
      <h3 className={cn('RemoteFlows__TerminationDialogInfoContent__Title')}>
        Please read carefully before you continue
      </h3>
      <p
        className={cn('RemoteFlows__TerminationDialogInfoContent__Description')}
      >
        Please do not inform the employee of the termination. Remote will lead
        communication with them after you submit this form and they finalize the
        termination terms.
      </p>
      <p
        className={cn(
          'RemoteFlows__TerminationDialogInfoContent__Description RemoteFlows__TerminationDialogInfoContent__FollowUpDescription',
        )}
      >
        If you already informed them, that's okay. Remote will ask for the
        details regarding that communication and they'll take it from there.
      </p>

      <ZendeskTriggerButton
        className={cn(
          'RemoteFlows__TerminationDialogInfoContent__ZendeskTriggerButton text-sm',
        )}
        zendeskId={zendeskArticles.terminationEmployeeCommunication}
      >
        Learn more about employee communication
      </ZendeskTriggerButton>

      <h3
        className={cn(
          'RemoteFlows__TerminationDialogInfoContent__ProcessTitle',
        )}
      >
        The termination process
      </h3>

      <ul
        className={cn(
          'RemoteFlows__TerminationDialogInfoContent__ProcessList list-disc list-inside',
        )}
      >
        {terminationSteps.map((step, index) => (
          <li
            key={index}
            className={cn(
              'RemoteFlows__TerminationDialogInfoContent__ProcessListItem',
            )}
          >
            {step}
          </li>
        ))}
      </ul>
    </>
  );
};
