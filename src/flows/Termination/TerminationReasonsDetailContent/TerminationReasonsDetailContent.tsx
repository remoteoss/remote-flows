import { cn } from '@/src/lib/utils';

const terminationReasonsList = [
  {
    label: 'Misconduct',
    description:
      'The employee is being dismissed due to unacceptable or improper behavior.',
  },
  {
    label: 'Performance',
    description:
      'When dismissing an employee for poor performance, employers are required by law to do so fairly. This means giving the employee reasonable opportunity to improve their performance prior to termination.',
  },
  {
    label: 'Workforce reduction',
    description:
      'The employee’s position is being made redundant, and a layoff is underway.',
  },
  {
    label: 'Values',
    description: 'The employee is misaligned with the company’s values.',
  },
  {
    label: 'Compliance issue',
    description:
      'Use this option if the employee violated key policies, processes or procedures. For example, they failed to comply with their employment agreement’s confidentiality clause.',
  },
  {
    label: 'Incapacity to perform inherent duties',
    description:
      'Use this option if the employee is physically or mentally unable to fulfill the work requirements of their role.',
  },
  {
    label: 'Mutual agreement',
    description:
      'Employee and employer made a mutual decision to end the relationship.',
  },
  {
    label: 'Decision to cancel hiring before the employee started',
    description:
      'Use this option only if the employee has not started work yet.',
  },
  {
    label: 'Job abandonment',
    description:
      'The employee has failed to appear for work; the Employer has been unsuccessful in establishing communications with the employee and does not know the employee’s whereabouts.',
  },
  {
    label: 'Dissatisfaction with EOR service',
    description: (
      <span>
        We’re sorry to see you go. If there is anything we can do to improve or
        if there is any remaining feedback you want to give us, please reach out
        to{' '}
        <a
          href='mailto:help@remote.com'
          target='_blank'
          rel='noopener noreferrer'
        >
          help@remote.com
        </a>
        .
      </span>
    ),
  },
  {
    label: 'End of fixed-term contract',
    description:
      'Use this option when the employee fixed-term contract is coming to an end and will not be renewed or extended.',
  },
];
export const TerminationReasonsDetailContent = () => {
  return (
    <>
      <h3 className={cn('RemoteFlows__TerminationReasonsDetailContent__Title')}>
        {' '}
        Why is this important?
      </h3>
      <p
        className={cn(
          'RemoteFlows__TerminationReasonsDetailContent__Description',
        )}
      >
        We're here to help you follow all applicable labor laws when terminating
        an employee. Here are all the legal reasons for termination. Please read
        them to make sure you enter the correct reason in the platform.
      </p>

      <h4
        className={cn('RemoteFlows__TerminationReasonsDetailContent__Subtitle')}
      >
        Termination Reasons
      </h4>
      <ul
        className={cn(
          'RemoteFlows__TerminationReasonsDetailContent__List list-disc list-inside',
        )}
      >
        {terminationReasonsList.map((reason) => (
          <li
            className={cn(
              'RemoteFlows__TerminationReasonsDetailContent__ListItem',
            )}
            key={reason.label}
          >
            <span
              className={cn(
                'RemoteFlows__TerminationReasonsDetailContent__ListItemLabel',
              )}
            >
              {reason.label}
            </span>
            <span
              className={cn(
                'RemoteFlows__TerminationReasonsDetailContent__ListItemDescription',
              )}
            >
              {reason.description}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
};
