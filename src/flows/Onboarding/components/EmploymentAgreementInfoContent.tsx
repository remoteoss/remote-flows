import {
  buildZendeskURL,
  zendeskArticles,
} from '@/src/components/shared/zendesk-drawer/utils';
import { cn } from '@/src/internals';

export const EmploymentAgreementInfoContent = () => {
  return (
    <>
      <div
        className={cn('RemoteFlows__EmploymentAgreementInfoContent__InfoBox')}
      >
        <p
          className={cn(
            'RemoteFlows__EmploymentAgreementInfoContent__InfoBoxText',
          )}
        >
          You are previewing a draft version of our employment agreement
          template for this specific hire in this specific country, based on the
          selections you made on the previous screens.
        </p>
      </div>

      <p
        className={cn(
          'RemoteFlows__EmploymentAgreementInfoContent__Description',
        )}
      >
        Remote's agreements are drafted by local employment and labor law
        experts to ensure compliance, balance, and efficiency.
      </p>

      <div>
        <p
          className={cn(
            'RemoteFlows__EmploymentAgreementInfoContent__WarningTitle',
          )}
        >
          We strongly discourage customizations or redlining.
        </p>
        <p
          className={cn(
            'RemoteFlows__EmploymentAgreementInfoContent__Description',
          )}
        >
          Modifying agreements can:
        </p>
        <ul
          className={cn(
            'RemoteFlows__EmploymentAgreementInfoContent__List list-disc list-inside',
          )}
        >
          <li
            className={cn(
              'RemoteFlows__EmploymentAgreementInfoContent__ListItem',
            )}
          >
            Create compliance risks
          </li>
          <li
            className={cn(
              'RemoteFlows__EmploymentAgreementInfoContent__ListItem',
            )}
          >
            Jeopardize enforceability
          </li>
          <li
            className={cn(
              'RemoteFlows__EmploymentAgreementInfoContent__ListItem',
            )}
          >
            Increase the risk of misemployment
          </li>
        </ul>
      </div>

      <p
        className={cn(
          'RemoteFlows__EmploymentAgreementInfoContent__Description',
        )}
      >
        If you have questions or believe a change is necessary, please do not
        invite the employee. Instead, save this invitation as a draft and
        contact your Account Executive or Customer Success Manager at Remote.
      </p>

      <p
        className={cn(
          'RemoteFlows__EmploymentAgreementInfoContent__Description',
        )}
      >
        If neither is available, please reach out to{' '}
        <a
          href='mailto:help@remote.com'
          className={cn('RemoteFlows__EmploymentAgreementInfoContent__Link')}
          target='_blank'
          rel='noopener noreferrer'
        >
          help@remote.com ↗
        </a>
        . Our Legal team will review and, where possible, align your needs with
        local compliance requirements, before inviting the employee, ensuring a
        smooth onboarding process.
      </p>

      <p
        className={cn(
          'RemoteFlows__EmploymentAgreementInfoContent__Description',
        )}
      >
        For guidance, see our{' '}
        <a
          className={cn('RemoteFlows__EmploymentAgreementInfoContent__Link')}
          href={buildZendeskURL(zendeskArticles.employmentAgreements)}
          target='_blank'
          rel='noopener noreferrer'
        >
          Agreement Engagement Guide ↗
        </a>{' '}
        to understand what can (and can't) be modified.
      </p>
    </>
  );
};
